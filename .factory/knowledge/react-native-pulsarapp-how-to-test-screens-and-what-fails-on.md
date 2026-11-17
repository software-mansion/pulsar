---
id: react-native-pulsarapp-how-to-test-screens-and-what-fails-on
title: "react-native/PulsarApp: how to test screens and what fails on main"
type: gotcha
summary: PulsarApp jest cannot load App or native-backed screens without per-test mocks; changing jest.config.js trips the diff guard, so put jest.mock calls inside the test file. Full tsc fails on pre-existing react-native-pulsar-lottie PresetHandle errors.
symptoms:
  - App.test.tsx fails with TurboModuleRegistry.getEnforcing 'RNGestureHandlerModule'/'RNPulsar' could not be found
  - "jest SyntaxError: Invalid or unexpected token on assets/*.mp3 or hapticsBundle.pulsar"
  - npx tsc --noEmit in react-native/PulsarApp reports PresetHandle errors from ../react-native-pulsar-lottie
  - factory check fails with diff-guard test-config-modified for jest.config.js
  - factory check lint/unit fail at repo root with no eslint.config or unrelated web/tools suites
aliases:
  - PulsarApp jest native module missing
  - demo app test mocks
  - App.test.tsx fails on main
  - lottie PresetHandle type error
  - factory gate runs at repo root
error_signatures:
  - "'RNPulsar' could not be found"
  - "'RNGestureHandlerModule' could not be found"
  - Module '"react-native-pulsar"' has no exported member 'PresetHandle'
  - test-config-modified react-native/PulsarApp/jest.config.js
  - ESLint couldn't find an eslint.config.* file
fix: "Mock inside the test file: jest.mock('react-native-pulsar', () => require('react-native-pulsar/jest-mock')); mock react-native-gesture-handler (GestureHandlerRootView -> View) and stub heavy screens (mp3/.pulsar imports) with jest.mock. Do not edit jest.config.js/tsconfig.json (diff guard). Use rn-app-lint / rn-app-unit verifiers (scoped to PulsarApp). In a fresh worktree run npm ci in react-native/PulsarApp. The tsc lottie errors are pre-existing; a tsconfig paths mapping react-native-pulsar -> ../react-native-pulsar/src fixes them but needs a human to land it."
components:
  - react-native/PulsarApp/**
  - react-native/PulsarApp/__tests__/**
applies_when:
  - adding or testing a screen in react-native/PulsarApp
  - factory check fails on PulsarApp jest or tsc
tags:
  - react-native
  - jest
  - pulsarapp
  - diff-guard
  - gate
refs:
  - react-native/PulsarApp/__tests__/App.test.tsx
  - react-native/PulsarApp/__tests__/WeatherScreen.test.tsx
  - .factory/runs/T-7mmxrjkydm/R-7mw1ew2c6f/evidence/CP2/jest-tsc-config.patch
provenance:
  source: compound
  task: T-7mmxrjkydm
  run: R-7mw1ew2c6f
created: 2026-11-17
last_verified: 2026-11-17
retire_when: PulsarApp jest.config.js has a setup file that mocks native modules and assets, and tsc passes without lottie errors.
---
## Summary
PulsarApp's own jest config is the bare react-native preset. Importing App or screens that touch native modules (gesture-handler, RNPulsar via PublicApisScreen, reanimated, worklets) or assets (.mp3, .pulsar bundles) fails on main. Editing jest.config.js or tsconfig.json is blocked by the diff guard rule test-config-modified.

## Fix
- Put jest.mock calls inside the test file (see __tests__/App.test.tsx, WeatherScreen.test.tsx): react-native-pulsar via its jest-mock, gesture-handler root view as View, stub the other screens.
- Mock global fetch per test; restore it afterwards.
- Gate verifiers rn-app-lint and rn-app-unit are scoped to PulsarApp; run npm ci in react-native/PulsarApp first in a new worktree.
- Full npx tsc --noEmit still shows react-native-pulsar-lottie PresetHandle errors (lottie resolves published react-native-pulsar 1.7.0). That is pre-existing; the patch in the run evidence fixes it via tsconfig paths and needs a human.
- The demo app crashes at launch on the iOS 27 simulator (UIScene lifecycle); verify on an Android emulator with USE_LOCAL_PULSAR_ANDROID=1.
