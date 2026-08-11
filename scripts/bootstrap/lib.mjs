// Shared helpers for the example-app bootstrapper.
//
// Deliberately dependency-free (Node built-ins only) to match the repo's other
// root scripts (see scripts/sync-sdk-versions.mjs). File enumeration goes
// through `git ls-files` so we only ever copy source-of-truth tracked files and
// never node_modules / build output / Pods.

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);

// --- logging ---------------------------------------------------------------

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};
export const color = C;
export const step = (msg) => console.log(`${C.cyan('▸')} ${msg}`);
export const info = (msg) => console.log(`  ${C.dim(msg)}`);
export const warn = (msg) => console.log(`  ${C.yellow('!')} ${msg}`);
export const ok = (msg) => console.log(`  ${C.green('✓')} ${msg}`);

// --- process ---------------------------------------------------------------

// Run a command, streaming its output. Throws on non-zero exit.
export function run(cmd, args, { cwd = repoRoot, env, dryRun } = {}) {
  const label = [cmd, ...args].join(' ');
  console.log(`  ${C.dim('$')} ${label}${cwd !== repoRoot ? C.dim(`   (${path.relative(repoRoot, cwd)})`) : ''}`);
  if (dryRun) return { status: 0, stdout: '' };
  const res = spawnSync(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    throw new Error(`Command failed (exit ${res.status}): ${label}`);
  }
  return res;
}

// Run a command and capture stdout (used for `git ls-files`, tool version probes).
export function capture(cmd, args, { cwd = repoRoot } = {}) {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`Command failed (exit ${res.status}): ${[cmd, ...args].join(' ')}\n${res.stderr || ''}`);
  }
  return res.stdout;
}

export function hasCommand(cmd) {
  const res = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
    encoding: 'utf8',
  });
  return res.status === 0;
}

// --- filesystem ------------------------------------------------------------

export async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function rimraf(p, { dryRun } = {}) {
  if (dryRun) return;
  await fs.rm(p, { recursive: true, force: true });
}

export async function ensureDir(p, { dryRun } = {}) {
  if (dryRun) return;
  await fs.mkdir(p, { recursive: true });
}

export async function readJson(p) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}

export async function writeJson(p, obj, { dryRun } = {}) {
  if (dryRun) return;
  await fs.writeFile(p, JSON.stringify(obj, null, 2) + '\n');
}

// List git-tracked files under a repo-relative path (file or directory).
// Returns paths relative to `under` (default: the given path's dir root).
export function gitTracked(relPath) {
  const out = capture('git', ['ls-files', '-z', '--', relPath]);
  return out.split('\0').filter(Boolean);
}

// Copy git-tracked files matching `entries` (relative to appRelDir) from the
// live app into destDir, preserving structure. Skips build/lock noise implicitly
// because untracked files are never listed.
export async function copyTracked(appRelDir, entries, destDir, { dryRun } = {}) {
  let count = 0;
  for (const entry of entries) {
    const spec = path.posix.join(appRelDir, entry);
    const files = gitTracked(spec);
    for (const rel of files) {
      const from = path.join(repoRoot, rel);
      const to = path.join(destDir, path.relative(appRelDir, rel));
      if (!dryRun) {
        await fs.mkdir(path.dirname(to), { recursive: true });
        await fs.copyFile(from, to);
      }
      count++;
    }
  }
  return count;
}

// Move the *contents* of srcDir into destDir (destDir already exists).
export async function mergeDirInto(srcDir, destDir, { dryRun } = {}) {
  if (dryRun) return;
  await fs.mkdir(destDir, { recursive: true });
  for (const e of await fs.readdir(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, e.name);
    const to = path.join(destDir, e.name);
    await fs.rm(to, { recursive: true, force: true });
    await fs.rename(from, to);
  }
}

// Deep-merge dependency-style maps into a package.json on disk.
export async function patchPackageJson(pkgPath, patch, { dryRun } = {}) {
  const pkg = await readJson(pkgPath);
  if (patch.name) pkg.name = patch.name;
  for (const key of ['scripts', 'dependencies', 'devDependencies']) {
    if (patch[key]) pkg[key] = sortKeys({ ...(pkg[key] || {}), ...patch[key] });
  }
  for (const dep of patch.remove || []) {
    delete pkg.dependencies?.[dep];
    delete pkg.devDependencies?.[dep];
  }
  info(`patch package.json (+${Object.keys(patch.dependencies || {}).length} deps)`);
  if (!dryRun) await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

// Idempotently ensure `snippet` is present in a text file. If `anchor` is given
// and found, insert after it; otherwise append. No-op if `marker` already there.
export async function ensureInFile(filePath, { marker, snippet, anchor }, { dryRun } = {}) {
  let text = await fs.readFile(filePath, 'utf8');
  if (text.includes(marker)) {
    info(`already wired: ${path.basename(filePath)}`);
    return;
  }
  if (anchor && text.includes(anchor)) {
    text = text.replace(anchor, `${anchor}\n${snippet}`);
  } else {
    text = `${text.trimEnd()}\n\n${snippet}\n`;
  }
  info(`wire ${path.basename(filePath)}`);
  if (!dryRun) await fs.writeFile(filePath, text);
}

export async function writeFile(filePath, content, { dryRun } = {}) {
  info(`write ${path.basename(filePath)}`);
  if (dryRun) return;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Rewrite `key = "…"` entries in a Gradle version catalog ([versions] table).
// Only the given keys are touched; everything else (incidental library versions)
// is left exactly as-is. Warns on any key that isn't present.
export async function syncVersionCatalog(catalogPath, versions, { dryRun } = {}) {
  let text = await fs.readFile(catalogPath, 'utf8');
  const changed = [];
  for (const [key, value] of Object.entries(versions)) {
    const re = new RegExp(`(^\\s*${reEscape(key)}\\s*=\\s*")[^"]*(")`, 'm');
    if (!re.test(text)) {
      warn(`version-catalog key not found: ${key} (skipped)`);
      continue;
    }
    text = text.replace(re, `$1${value}$2`);
    changed.push(`${key}=${value}`);
  }
  info(`sync libs.versions.toml (${changed.join(', ')})`);
  if (!dryRun) await fs.writeFile(catalogPath, text);
}

// Rewrite the Gradle version in a gradle-wrapper.properties distributionUrl.
export async function syncGradleWrapper(propsPath, gradleVersion, { dryRun } = {}) {
  let text = await fs.readFile(propsPath, 'utf8');
  const re = /gradle-\d+(?:\.\d+){1,2}(?:-(?:bin|all))?\.zip/;
  if (!re.test(text)) {
    warn('could not find gradle distribution in wrapper properties (skipped)');
    return;
  }
  text = text.replace(re, (m) => m.replace(/\d+(?:\.\d+){1,2}/, gradleVersion));
  info(`sync gradle wrapper → ${gradleVersion}`);
  if (!dryRun) await fs.writeFile(propsPath, text);
}

export async function removePaths(baseDir, globs, { dryRun } = {}) {
  for (const g of globs) {
    const p = path.join(baseDir, g);
    if (await exists(p)) {
      info(`remove default ${g}`);
      if (!dryRun) await fs.rm(p, { recursive: true, force: true });
    }
  }
}
