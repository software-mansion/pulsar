# pulsar-gen

Generates the **typed view** of a Pulsar `.pulsar` bundle so `bundle.<id>` autocompletes in
your IDE. The `.pulsar` format itself is specified internally (pulsar-private, `docs/bundle-format.md`).

Requires Node ≥ 20.

## CLI

```bash
# Emit a Swift typed accessor next to the bundle
npx pulsar-gen path/to/acme-pack.pulsar --target swift --out ./Generated

# Multiple targets at once
npx pulsar-gen acme-pack.pulsar --target swift,kotlin,dart,rn --out ./gen

# Kotlin package / print to stdout
npx pulsar-gen acme-pack.pulsar --target kotlin --package com.acme.haptics --stdout
```

Targets: `swift` (`enum` + `BundleDescriptor`), `kotlin` (`object` + `BundleDescriptor`),
`dart` (`*.bundle.dart`), `rn` (`*.bundle.ts` module with a bound `loadBundle` function).

The RN module **inlines each preset's device pattern** and statically requires the sibling
`.pulsar` asset, and exports two loaders. `loadBundleSync()` is synchronous and uses only the
inline patterns; `loadBundleAsync()` returns a Promise and loads the binary natively
for authored audio. JSON Lottie animations are inlined too when you pass `animations`, since
they are rendered in JS.

`react-native-pulsar` ships a zero-dependency copy of this emitter as `npx pulsar-gen-rn`, so apps
can regenerate modules without installing pulsar-gen. The test suite pins the two to byte-identical
output — change one and update the other.

## Programmatic API (portable — importable from Studio's browser bundle)

```ts
import {
  validateManifest,
  generate,
  buildSidecar,
} from "pulsar-gen";
// Node-only helpers (disk + zip):
import { readBundleFile, computeContentHash } from "pulsar-gen/read";

const { manifest, entries } = readBundleFile("acme-pack.pulsar");
generate(manifest, "rn", {
  patterns: extractPatterns(manifest, entries),
  animations: extractAnimations(manifest, entries).animations,
});
```

The emitters (`src/emit/*`), `generate`, and `validateManifest` use no Node APIs, so Studio reuses
them directly for in-browser export. `read`/`zip`/`cli` are Node-only.

## Develop

Working in this repo, run the CLI straight from source — Node type-strips it, no build step
(needs Node ≥ 23.6, unlike the published package):

```bash
node src/cli.ts acme-pack.pulsar --target swift --stdout
```

```bash
npm install                      # typescript + @types/node
node fixtures/build-fixture.ts   # regenerate the fixture bundle + golden outputs
node --test                      # run the test suite (runs against src/, not dist/)
npm run typecheck                # tsc --noEmit
npm run build                    # tsc -p tsconfig.build.json -> dist/ (what gets published)
```

## Publishing

`prepack` builds `dist/`, so `npm publish` from this directory ships compiled JS. That is not
optional: Node refuses to type-strip files under `node_modules`
(`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a package whose `bin` points at a `.ts` file
cannot run once installed.
