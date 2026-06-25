import type { PresetData } from '../../shared/types';

// Order chosen to match the docs SDK overview page. Kept in sync with the
// preview's PresetDetailsModal - if you fix a snippet here, fix it there too
// (or vice versa). The two apps have to be self-contained because they live
// in separate Vite projects, but the source of truth for the snippet content
// is the docs/src/content/docs/sdk/*.mdx pages.
export const LANGS = [
  'Swift',
  'Android',
  'KMP',
  'React Native',
  'Flutter',
  'Web'
] as const;
export type Lang = (typeof LANGS)[number];

// Maps PascalCase / "Title Case" preset names ("DogBark", "TickTock",
// "My Buzz") to the camelCase identifier each SDK actually uses (dogBark,
// tickTock, myBuzz). The docs use this casing in every authoritative example.
const camel = (s: string): string => {
  const stripped = s.replace(/[^A-Za-z0-9]+/g, ' ').trim();
  const parts = stripped.split(/\s+/);
  if (parts.length === 0) return s;
  return parts
    .map((p, i) =>
      i === 0
        ? p.charAt(0).toLowerCase() + p.slice(1)
        : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join('');
};

// Built-in preset call site for each SDK - quoted from
// docs/src/content/docs/sdk/{ios,android,kmp,react-native,flutter}.mdx.
export function builtInSnippet(lang: Lang, name: string): string {
  const id = camel(name);
  switch (lang) {
    case 'Swift':
      return `import Pulsar

let pulsar = Pulsar()
pulsar.getPresets().${id}()`;
    case 'Android':
      return `import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(context)
pulsar.getPresets().${id}()`;
    case 'KMP':
      return `import com.swmansion.pulsar.kmp.Pulsar

val pulsar = Pulsar.create()
pulsar.getPresets().play("${name}")`;
    case 'React Native':
      return `import { Presets } from 'react-native-pulsar';

Presets.${id}();`;
    case 'Flutter':
      return `import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();
await pulsar.getPresets().${id}();`;
    case 'Web':
      return `import Pulsar from 'pulsar-haptics';

const pulsar = new Pulsar();
await pulsar.getPresets().play('${id}');`;
  }
}

function customSwift(data: PresetData): string {
  const amp = data.continuousPattern.amplitude
    .map((p) => `      ValuePoint(time: ${p.time}, value: ${p.value})`)
    .join(',\n');
  const freq = data.continuousPattern.frequency
    .map((p) => `      ValuePoint(time: ${p.time}, value: ${p.value})`)
    .join(',\n');
  const disc = data.discretePattern
    .map(
      (p) =>
        `    DiscretePoint(time: ${p.time}, amplitude: ${p.amplitude}, frequency: ${p.frequency})`
    )
    .join(',\n');
  return `import Pulsar

let pulsar = Pulsar()
let composer = pulsar.getPatternComposer()

let pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [
${amp}
    ],
    frequency: [
${freq}
    ]
  ),
  discretePattern: [
${disc}
  ]
)

composer.playPattern(hapticsData: pattern)`;
}

function customKotlin(data: PresetData, kmp: boolean): string {
  const amp = data.continuousPattern.amplitude
    .map((p) => `      ValuePoint(time = ${p.time}, value = ${p.value}f)`)
    .join(',\n');
  const freq = data.continuousPattern.frequency
    .map((p) => `      ValuePoint(time = ${p.time}, value = ${p.value}f)`)
    .join(',\n');
  // Discrete point class is `ConfigPoint` in Kotlin (Android + KMP), per docs.
  const disc = data.discretePattern
    .map(
      (p) =>
        `    ConfigPoint(time = ${p.time}, amplitude = ${p.amplitude}f, frequency = ${p.frequency}f)`
    )
    .join(',\n');
  const importLine = kmp
    ? 'import com.swmansion.pulsar.kmp.Pulsar'
    : 'import com.swmansion.pulsar.Pulsar';
  const init = kmp ? 'val pulsar = Pulsar.create()' : 'val pulsar = Pulsar(context)';
  const playCall = kmp
    ? 'composer.playPattern(pattern)'
    : 'composer.parsePattern(pattern)\ncomposer.play()';
  return `${importLine}

${init}
val composer = pulsar.getPatternComposer()

val pattern = PatternData(
  continuousPattern = ContinuousPattern(
    amplitude = listOf(
${amp}
    ),
    frequency = listOf(
${freq}
    )
  ),
  discretePattern = listOf(
${disc}
  )
)

${playCall}`;
}

function customReactNative(data: PresetData): string {
  const stringifyPattern = (obj: unknown, indent = 2): string => {
    const pad = ' '.repeat(indent);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return `[\n${obj
        .map((item) => pad + stringifyPattern(item, indent + 2))
        .join(',\n')}\n${' '.repeat(indent - 2)}]`;
    }
    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>);
      return `{ ${entries.map(([k, v]) => `${k}: ${stringifyPattern(v, indent + 2)}`).join(', ')} }`;
    }
    return JSON.stringify(obj);
  };
  const pat = {
    discretePattern: data.discretePattern,
    continuousPattern: data.continuousPattern
  };
  return `import { usePatternComposer } from 'react-native-pulsar';
import { Pressable, Text } from 'react-native';

const pattern = ${stringifyPattern(pat)};

function MyButton() {
  const composer = usePatternComposer(pattern);
  return (
    <Pressable onPress={() => composer.play()}>
      <Text>Tap me</Text>
    </Pressable>
  );
}`;
}

function customFlutter(data: PresetData): string {
  const amp = data.continuousPattern.amplitude
    .map((p) => `    ValuePoint(time: ${p.time}, value: ${p.value})`)
    .join(',\n');
  const freq = data.continuousPattern.frequency
    .map((p) => `    ValuePoint(time: ${p.time}, value: ${p.value})`)
    .join(',\n');
  const disc = data.discretePattern
    .map(
      (p) =>
        `    DiscretePoint(time: ${p.time}, amplitude: ${p.amplitude}, frequency: ${p.frequency})`
    )
    .join(',\n');
  return `import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();
final composer = pulsar.getPatternComposer();

final pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: const [
${amp}
    ],
    frequency: const [
${freq}
    ],
  ),
  discretePattern: const [
${disc}
  ],
);

await composer.playPattern(pattern);`;
}

function customWeb(data: PresetData): string {
  const lineSegment =
    data.continuousPattern.amplitude.length > 0 ||
    data.continuousPattern.frequency.length > 0
      ? `  {
    type: 'line',
    timestamp: 0,
    duration: ${data.duration},
    intensity: ${JSON.stringify(data.continuousPattern.amplitude)},
    frequency: ${JSON.stringify(data.continuousPattern.frequency)},
  }`
      : '';
  const discreteSegments = data.discretePattern.map(
    (p) => `  { type: 'continuous', timestamp: ${p.time}, duration: 30 }`
  );
  const all = [...discreteSegments, lineSegment].filter(Boolean).join(',\n');
  return `import Pulsar, { type HapticPattern } from 'pulsar-haptics';

const pulsar = new Pulsar();
const composer = pulsar.getPatternComposer();

const pattern: HapticPattern = [
${all}
];

composer.parse(pattern);
composer.play();`;
}

export function customSnippet(lang: Lang, data: PresetData): string {
  switch (lang) {
    case 'Swift':
      return customSwift(data);
    case 'Android':
      return customKotlin(data, false);
    case 'KMP':
      return customKotlin(data, true);
    case 'React Native':
      return customReactNative(data);
    case 'Flutter':
      return customFlutter(data);
    case 'Web':
      return customWeb(data);
  }
}
