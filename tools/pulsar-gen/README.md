# pulsar-gen

Generates the **typed view** of a Pulsar `.pulsar` bundle so `bundle.<id>` autocompletes in
your IDE. The `.pulsar` format itself is specified internally (pulsar-private, `docs/bundle-format.md`).

Requires Node ≥ 23.6 (runs TypeScript sources directly via type-stripping — no build step).

## CLI

```bash
# Emit a Swift typed accessor next to the bundle
node src/cli.ts path/to/acme-pack.pulsar --target swift --out ./Generated

# Multiple targets at once
node src/cli.ts acme-pack.pulsar --target swift,kotlin,dart,rn --out ./gen

# Kotlin package / print to stdout
node src/cli.ts acme-pack.pulsar --target kotlin --package com.acme.haptics --stdout
```

Targets: `swift` (`enum` + `BundleDescriptor`), `kotlin` (`object` + `BundleDescriptor`),
`dart` (`*.bundle.dart`), `rn` (`*.bundle.ts` module with a bound `loadBundle` function).

The RN module **inlines each preset's device pattern** and statically requires the sibling
`.pulsar` asset. `loadBundle({ withAssets: false })` is synchronous and uses only the inline
patterns; `withAssets: true` returns a Promise and loads the binary natively for authored
audio. JSON Lottie animations are
inlined too when you pass `animations`, since they are rendered in JS.

`react-native-pulsar` ships a zero-dependency copy of this emitter as `npx pulsar-gen-rn`, so apps
can regenerate modules without installing pulsar-gen. The test suite pins the two to byte-identical
output — change one and update the other.

## Programmatic API (portable — importable from Studio's browser bundle)

```ts
import {
  validateManifest,
  generate,
  buildSidecar,
} from "@swmansion/pulsar-gen";
// Node-only helpers (disk + zip):
import { readBundleFile, computeContentHash } from "@swmansion/pulsar-gen/read";

const { manifest, entries } = readBundleFile("acme-pack.pulsar");
generate(manifest, "rn", {
  patterns: extractPatterns(manifest, entries),
  animations: extractAnimations(manifest, entries).animations,
});
```

The emitters (`src/emit/*`), `generate`, and `validateManifest` use no Node APIs, so Studio reuses
them directly for in-browser export. `read`/`zip`/`cli` are Node-only.

## Develop

```bash
node fixtures/build-fixture.ts   # regenerate the fixture bundle + golden outputs
node --test                      # run the test suite
npm run typecheck                # tsc --noEmit (needs `npm install` for typescript first)
```
