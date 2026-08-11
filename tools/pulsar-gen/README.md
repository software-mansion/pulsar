# pulsar-gen

Generates the **typed view** of a Pulsar `.pulsar` bundle so `bundle.presets.<id>` autocompletes in
your IDE. See [`docs/bundle-format.md`](../../docs/bundle-format.md) for the bundle format itself.

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
`dart` (`*.bundle.dart`), `rn` (`.presets.json` sidecar — types arise from `keyof` inference over
the imported JSON, à la nano-icons; no `.d.ts` is generated).

## Programmatic API (portable — importable from Studio's browser bundle)

```ts
import { validateManifest, generate, buildSidecar } from '@swmansion/pulsar-gen';
// Node-only helpers (disk + zip):
import { readBundleFile, computeContentHash } from '@swmansion/pulsar-gen/read';
```

The emitters (`src/emit/*`), `generate`, and `validateManifest` use no Node APIs, so Studio reuses
them directly for in-browser export. `read`/`zip`/`cli` are Node-only.

## Develop

```bash
node fixtures/build-fixture.ts   # regenerate the fixture bundle + golden outputs
node --test                      # run the test suite
npm run typecheck                # tsc --noEmit (needs `npm install` for typescript first)
```
