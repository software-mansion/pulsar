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
  'iOS/Pulsar/README.md',
  'iOS/Pulsar/Pulsar-haptics.podspec',
  'Android/Pulsar/README.md',
  'react-native/react-native-pulsar/README.md',
  'kmp/Pulsar/README.md',
  'flutter/pulsar/README.md',
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

- iOS: Swift Package tag \`${versions.ios.version}\`
- Android: Maven artifact \`${versions.android.mavenCoordinate}:${versions.android.version}\`
- React Native: npm package \`${versions.reactNative.packageName}@${versions.reactNative.version}\`
- Kotlin Multiplatform: Maven artifact \`${versions.kmp.mavenCoordinate}:${versions.kmp.version}\`
- Flutter: pub.dev package \`${versions.flutter.packageName}@${versions.flutter.version}\``;
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

  await fs.writeFile(absoluteFile, content);
}

console.log('Synchronized SDK versions from sdk-versions.json');
