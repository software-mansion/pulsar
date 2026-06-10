import { useEffect, useState } from 'react';
import type { PresetData } from '../types';
import closeIcon from '../assets/icon-close.svg';
import copyIcon from '../assets/icon-copy.svg';
import checkIcon from '../assets/icon-check.svg';

// Order chosen to match the docs SDK overview page.
const LANGS = ['Swift', 'Android', 'KMP', 'React Native', 'Flutter', 'Web'] as const;
type Lang = (typeof LANGS)[number];

// Maps PascalCase / "Title Case" preset names ("DogBark", "TickTock", "My Buzz")
// to the camelCase identifier each SDK actually uses (dogBark, tickTock,
// myBuzz). The docs use this casing in every authoritative example we have.
const camel = (s: string): string => {
  const stripped = s.replace(/[^A-Za-z0-9]+/g, ' ').trim();
  const parts = stripped.split(/\s+/);
  if (parts.length === 0) return s;
  return parts
    .map((p, i) =>
      i === 0 ? p.charAt(0).toLowerCase() + p.slice(1) : p.charAt(0).toUpperCase() + p.slice(1)
    )
    .join('');
};

// SDK-specific code generators for a built-in preset. Each returns the
// recommended invocation as quoted from the matching `docs/src/content/docs/sdk/*.mdx`
// page (see PresetDetailsModal-snippets audit for source citations).
function builtInSnippet(lang: Lang, name: string): string {
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

// Build SDK-specific representations of the preset's discrete + continuous
// arrays, formatted as the SDK's own native types.

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
  // Render as JS-object literal (unquoted keys) for closer parity with the
  // docs' react-native.mdx example.
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
  // The web SDK uses a segment-based HapticPattern, not the iOS-style
  // discrete/continuous shape — see web/Pulsar/src/types.ts. We render the
  // most-fidelity-preserving translation:
  //   - each discretePattern point → a short "continuous" segment (30 ms)
  //   - the continuousPattern envelope → one "line" segment spanning the
  //     preset duration with the amplitude/frequency arrays as control points.
  const lineSegment =
    data.continuousPattern.amplitude.length > 0 || data.continuousPattern.frequency.length > 0
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

function customSnippet(lang: Lang, data: PresetData): string {
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

export function PresetDetailsModal({
  data,
  elementName,
  isCustom = false,
  onClose
}: {
  data: PresetData;
  elementName?: string;
  isCustom?: boolean;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<Lang>('Swift');
  const snippet = isCustom ? customSnippet(lang, data) : builtInSnippet(lang, data.name);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [copiedKey, setCopiedKey] = useState<'snippet' | 'json' | null>(null);
  const copy = (text: string, key: 'snippet' | 'json') => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 1200);
      },
      () => {}
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div className="modal-head-text">
            <div className="modal-title">{data.name}</div>
            {elementName && <div className="modal-subtitle">on {elementName}</div>}
          </div>
          <button className="modal-close" onClick={onClose} title="Close (Esc)" aria-label="Close">
            <img src={closeIcon} alt="" width={14} height={14} />
          </button>
        </header>

        <div className="modal-body">
          {(data.tags.length > 0 || isCustom) && (
            <div className="tags-row">
              {isCustom && <span className="tag tag-custom">Custom</span>}
              {data.tags
                .filter((t) => t !== 'Custom')
                .map((t) => (
                  <span key={t} className="tag tag-white">
                    {t}
                  </span>
                ))}
            </div>
          )}

          {data.description && <p className="modal-description">{data.description}</p>}

          <section className="modal-section">
            <div className="modal-section-head">
              <h3>Usage</h3>
            </div>
            <div className="docs-tabs">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`docs-tab${lang === l ? ' active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="code-block-wrap">
              <pre className="code-block">{snippet}</pre>
              <button
                className="code-copy-btn"
                onClick={() => copy(snippet, 'snippet')}
                title="Copy"
                aria-label={copiedKey === 'snippet' ? 'Copied' : 'Copy'}
              >
                <img
                  src={copiedKey === 'snippet' ? checkIcon : copyIcon}
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </section>

          <section className="modal-section">
            <div className="modal-section-head">
              <h3>Raw pattern data</h3>
            </div>
            <div className="code-block-wrap">
              <pre className="code-block">{json}</pre>
              <button
                className="code-copy-btn"
                onClick={() => copy(json, 'json')}
                title="Copy"
                aria-label={copiedKey === 'json' ? 'Copied' : 'Copy'}
              >
                <img
                  src={copiedKey === 'json' ? checkIcon : copyIcon}
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
