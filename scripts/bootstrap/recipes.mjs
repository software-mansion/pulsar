// Per-framework bootstrap recipes.
//
// Each recipe describes how to (re)materialize one example app as:
//   SHELL   — regenerable scaffolding (produced fresh by an official generator,
//             or, where none exists, a frozen in-repo template)
//   CONTENT — the reusable SDK demo source, copied verbatim from the live app
//   WIRING  — the small deltas that point the app at the local Pulsar SDK
//
// `kind` drives the engine:
//   'cli'      — run an official scaffolder, then overlay CONTENT + WIRING
//   'xcodegen' — overlay CONTENT, write a declarative project spec, generate
//   'template' — no scaffolder exists: re-materialize a frozen in-repo template
//
// Keep the maintained surface small: CLI frameworks always scaffold the LATEST
// framework version (no version is pinned — the official generator decides), and
// we pin only the handful of extra libraries the demo genuinely needs.
//
// Frameworks without a scaffolder (android, kmp) can't fetch "latest" — their
// toolchain versions live centrally in scripts/bootstrap/toolchain.json and are
// synced into each app's Gradle version catalog on bootstrap (see toolchainKey).

/** @typedef {import('./lib.mjs')} Lib */

export const recipes = {
  // ─────────────────────────────────────────────────────────── web ──
  web: {
    key: 'web',
    title: 'Web — Vite + React (TS)',
    appDir: 'web/PulsarApp',
    sdkDir: 'web/Pulsar',
    kind: 'cli',
    scaffold: {
      // create-vite is non-interactive once name + template are supplied.
      cmd: 'npm',
      args: ['create', 'vite@latest', 'PulsarApp', '--', '--template', 'react-ts'],
      producedDir: 'PulsarApp',
    },
    // Delete create-vite's demo leftovers that the overlay replaces.
    removeDefaults: ['src/App.css', 'src/index.css', 'src/assets', 'public/vite.svg'],
    // Verbatim overlay: the whole demo + the app-owned config files.
    content: ['src', 'index.html', 'vite.config.ts', 'tsconfig.json'],
    packageJson: {
      name: 'pulsar-app',
      dependencies: { 'pulsar-haptics': 'file:../Pulsar' },
      scripts: { dev: 'vite --host', preview: 'vite preview --host' },
    },
    install: ['npm', 'install'],
    verify: ['npm', 'run', 'build'],
    notes:
      'React (react-ts) app. SDK wired via `pulsar-haptics: file:../Pulsar` plus a ' +
      'vite alias + tsconfig path that resolve to ../Pulsar/src/index.ts (no SDK build needed). ' +
      'Fully regenerable — the only guardrail is `npm run build`, since no CI job covers this app.',
  },

  // ──────────────────────────────────────────────── react-native ──
  'react-native': {
    key: 'react-native',
    title: 'React Native — community CLI',
    appDir: 'react-native/PulsarApp',
    sdkDir: 'react-native/react-native-pulsar',
    kind: 'cli',
    scaffold: {
      // No --version: the community CLI scaffolds the latest React Native.
      cmd: 'npx',
      args: [
        '@react-native-community/cli@latest',
        'init',
        'example',
        '--skip-install',
        '--skip-git-init',
      ],
      producedDir: 'example',
    },
    // ios/ and android/ are regenerated fresh by the CLI (that's the win). The
    // Podfile is the one native file preserved verbatim — it carries the local
    // `PulsarHaptics` pod block + the Xcode-26 fmt patch, which are additive and
    // not re-derivable from a vanilla template. Revisit on an RN bump.
    content: [
      'App.tsx',
      'src',
      '__tests__',
      'metro.config.js',
      'react-native.config.js',
      'babel.config.js',
      'tsconfig.json',
      'app.json',
      'index.js',
      'ios/Podfile',
    ],
    packageJson: {
      dependencies: {
        'react-native-pulsar': 'file:../react-native-pulsar',
        'react-native-gesture-handler': '^2.20.2',
        // reanimated 4.5+ requires worklets 0.10.x — keep this pair in lockstep.
        'react-native-reanimated': '^4.5.0',
        'react-native-worklets': '^0.10.0',
        'react-native-safe-area-context': '^5.5.2',
      },
      remove: ['@react-native/new-app-screen'],
    },
    install: ['npm', 'install'],
    // pod install is intentionally left to the operator (needs a mac + the
    // USE_LOCAL_PULSAR_IOS toggle); see notes.
    postInstallHint:
      'cd ios && USE_LOCAL_PULSAR_IOS=1 bundle exec pod install   # iOS\n' +
      '# Android autolinks via react-native.config.js; pass USE_LOCAL_PULSAR_ANDROID=1 at gradle time',
    notes:
      'JS + native shell regenerated at the latest React Native (no version pin). metro/babel/' +
      'react-native.config and screens are overlaid verbatim; deps merged onto the fresh scaffold. The ' +
      'custom ios/Podfile (local pod block + fmt/Xcode-26 patch) is preserved, not regenerated. Pinned ' +
      'reanimated/worklets must stay a compatible pair as RN advances.',
  },

  // ─────────────────────────────────────────────────────── flutter ──
  flutter: {
    key: 'flutter',
    title: 'Flutter — example app',
    appDir: 'flutter/PulsarApp',
    sdkDir: 'flutter/pulsar',
    kind: 'cli',
    scaffold: {
      cmd: 'flutter',
      args: [
        'create', '--org', 'com.example', '--project-name', 'pulsarapp',
        '--platforms', 'android,ios', '--empty', 'PulsarApp',
      ],
      producedDir: 'PulsarApp',
    },
    // main.dart is the whole demo; Podfile carries the 2 env-driven local-SDK
    // blocks; assets/ holds the audio clip for the Audio-synced Haptics demo.
    content: ['lib/main.dart', 'ios/Podfile', 'assets/sample-3s.mp3'],
    // pubspec is generated by `flutter create`; inject the path dependency.
    pubspecDependency: { name: 'pulsar_haptics', path: '../pulsar' },
    // ...and declare the bundled assets in the regenerated pubspec.
    pubspecAssets: ['assets/sample-3s.mp3'],
    install: ['flutter', 'pub', 'get'],
    verify: ['flutter', 'analyze'],
    postInstallHint:
      'flutter run                          # published native SDKs\n' +
      'USE_LOCAL_PULSAR_IOS=1 flutter run    # local iOS/Pulsar\n' +
      'USE_LOCAL_PULSAR_ANDROID=1 flutter run# local Android/Pulsar',
    notes:
      'Cleanest split: only lib/main.dart (content) + one pubspec path dep + the ios/Podfile blocks are ' +
      'hand-owned; everything else is `flutter create` output. android/ needs no edit (the ' +
      'USE_LOCAL_PULSAR_ANDROID switch lives in the plugin).',
  },

  // ───────────────────────────────────────────────────────── ios ──
  ios: {
    key: 'ios',
    title: 'iOS native — XcodeGen',
    appDir: 'iOS/PulsarApp',
    sdkDir: 'iOS/Pulsar',
    kind: 'xcodegen',
    // The .xcodeproj becomes generated output; only Swift + the spec are tracked.
    content: ['PulsarApp', 'PulsarAppTests', 'PulsarAppUITests'],
    projectYml: iosProjectYml,
    generate: ['xcodegen', 'generate'],
    verify: [
      'xcodebuild', '-project', 'PulsarApp.xcodeproj', '-scheme', 'PulsarApp',
      '-sdk', 'iphonesimulator', '-destination', 'generic/platform=iOS Simulator',
      'CODE_SIGNING_ALLOWED=NO', 'build',
    ],
    notes:
      'The Xcode project already uses filesystem-synchronized groups, so a XcodeGen project.yml reproduces ' +
      'it losslessly. Local SDK is a relative-path Swift package (../Pulsar). Adopting this means: gitignore ' +
      'PulsarApp.xcodeproj and add `brew install xcodegen && xcodegen generate` to _build-ios-native.yml. ' +
      'PresetsListView.swift carries a `// CODEGEN_BEGIN_{example_app_preset_list}` marker — regenerate it ' +
      'from the SDK preset set as a separate content step.',
  },

  // ─────────────────────────────────────────────────────── android ──
  android: {
    key: 'android',
    title: 'Android native — frozen template',
    appDir: 'Android/PulsarApp',
    sdkDir: 'Android/Pulsar',
    kind: 'template',
    // No Android app scaffolder exists (gradle init only makes JVM apps). The
    // in-repo shell IS the template; the engine re-materializes tracked files.
    localProperties: true,
    // Sync the toolchain (AGP/Kotlin/Compose BOM + Gradle wrapper) from the
    // central scripts/bootstrap/toolchain.json — the one place to bump versions.
    toolchainKey: 'android',
    verify: ['./gradlew', ':app:assembleDebug'],
    notes:
      'No official CLI scaffolds an Android app, so the tracked tree is a frozen template + overlay. ' +
      'Always-local: depends on the SDK via `project(":Pulsar")` (no USE_LOCAL toggle for native). ' +
      'AGP/Gradle/Kotlin/Compose-BOM versions are synced from scripts/bootstrap/toolchain.json (the one ' +
      'place to bump). Incidental library versions and the library-only entries (nmcp, ' +
      'kotlinx-serialization-json, appcompat, material) that Android/Pulsar borrows are left untouched.',
  },

  // ───────────────────────────────────────────────────────── kmp ──
  kmp: {
    key: 'kmp',
    title: 'Kotlin Multiplatform — frozen template',
    appDir: 'kmp/PulsarApp',
    sdkDir: 'kmp/Pulsar',
    kind: 'template',
    localProperties: true,
    // Sync the toolchain (AGP/Kotlin/Compose Multiplatform + Gradle wrapper +
    // Android SDK levels) from scripts/bootstrap/toolchain.json.
    toolchainKey: 'kmp',
    verify: ['./gradlew', ':composeApp:assembleDebug'],
    notes:
      'The JetBrains web wizard is interactive-only and its default layout diverged (May 2026) from this ' +
      "app's composeApp+iosApp shape, so the tracked tree is a frozen template + overlay. The sole content " +
      'file is composeApp/src/commonMain/kotlin/.../App.kt. SDK wired via a composite build with dependency ' +
      'substitution in settings.gradle.kts. AGP/Gradle/Kotlin/Compose-Multiplatform/SDK-levels are synced ' +
      'from scripts/bootstrap/toolchain.json. iOS uses the vendored Kotlin/Native impl (no USE_LOCAL toggle); ' +
      'the Xcode build phase hard-codes a Homebrew openjdk@17 JAVA_HOME.',
  },
};

export const aliases = {
  rn: 'react-native',
  reactnative: 'react-native',
  'react_native': 'react-native',
  vite: 'web',
  apple: 'ios',
  swift: 'ios',
};

export function resolveRecipe(name) {
  const key = aliases[name] || name;
  return recipes[key];
}

export const frameworkOrder = ['web', 'react-native', 'flutter', 'ios', 'android', 'kmp'];

// ── XcodeGen spec for the iOS example (reproduces iOS/PulsarApp) ──
// `local` picks the relative-path package for dev; otherwise the published
// Swift package pinned from sdk-versions.json (ios.swiftPackageUrl / ios.version).
function iosProjectYml({ local, iosVersion, iosSwiftPackageUrl }) {
  const pkg = local
    ? `  Pulsar:\n    path: ../Pulsar`
    : `  Pulsar:\n    url: ${iosSwiftPackageUrl}\n    from: "${iosVersion}"`;
  return `# Generated by scripts/bootstrap-app.mjs — declarative source for PulsarApp.xcodeproj.
# Edit this file (not the .xcodeproj) and re-run \`xcodegen generate\`.
name: PulsarApp
options:
  bundleIdPrefix: com.swmansion
  deploymentTarget:
    iOS: "18.5"
  createIntermediateGroups: true
settings:
  base:
    SWIFT_VERSION: "5.0"
    MARKETING_VERSION: "1.0"
    CURRENT_PROJECT_VERSION: "1"
packages:
${pkg}
targets:
  PulsarApp:
    type: application
    platform: iOS
    sources:
      - path: PulsarApp
    dependencies:
      - package: Pulsar
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.swmansion.PulsarApp
        GENERATE_INFOPLIST_FILE: "YES"
        INFOPLIST_KEY_UIApplicationSceneManifest_Generation: "YES"
        INFOPLIST_KEY_UILaunchScreen_Generation: "YES"
        INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents: "YES"
        INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone: "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"
        INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad: "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"
  PulsarAppTests:
    type: bundle.unit-test
    platform: iOS
    sources: [PulsarAppTests]
    dependencies:
      - target: PulsarApp
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.swmansion.PulsarAppTests
        TEST_HOST: "$(BUILT_PRODUCTS_DIR)/PulsarApp.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/PulsarApp"
  PulsarAppUITests:
    type: bundle.ui-testing
    platform: iOS
    sources: [PulsarAppUITests]
    dependencies:
      - target: PulsarApp
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.swmansion.PulsarAppUITests
schemes:
  PulsarApp:
    build:
      targets: { PulsarApp: all }
    test:
      targets: [PulsarAppTests, PulsarAppUITests]
`;
}
