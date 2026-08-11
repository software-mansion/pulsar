# Example-app bootstrapper

`scripts/bootstrap-app.mjs` re-creates a framework example app **from scratch**
using the official scaffolding tool for that framework, then overlays only the
reusable demo source and the small amount of SDK wiring. The goal: **stop
hand-maintaining generated config and dependencies in the example apps** — bump
a version, re-bootstrap, done.

```bash
npm run bootstrap -- <framework> [options]
# or: node scripts/bootstrap-app.mjs <framework> [options]
```

Frameworks: `web` · `react-native` (`rn`) · `flutter` · `ios` · `android` · `kmp`

> The root Expo showcase app (`PulsarApp/`) is intentionally **not** bootstrapped — it is
> maintained directly, not regenerated.

## The model

Every example app is three layers:

| Layer | What | Who owns it |
| --- | --- | --- |
| **SHELL** | platform folders, gradle/pods wrappers, project files, default entrypoints, lockfiles | the scaffolder — regenerable, never hand-edited |
| **CONTENT** | the demo UI that showcases the SDK (`src/`, screens, `App.tsx`, `main.dart`, `App.kt`, …) | you — the source of truth, copied verbatim |
| **WIRING** | the few deltas that point the app at the local Pulsar SDK (`file:` dep, metro/vite config, Podfile blocks, gradle include, SPM ref) | you — small, mechanical |

The bootstrapper regenerates SHELL, overlays CONTENT verbatim from the **live git
tree** (nothing is duplicated into a separate template folder — the app dir *is*
the source of truth), and re-applies WIRING.

## Three recipe kinds

Not every framework has a real scaffolder. Recipes come in three kinds:

| Kind | Frameworks | How the shell is produced |
| --- | --- | --- |
| **`cli`** | web, react-native, flutter | run the official generator (`npm create vite`, RN community CLI, `flutter create`) — the shell is regenerated at the **latest** framework version (nothing is pinned; the generator decides) |
| **`xcodegen`** | ios | there is no CLI that emits an `.xcodeproj`; a checked-in declarative `project.yml` generates it via [XcodeGen](https://xcodegen.com). This *does* eliminate hand-maintaining the merge-hostile `project.pbxproj` |
| **`template`** | android, kmp | **no scaffolder exists** (Gradle `init` only makes JVM apps; the KMP wizard is interactive and its layout has drifted), so there is no "latest" to fetch. The tracked tree is a frozen template + overlay, and the toolchain (AGP/Kotlin/Gradle/Compose) is synced from a central [`toolchain.json`](#toolchain-versions-android--kmp) |

## Per-framework summary

| fw | scaffold | content overlay | wiring |
| --- | --- | --- | --- |
| **web** | `npm create vite@latest … --template react-ts` | `src/`, `index.html`, `vite.config.ts`, `tsconfig.json` | `pulsar-haptics: file:../Pulsar` + vite alias + tsconfig path → `../Pulsar/src/index.ts` |
| **react-native** | `@react-native-community/cli init example --version <RN>` | `App.tsx`, `src/`, config files, `ios/Podfile` | `file:` dep + 4 RN libs; `metro`/`react-native.config`/`babel` overlaid; Podfile preserved (local pod block + Xcode-26 fmt patch) |
| **flutter** | `flutter create --org com.example --project-name pulsarapp --platforms android,ios --empty` | `lib/main.dart`, `ios/Podfile` | `pulsar_haptics: { path: ../pulsar }` in pubspec; Podfile env blocks |
| **ios** | XcodeGen from generated `project.yml` | `PulsarApp/*.swift`, tests, `Assets.xcassets` | local Swift package `path: ../Pulsar` (or published url/from from `sdk-versions.json`) |
| **android** | copy tracked template | (whole tree) | `project(":Pulsar")` include; `VIBRATE` permission; version catalog keeps library-only entries |
| **kmp** | copy tracked template | `composeApp/…/App.kt` | composite build + dependency substitution in `settings.gradle.kts`; `api()`/`export()` in `composeApp/build.gradle.kts` |

Run `node scripts/bootstrap-app.mjs <fw> --dry-run` to see the exact plan for any framework.

## Options

| Flag | Effect |
| --- | --- |
| *(none)* | build into a **staging** dir `‹framework›/.bootstrap-PulsarApp` (git-ignored) — nothing existing is touched |
| `--apply` | overwrite the real `‹framework›/PulsarApp` (refuses on a dirty tree unless `--force`) |
| `--into <dir>` | build into a custom directory |
| `--published` | wire the **published** Pulsar SDK instead of local sources (uses `sdk-versions.json`) |
| `--no-install` | skip dependency install |
| `--verify` | run the framework's build/analyze check afterwards |
| `--dry-run` | print the plan and exit |
| `--list` | list frameworks |

**Why staging is adjacent to the app:** the SDK wiring is all *relative* paths
(`file:../Pulsar`, `../Pulsar/src/index.ts`, `project(":Pulsar")`). The staging
dir sits next to the real app (as a sibling of the SDK) so those paths resolve
without `--apply`. Review the staged app, then re-run with `--apply`.

## Typical workflow (e.g. bumping React Native)

```bash
# 1. edit the pinned version in scripts/bootstrap/recipes.mjs (REACT_NATIVE_VERSION)
# 2. regenerate into staging and eyeball the diff
node scripts/bootstrap-app.mjs rn
diff -rq react-native/PulsarApp react-native/.bootstrap-PulsarApp   # inspect
# 3. apply
node scripts/bootstrap-app.mjs rn --apply
```

## Toolchain versions (android / kmp)

The `cli` frameworks always scaffold the **latest** framework version — nothing is
pinned. But android and kmp have no scaffolder, so there is no "latest" to fetch;
their toolchain must be stated explicitly. It lives in one place —
[`scripts/bootstrap/toolchain.json`](toolchain.json) — and is synced into each
app's Gradle version catalog (`gradle/libs.versions.toml`) and wrapper on bootstrap:

```jsonc
{
  "android": { "gradle": "8.13",   "versions": { "agp": "…", "kotlin": "…", "composeBom": "…" } },
  "kmp":     { "gradle": "8.14.3", "versions": { "agp": "…", "kotlin": "…", "composeMultiplatform": "…", … } }
}
```

Keys under `versions` map to the `[versions]` aliases in that app's catalog; only
those keys are rewritten — incidental library versions and the library-only
entries `Android/Pulsar` borrows (`nmcp`, `kotlinx-serialization-json`,
`appcompat`, `material`) are never touched. **Bump the toolchain here, then
re-bootstrap** — that's the one place. (Auto-resolving "latest" for these isn't
offered because AGP/Kotlin/Compose-Multiplatform are version-coupled and
"latest everything" routinely breaks; explicit pins keep the builds reproducible.)

## What still needs a human

- **The extra RN libraries** (`react-native-reanimated` + `react-native-worklets`
  and friends) are pinned in the recipe and must stay a compatible pair as RN
  advances — reanimated 4.5+ needs worklets 0.10.x.
- **Adopting the iOS `xcodegen` flow** is opt-in and not yet wired into the repo:
  it means git-ignoring `iOS/PulsarApp/PulsarApp.xcodeproj` and adding
  `brew install xcodegen && xcodegen generate` to `.github/workflows/_build-ios-native.yml`.
  Until then the recipe just stages the spec + Swift so you can trial it.
- **`react-native` `ios/Podfile`** is preserved verbatim (it carries the local
  `PulsarHaptics` pod block and the Xcode-26 fmt patch). Revisit it when bumping RN.

## Design notes

- Dependency-free Node ESM, matching `scripts/sync-sdk-versions.mjs`. File
  enumeration uses `git ls-files`, so only tracked source is ever copied
  (`node_modules`, `build/`, `Pods/` are never touched).
- Each app is built in an isolated temp dir and only *placed* at the end, so the
  live app is untouched until the final step (and `--apply` refuses on a dirty tree).
- The CI `test-build-apps.yml` grep guards (that the demo actually imports the
  SDK) stay valid because CONTENT is copied verbatim and always contains the import.
