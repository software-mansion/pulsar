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
  'iOS/Pulsar/README.md',
  'Android/Pulsar/README.md',
  'react-native/react-native-pulsar/README.md',
];

function replaceGeneratedSection(content, key, replacement) {
  const pattern = new RegExp(
    `<!-- GENERATED:${key}_START -->[\\s\\S]*?<!-- GENERATED:${key}_END -->`,
    'g'
  );

  if (!pattern.test(content)) {
    throw new Error(`Missing generated section markers for ${key}`);
  }

  return content.replace(
    pattern,
    `<!-- GENERATED:${key}_START -->\n${replacement}\n<!-- GENERATED:${key}_END -->`
  );
}

function getOverviewBlock() {
  return `## Latest available version

- iOS: Swift Package tag \`${versions.ios.version}\`
- Android: Maven artifact \`${versions.android.mavenCoordinate}:${versions.android.version}\`
- React Native: npm package \`${versions.reactNative.packageName}@${versions.reactNative.version}\``;
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

  await fs.writeFile(absoluteFile, content);
}

console.log('Synchronized SDK versions from sdk-versions.json');
