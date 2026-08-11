#!/usr/bin/env node
// Bootstrap a framework example app from scratch, reusing the checked-in demo
// source and SDK wiring. See scripts/bootstrap/README.md for the full model.
//
//   node scripts/bootstrap-app.mjs <framework> [options]
//
// frameworks: web | react-native (rn) | expo | flutter | ios | android | kmp
//
// options:
//   --apply            write into the real <framework>/PulsarApp (default: a
//                      throwaway staging dir under .bootstrap-out/)
//   --into <dir>       write into a custom directory
//   --published        wire the published Pulsar SDK instead of local sources
//   --no-install       skip dependency install
//   --verify           run the framework's build/analyze check afterwards
//   --force            allow --apply even if the target has uncommitted changes
//   --dry-run          print the plan and exit without touching the filesystem
//   --list             list frameworks
//   -h, --help

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  repoRoot, color, step, info, warn, ok, run, capture, hasCommand,
  exists, rimraf, ensureDir, readJson, copyTracked, mergeDirInto,
  patchPackageJson, writeFile, removePaths, syncVersionCatalog, syncGradleWrapper,
} from './bootstrap/lib.mjs';
import { resolveRecipe, recipes, frameworkOrder } from './bootstrap/recipes.mjs';

// ── args ──
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--') || a.startsWith('-')));
const positionals = argv.filter((a) => !a.startsWith('-'));
const getOpt = (name) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : undefined;
};
const opts = {
  apply: flags.has('--apply'),
  into: getOpt('--into'),
  published: flags.has('--published'),
  install: !flags.has('--no-install'),
  verify: flags.has('--verify'),
  force: flags.has('--force'),
  dryRun: flags.has('--dry-run'),
};

if (flags.has('-h') || flags.has('--help') || (!positionals.length && !flags.has('--list'))) {
  printHelp();
  process.exit(positionals.length ? 0 : 1);
}
if (flags.has('--list')) {
  listFrameworks();
  process.exit(0);
}

const fwName = positionals[0];
const recipe = resolveRecipe(fwName);
if (!recipe) {
  console.error(color.red(`Unknown framework: ${fwName}`));
  listFrameworks();
  process.exit(1);
}

main().catch((err) => {
  console.error('\n' + color.red('✖ ' + err.message));
  process.exit(1);
});

async function main() {
  const versions = await readJson(path.join(repoRoot, 'sdk-versions.json'));
  const ctx = {
    local: !opts.published,
    dryRun: opts.dryRun,
    iosVersion: versions.ios.version,
    iosSwiftPackageUrl: versions.ios.swiftPackageUrl,
  };
  const appAbs = path.join(repoRoot, recipe.appDir);
  // Staging must sit next to the real app so the relative SDK wiring
  // (file:../Pulsar, vite alias ../Pulsar/src, project(":Pulsar"), etc.) still
  // resolves. Default: a sibling `.bootstrap-<name>` dir.
  const outDir = opts.into
    ? path.resolve(opts.into)
    : opts.apply
      ? appAbs
      : path.join(path.dirname(appAbs), `.bootstrap-${path.basename(appAbs)}`);

  console.log(color.bold(`\n Bootstrap ${recipe.title}`));
  info(`source of truth : ${recipe.appDir}`);
  info(`output          : ${path.relative(repoRoot, outDir) || '.'}${opts.apply ? color.yellow('   (--apply: overwrites the real app)') : color.dim('   (staging)')}`);
  info(`SDK wiring      : ${ctx.local ? 'local sources' : 'published artifact'}`);
  if (opts.dryRun) info(color.yellow('dry-run — no filesystem changes'));
  console.log('');

  if (opts.dryRun) {
    printPlan(recipe, ctx, outDir);
    return;
  }

  if (opts.apply && !opts.force) await assertClean(recipe.appDir);

  // 1. Build the app tree in an isolated temp dir. Content is always sourced
  //    from the git index, so the live app is untouched until final placement.
  const work = await fs.mkdtemp(path.join(os.tmpdir(), `pulsar-boot-${recipe.key}-`));
  const appTree = await buildTree(recipe, work, ctx);

  // 2. Place the result.
  step(`Placing result into ${path.relative(repoRoot, outDir) || '.'}`);
  await rimraf(outDir);
  await ensureDir(path.dirname(outDir));
  await mergeDirInto(appTree, outDir);
  await rimraf(work);

  // 3. Wiring that must run on the placed tree.
  await applyWiring(recipe, outDir, ctx);

  // 4. Install + optional verify.
  if (opts.install && recipe.install) {
    step('Installing dependencies');
    run(recipe.install[0], recipe.install.slice(1), { cwd: outDir });
  }
  if (opts.install && recipe.expoInstall) {
    step('Resolving Expo-managed deps (expo install)');
    run('npx', ['expo', 'install', ...recipe.expoInstall], { cwd: outDir });
  }
  if (opts.verify && recipe.verify) {
    step('Verifying');
    run(recipe.verify[0], recipe.verify.slice(1), { cwd: outDir });
  }

  console.log('');
  ok(color.green(`Done — ${recipe.title} bootstrapped at ${path.relative(repoRoot, outDir) || '.'}`));
  if (recipe.postInstallHint) {
    console.log(color.dim('\n  Next steps:'));
    for (const line of recipe.postInstallHint.split('\n')) console.log(color.dim(`    ${line}`));
  }
  if (!opts.apply) {
    console.log(color.dim(`\n  Review the staged app, then re-run with --apply to replace ${recipe.appDir}.`));
  }
}

// Produce the base shell + content overlay in `work`; return the app tree path.
async function buildTree(recipe, work, ctx) {
  if (recipe.kind === 'cli') {
    step(`Scaffolding fresh shell (${recipe.scaffold.cmd} ${recipe.scaffold.args.join(' ')})`);
    run(recipe.scaffold.cmd, recipe.scaffold.args, { cwd: work });
    const tree = path.join(work, recipe.scaffold.producedDir);
    if (recipe.removeDefaults) {
      step('Removing scaffold defaults');
      await removePaths(tree, recipe.removeDefaults);
    }
    step('Overlaying demo content + config (verbatim from the live app)');
    const n = await copyTracked(recipe.appDir, recipe.content || [], tree);
    ok(`overlaid ${n} tracked files`);
    return tree;
  }

  if (recipe.kind === 'xcodegen') {
    const tree = path.join(work, 'app');
    await ensureDir(tree);
    step('Overlaying Swift content + tests + assets');
    const n = await copyTracked(recipe.appDir, recipe.content, tree);
    ok(`overlaid ${n} tracked files`);
    step('Writing declarative project.yml');
    await writeFile(path.join(tree, 'project.yml'), recipe.projectYml(ctx));
    return tree;
  }

  // template: the tracked tree IS the shell + content.
  const tree = path.join(work, 'app');
  await ensureDir(tree);
  step('Re-materializing frozen template (tracked files)');
  const n = await copyTracked(recipe.appDir, ['.'], tree);
  ok(`copied ${n} tracked files`);
  return tree;
}

async function applyWiring(recipe, outDir, ctx) {
  if (recipe.packageJson) {
    step('Wiring package.json (merge SDK + extra deps)');
    await patchPackageJson(path.join(outDir, 'package.json'), recipe.packageJson);
  }
  if (recipe.pubspecDependency) {
    step('Wiring pubspec.yaml (local plugin path dep)');
    await injectPubspecDependency(path.join(outDir, 'pubspec.yaml'), recipe.pubspecDependency);
  }
  if (recipe.kind === 'xcodegen') {
    if (hasCommand('xcodegen')) {
      step('Generating PulsarApp.xcodeproj (xcodegen)');
      run(recipe.generate[0], recipe.generate.slice(1), { cwd: outDir });
    } else {
      warn('xcodegen not found — project.yml written but .xcodeproj not generated.');
      warn('Install with `brew install xcodegen`, then run `xcodegen generate` in the output dir.');
    }
  }
  if (recipe.toolchainKey) {
    await syncToolchain(recipe, outDir);
  }
  if (recipe.localProperties) {
    await writeLocalProperties(outDir);
  }
}

// Frameworks with no scaffolder can't fetch "latest" — sync their toolchain
// (Gradle wrapper + version-catalog entries) from the central manifest instead.
async function syncToolchain(recipe, outDir) {
  const toolchain = await readJson(path.join(repoRoot, 'scripts/bootstrap/toolchain.json'));
  const block = toolchain[recipe.toolchainKey];
  if (!block) return warn(`no toolchain entry for '${recipe.toolchainKey}'`);
  step('Syncing toolchain from toolchain.json');
  if (block.versions) {
    await syncVersionCatalog(path.join(outDir, 'gradle/libs.versions.toml'), block.versions);
  }
  if (block.gradle) {
    await syncGradleWrapper(path.join(outDir, 'gradle/wrapper/gradle-wrapper.properties'), block.gradle);
  }
}

async function injectPubspecDependency(pubspecPath, { name, path: depPath }) {
  let text = await fs.readFile(pubspecPath, 'utf8');
  if (text.includes(`${name}:`)) return info('pubspec already has the plugin dep');
  const patched = text.replace(
    /(dependencies:\n(?:\s+flutter:\n\s+sdk: flutter\n))/,
    `$1  ${name}:\n    path: ${depPath}\n`
  );
  if (patched === text) {
    warn('Could not locate the dependencies block in pubspec.yaml — add the path dep manually.');
    return;
  }
  await fs.writeFile(pubspecPath, patched);
  info('added pulsar_haptics path dependency');
}

async function writeLocalProperties(outDir) {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) {
    warn('ANDROID_HOME not set — skipping local.properties (create it with sdk.dir=<path>).');
    return;
  }
  await writeFile(path.join(outDir, 'local.properties'), `sdk.dir=${sdk}\n`);
}

async function assertClean(appRel) {
  const out = capture('git', ['status', '--porcelain', '--', appRel]).trim();
  if (out) {
    throw new Error(
      `${appRel} has uncommitted changes — refusing to --apply.\n` +
      `Commit or stash first, or pass --force to overwrite anyway.\n${out}`
    );
  }
}

function printPlan(recipe, ctx, outDir) {
  step('PLAN');
  const line = (k, v) => console.log(`   ${color.dim(k.padEnd(10))} ${v}`);
  line('kind', recipe.kind);
  if (recipe.scaffold) line('scaffold', `${recipe.scaffold.cmd} ${recipe.scaffold.args.join(' ')}`);
  if (recipe.kind === 'template') line('scaffold', 'copy tracked files (no CLI exists)');
  if (recipe.kind === 'xcodegen') line('scaffold', 'overlay Swift + write project.yml + xcodegen generate');
  if (recipe.removeDefaults) line('remove', recipe.removeDefaults.join(', '));
  if (recipe.content) line('overlay', recipe.content.join(', '));
  if (recipe.packageJson) line('deps+', Object.keys(recipe.packageJson.dependencies || {}).join(', ') || '(none)');
  if (recipe.expoInstall) line('expo+', recipe.expoInstall.join(', '));
  if (recipe.pubspecDependency) line('pubspec+', `${recipe.pubspecDependency.name}: path ${recipe.pubspecDependency.path}`);
  if (recipe.toolchainKey) line('toolchain', `sync from toolchain.json[${recipe.toolchainKey}] → libs.versions.toml + gradle wrapper`);
  if (recipe.install) line('install', recipe.install.join(' '));
  if (recipe.verify) line('verify', recipe.verify.join(' '));
  line('output', path.relative(repoRoot, outDir) || '.');
  console.log('\n' + color.dim('   ' + recipe.notes.replace(/\s+/g, ' ')));
}

function listFrameworks() {
  console.log(color.bold('\n Frameworks:'));
  for (const key of frameworkOrder) {
    const r = recipes[key];
    const kindTag = { cli: 'regenerated', xcodegen: 'generated ', template: 'template  ' }[r.kind];
    console.log(`   ${color.cyan(key.padEnd(14))} ${color.dim(kindTag)}  ${r.title}`);
  }
  console.log('');
}

function printHelp() {
  console.log(`
${color.bold('Bootstrap a Pulsar example app from scratch')}

  node scripts/bootstrap-app.mjs <framework> [options]
  npm run bootstrap -- <framework> [options]

${color.bold('frameworks')}   web · react-native (rn) · expo · flutter · ios · android · kmp

${color.bold('options')}
  --apply         overwrite the real <framework>/PulsarApp (default: staging dir)
  --into <dir>    write into a custom directory
  --published     wire the published Pulsar SDK instead of local sources
  --no-install    skip dependency install
  --verify        run the framework's build/analyze check afterwards
  --force         allow --apply on a dirty working tree
  --dry-run       print the plan and exit
  --list          list frameworks

${color.dim('By default the app is built into .bootstrap-out/<framework>/ so nothing existing is touched.')}
`);
}
