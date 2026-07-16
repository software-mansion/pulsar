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
