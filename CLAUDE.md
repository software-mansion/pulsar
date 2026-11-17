# pulsar

<!-- Table of contents for agents and humans. Keep it under ~100 lines: point to where things live
     instead of explaining them here. `/factory:setup` fills in the TODOs with you. -->

## What this is
Pulsar is Software Mansion's haptics SDK: built-in haptic presets, a pattern composer (discrete impulses +
continuous amplitude/frequency envelopes), a realtime composer for gesture-driven feedback, and Lottie-synced
haptics. It ships the same API for iOS, Android, React Native, Kotlin Multiplatform, Flutter and the Web, for app
developers who want rich haptics without writing CoreHaptics/Vibrator code. Published versions: `sdk-versions.json`.

## Map
| Where | What |
|---|---|
| `iOS/Pulsar` | native iOS SDK (Swift package `Pulsar`; CocoaPod `PulsarHaptics`), tests in `Tests/PulsarTests` |
| `Android/Pulsar` | native Android SDK (Maven `com.swmansion:pulsar`); built from `Android/PulsarApp` |
| `react-native/react-native-pulsar` | RN bridge (npm `react-native-pulsar`): TS API in `src/`, native in `ios/` + `android/` |
| `kmp/Pulsar`, `flutter/pulsar` | KMP library and Flutter plugin (`pulsar_haptics`) wrapping the native SDKs |
| `web/Pulsar` | web SDK (npm `pulsar-haptics`) |
| `*/PulsarLottie`, `react-native/react-native-pulsar-lottie` | Lottie-animation-synced haptics per platform |
| `*/PulsarApp` | example / demo apps per platform |
| `tools/` | `pulsar-gen` (typed `.pulsar` bundle codegen), `schema/`, `preset-audio`, `scripts/` (lint, version sync, app bootstrap) |
| `docs/` | Astro documentation site (docs.swmansion.com/pulsar) |
| `pulsar-private/` | separate private repo (Studio, Figma plugin, real app); gitignored here, never commit into it from this repo |
| `specs/` | living specs, one file per capability (see `specs/README.md`) |
| `.factory/` | factory config, verification profile, merge policy, rules, knowledge |

## Commands
No root test runner: run each package's own commands (the factory gate picks them by changed paths).
- RN SDK: `cd react-native/react-native-pulsar && npx tsc --noEmit && npx jest`
- RN Lottie: `cd react-native/react-native-pulsar-lottie && npm test`
- Web / pulsar-gen: `cd web/Pulsar` (or `tools/pulsar-gen`) `&& npm run typecheck && npm test`
- Android SDK: `cd Android/PulsarApp && ./gradlew :Pulsar:testDebugUnitTest` (if no Java runtime:
  `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`)
- iOS SDK: `.factory/verification/checks/ios-sdk-tests.sh` (needs a simulator; `swift build/test` fails, UIKit)
- KMP: `cd kmp/Pulsar && ./gradlew :library:allTests` · Flutter: `cd flutter/pulsar && flutter test`
- Lint: `npm run lint` (eslint + ktlint + swiftlint; main has pre-existing violations, lint what you touch)
- Full gate (what "done" means): `factory check`

## Conventions
- One API, six platforms: a behaviour change in one SDK usually needs the matching change (and docs) in the others.
  RN/KMP/Flutter wrap the native SDKs; fix bugs at the native layer, not in each wrapper.
- In-repo builds compile the wrappers against local `iOS/Pulsar` / `Android/Pulsar` sources
  (`USE_LOCAL_PULSAR_IOS` / `USE_LOCAL_PULSAR_ANDROID`, default on in the monorepo); `=0` uses the published artifact.
- iOS CocoaPod name must equal its module name (`PulsarHaptics`), or `use_frameworks!` consumers break.
- Versions live in `sdk-versions.json`; propagate with `npm run sync:versions`, never hand-edit `pulsar-sync:` markers.
- Keep code self-explanatory; no long comments.
Path-specific rules live in `.factory/rules/` (loaded automatically for matching files).

## Deeper docs
- Specs: `specs/<capability>.md`
- Knowledge (past gotchas and fixes): `factory kb search "<topic>"`
- SDK docs and guides: `docs/src/content/`; contributor setup: `CONTRIBUTING.md`

<!-- factory:start -->
## Factory
This repo is run with the factory framework (`.factory/`). Work items live on the board: `factory task show <id>`.
- Done means `factory check` prints `GATE: PASS`. Never weaken tests, lint, CI or coverage to get there.
- Search knowledge before investigating: `factory kb search "<error or topic>"`.
- `specs/<capability>.md` describe current behaviour; behaviour changes need a delta in `specs/changes/<task-id>/`.
- Never edit `.factory/policy/` or `.factory/verification/`.
- Blocked on a product decision: `factory task needs-human <id> --question "..."` and stop.
- Out-of-scope work you notice: `factory task create --title "..." --type chore` instead of doing it.
<!-- factory:end -->
