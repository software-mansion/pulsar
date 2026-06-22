import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const versions = JSON.parse(
  await fs.readFile(path.join(repoRoot, 'sdk-versions.json'), 'utf8')
);

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
  'Android/Pulsar/README.md',
  'react-native/react-native-pulsar/README.md',
  'kmp/Pulsar/README.md',
  'flutter/pulsar/README.md',
  'web/Pulsar/README.md',
];

// Version assignments tagged with an inline `pulsar-sync:<key>` comment. The
// version on the marked line is replaced with the value from sdk-versions.json,
// which keeps the sync robust without per-file regexes.
const markedVersions = [
  { file: 'iOS/Pulsar/Pulsar-haptics.podspec', key: 'ios-version', version: versions.ios.version },
  { file: 'Android/Pulsar/build.gradle.kts', key: 'android-version', version: versions.android.version },
  { file: 'react-native/react-native-pulsar/Pulsar.podspec', key: 'rn-pulsar-ios', version: versions.reactNative.pulsarCore.iosPodVersion },
  { file: 'react-native/react-native-pulsar/android/build.gradle', key: 'rn-pulsar-android', version: versions.reactNative.pulsarCore.androidMavenVersion },
  { file: 'kmp/Pulsar/library/build.gradle.kts', key: 'kmp-version', version: versions.kmp.version },
  { file: 'kmp/Pulsar/library/build.gradle.kts', key: 'kmp-pulsar-android', version: versions.kmp.pulsarCore.androidMavenVersion },
  { file: 'flutter/pulsar/pubspec.yaml', key: 'flutter-version', version: versions.flutter.version },
  { file: 'flutter/pulsar/ios/pulsar.podspec', key: 'flutter-pulsar-ios', version: versions.flutter.pulsarCore.iosPodVersion },
  { file: 'flutter/pulsar/android/build.gradle.kts', key: 'flutter-pulsar-android', version: versions.flutter.pulsarCore.androidMavenVersion },
];

// package.json files cannot carry marker comments, so their top-level `version`
// field is updated directly.
const jsonVersions = [
  { file: 'react-native/react-native-pulsar/package.json', version: versions.reactNative.version },
  { file: 'web/Pulsar/package.json', version: versions.web.version },
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

function syncMarkedVersion(content, key, version, label) {
  const marker = `pulsar-sync:${key}`;
  const semver = /\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/;
  const lines = content.split('\n');
  const index = lines.findIndex((line) => line.includes(marker));

  if (index === -1) {
    throw new Error(`Missing "${marker}" marker in ${label}`);
  }
  if (!semver.test(lines[index])) {
    throw new Error(`No version found on the "${marker}" line in ${label}`);
  }

  lines[index] = lines[index].replace(semver, version);
  return lines.join('\n');
}

function syncJsonVersion(content, version, label) {
  const pattern = /("version":\s*")[^"]+(")/;

  if (!pattern.test(content)) {
    throw new Error(`Missing "version" field in ${label}`);
  }

  return content.replace(pattern, `$1${version}$2`);
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

  await fs.writeFile(absoluteFile, content);
}

for (const { file, key, version } of markedVersions) {
  const absoluteFile = path.join(repoRoot, file);
  const content = await fs.readFile(absoluteFile, 'utf8');
  await fs.writeFile(absoluteFile, syncMarkedVersion(content, key, version, file));
}

for (const { file, version } of jsonVersions) {
  const absoluteFile = path.join(repoRoot, file);
  const content = await fs.readFile(absoluteFile, 'utf8');
  await fs.writeFile(absoluteFile, syncJsonVersion(content, version, file));
}

console.log('Synchronized SDK versions from sdk-versions.json');
