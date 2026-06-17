import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const versions = JSON.parse(
  await fs.readFile(path.join(repoRoot, 'sdk-versions.json'), 'utf8')
);

// Two distinct kinds of versions are kept in sync from sdk-versions.json:
//
//   1. Documentation / published versions — the version each framework SDK is
//      published under (npm, Maven, pub.dev, CocoaPods). These drive the install
//      snippets and version tables in the READMEs and docs below, plus the iOS
//      core pod's own `s.version`.
//
//   2. Core Pulsar artifact dependency versions — the version of the core native
//      Pulsar artifact (iOS `Pulsar-haptics` pod / Android `com.swmansion:pulsar`
//      Maven artifact) that each wrapper framework (React Native, KMP, Flutter)
//      depends on by default. These live under each framework's `pulsarCore` key
//      in the config and are written into the build files below. They are recorded
//      per framework, so a framework can intentionally pin a different core version.
const files = [
  'README.md',
  'docs/src/content/docs/sdk/overview.mdx',
  'docs/src/content/docs/sdk/ios.mdx',
  'docs/src/content/docs/sdk/android.mdx',
  'docs/src/content/docs/sdk/react-native.mdx',
  'docs/src/content/docs/sdk/kmp.mdx',
  'docs/src/content/docs/sdk/flutter.mdx',
  'docs/src/content/docs/sdk/web.mdx',
  'iOS/Pulsar/README.md',
  'iOS/Pulsar/Pulsar-haptics.podspec',
  'Android/Pulsar/README.md',
  'react-native/react-native-pulsar/README.md',
  'kmp/Pulsar/README.md',
  'flutter/pulsar/README.md',
  'web/Pulsar/README.md',
  // Core Pulsar artifact dependency versions (see note above).
  'react-native/react-native-pulsar/Pulsar.podspec',
  'react-native/react-native-pulsar/android/build.gradle',
  'kmp/Pulsar/library/build.gradle.kts',
  'flutter/pulsar/ios/pulsar.podspec',
  'flutter/pulsar/android/build.gradle.kts',
];

function replaceGeneratedSection(content, key, replacement) {
  const startPatterns = [
    `<!-- GENERATED:${key}_START -->`,
    String.raw`\{\/\*\s*GENERATED:${key}_START\s*\*\/\}`,
  ];
  const endPatterns = [
    `<!-- GENERATED:${key}_END -->`,
    String.raw`\{\/\*\s*GENERATED:${key}_END\s*\*\/\}`,
  ];
  const pattern = new RegExp(
    `(?:${startPatterns.join('|')})[\\s\\S]*?(?:${endPatterns.join('|')})`,
    'g'
  );

  if (!pattern.test(content)) {
    throw new Error(`Missing generated section markers for ${key}`);
  }

  const usesMdxComments = content.includes(`{/* GENERATED:${key}_START */}`);
  const startMarker = usesMdxComments
    ? `{/* GENERATED:${key}_START */}`
    : `<!-- GENERATED:${key}_START -->`;
  const endMarker = usesMdxComments
    ? `{/* GENERATED:${key}_END */}`
    : `<!-- GENERATED:${key}_END -->`;

  return content.replace(
    pattern,
    `${startMarker}\n${replacement}\n${endMarker}`
  );
}

function getOverviewBlock() {
  return `## Latest available version

| Platform | Package | Version |
| --- | --- | --- |
| iOS | Swift Package | \`${versions.ios.version}\` |
| Android | \`${versions.android.mavenCoordinate}\` (Maven) | \`${versions.android.version}\` |
| React Native | \`${versions.reactNative.packageName}\` (npm) | \`${versions.reactNative.version}\` |
| Kotlin Multiplatform | \`${versions.kmp.mavenCoordinate}\` (Maven) | \`${versions.kmp.version}\` |
| Flutter | \`${versions.flutter.packageName}\` (pub.dev) | \`${versions.flutter.version}\` |
| Web | \`${versions.web.packageName}\` (npm) | \`${versions.web.version}\` |`;
}

function getWebVersionLine() {
  return `Latest available version: \`${versions.web.version}\``;
}

function getIosVersionLine() {
  return `Latest available version: \`${versions.ios.version}\``;
}

function getIosSnippet() {
  return `\`\`\`swift
dependencies: [
  .package(url: "${versions.ios.swiftPackageUrl}", from: "${versions.ios.version}")
]
\`\`\``;
}

function getIosCocoaPodsSnippet() {
  return `\`\`\`ruby
pod 'Pulsar-haptics', '~> ${versions.ios.version}'
\`\`\``;
}

function syncIosPodspecVersion(content) {
  const pattern = /(s\.version\s*=\s*')([^']+)(')/;

  if (!pattern.test(content)) {
    throw new Error('Missing iOS podspec version assignment');
  }

  return content.replace(pattern, `$1${versions.ios.version}$3`);
}

// Rewrites the default value of the `pulsar_ios_pod_version` assignment that
// wrapper podspecs use to depend on the published `Pulsar-haptics` pod, e.g.
//   pulsar_ios_pod_version = ENV["PULSAR_IOS_POD_VERSION"] || "1.1.4"
// Handles both single- and double-quoted styles.
function syncPulsarIosPodVersion(content, version, label) {
  const pattern =
    /(pulsar_ios_pod_version = ENV\[['"]PULSAR_IOS_POD_VERSION['"]\] \|\| )(['"])([^'"]+)\2/;

  if (!pattern.test(content)) {
    throw new Error(`Missing pulsar_ios_pod_version assignment in ${label}`);
  }

  return content.replace(pattern, `$1$2${version}$2`);
}

// Rewrites the default value passed to (get)StringPropertyOrEnv for the
// PULSAR_ANDROID_MAVEN_VERSION key, which wrapper Gradle builds use to depend on
// the published `com.swmansion:pulsar` Maven artifact, e.g.
//   getStringPropertyOrEnv("PULSAR_ANDROID_MAVEN_VERSION", "1.1.2")
//   stringPropertyOrEnv("PULSAR_ANDROID_MAVEN_VERSION", "1.1.1")
function syncPulsarAndroidMavenVersion(content, version, label) {
  const pattern =
    /(["']PULSAR_ANDROID_MAVEN_VERSION["'],\s*")([^"]+)(")/;

  if (!pattern.test(content)) {
    throw new Error(
      `Missing PULSAR_ANDROID_MAVEN_VERSION default in ${label}`
    );
  }

  return content.replace(pattern, `$1${version}$3`);
}

function getAndroidVersionLine() {
  return `Latest available version: \`${versions.android.version}\``;
}

function getAndroidSnippet() {
  return `\`\`\`kotlin
dependencies {
  implementation("${versions.android.mavenCoordinate}:${versions.android.version}")
}
\`\`\``;
}

function getReactNativeVersionLine() {
  return `Latest available version: \`${versions.reactNative.version}\``;
}

function getKmpVersionLine() {
  return `Latest available version: \`${versions.kmp.version}\``;
}

function getKmpSnippet() {
  return `\`\`\`kotlin
dependencies {
  implementation("${versions.kmp.mavenCoordinate}:${versions.kmp.version}")
}
\`\`\``;
}

function getFlutterVersionLine() {
  return `Latest available version: \`${versions.flutter.version}\``;
}

function getFlutterSnippet() {
  return `\`\`\`yaml
dependencies:
  ${versions.flutter.packageName}: ^${versions.flutter.version}
\`\`\``;
}

for (const relativeFile of files) {
  const absoluteFile = path.join(repoRoot, relativeFile);
  let content = await fs.readFile(absoluteFile, 'utf8');

  if (relativeFile === 'docs/src/content/docs/sdk/overview.mdx') {
    content = replaceGeneratedSection(content, 'SDK_OVERVIEW_VERSIONS', getOverviewBlock());
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/ios.mdx' ||
    relativeFile === 'iOS/Pulsar/README.md' ||
    relativeFile === 'README.md'
  ) {
    content = replaceGeneratedSection(content, 'IOS_VERSION', getIosVersionLine());
    content = replaceGeneratedSection(content, 'IOS_INSTALL_SNIPPET', getIosSnippet());
  }

  if (relativeFile === 'iOS/Pulsar/README.md') {
    content = replaceGeneratedSection(content, 'IOS_COCOAPODS_INSTALL_SNIPPET', getIosCocoaPodsSnippet());
  }

  if (relativeFile === 'iOS/Pulsar/Pulsar-haptics.podspec') {
    content = syncIosPodspecVersion(content);
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/android.mdx' ||
    relativeFile === 'Android/Pulsar/README.md' ||
    relativeFile === 'README.md'
  ) {
    content = replaceGeneratedSection(content, 'ANDROID_VERSION', getAndroidVersionLine());
    content = replaceGeneratedSection(content, 'ANDROID_INSTALL_SNIPPET', getAndroidSnippet());
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/react-native.mdx' ||
    relativeFile === 'react-native/react-native-pulsar/README.md'
  ) {
    content = replaceGeneratedSection(content, 'REACT_NATIVE_VERSION', getReactNativeVersionLine());
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/kmp.mdx' ||
    relativeFile === 'kmp/Pulsar/README.md' ||
    relativeFile === 'README.md'
  ) {
    content = replaceGeneratedSection(content, 'KMP_VERSION', getKmpVersionLine());
    content = replaceGeneratedSection(content, 'KMP_INSTALL_SNIPPET', getKmpSnippet());
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/flutter.mdx' ||
    relativeFile === 'flutter/pulsar/README.md' ||
    relativeFile === 'README.md'
  ) {
    content = replaceGeneratedSection(content, 'FLUTTER_VERSION', getFlutterVersionLine());
    content = replaceGeneratedSection(content, 'FLUTTER_INSTALL_SNIPPET', getFlutterSnippet());
  }

  if (
    relativeFile === 'docs/src/content/docs/sdk/web.mdx' ||
    relativeFile === 'web/Pulsar/README.md' ||
    relativeFile === 'README.md'
  ) {
    content = replaceGeneratedSection(content, 'WEB_VERSION', getWebVersionLine());
  }

  // Core Pulsar artifact dependency versions in the wrapper build files.
  if (relativeFile === 'react-native/react-native-pulsar/Pulsar.podspec') {
    content = syncPulsarIosPodVersion(
      content,
      versions.reactNative.pulsarCore.iosPodVersion,
      relativeFile
    );
  }

  if (relativeFile === 'react-native/react-native-pulsar/android/build.gradle') {
    content = syncPulsarAndroidMavenVersion(
      content,
      versions.reactNative.pulsarCore.androidMavenVersion,
      relativeFile
    );
  }

  if (relativeFile === 'kmp/Pulsar/library/build.gradle.kts') {
    content = syncPulsarAndroidMavenVersion(
      content,
      versions.kmp.pulsarCore.androidMavenVersion,
      relativeFile
    );
  }

  if (relativeFile === 'flutter/pulsar/ios/pulsar.podspec') {
    content = syncPulsarIosPodVersion(
      content,
      versions.flutter.pulsarCore.iosPodVersion,
      relativeFile
    );
  }

  if (relativeFile === 'flutter/pulsar/android/build.gradle.kts') {
    content = syncPulsarAndroidMavenVersion(
      content,
      versions.flutter.pulsarCore.androidMavenVersion,
      relativeFile
    );
  }

  await fs.writeFile(absoluteFile, content);
}

console.log('Synchronized SDK versions from sdk-versions.json');
