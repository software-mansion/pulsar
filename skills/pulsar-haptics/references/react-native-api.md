# Pulsar React Native API

## Contents

- [Install](#install)
- [Play presets](#play-presets)
- [System presets](#system-presets)
- [Caching and settings](#caching-and-settings)
- [Compatibility](#compatibility)
- [Worklets](#worklets)

## Install

```bash
# Expo
npx expo install react-native-pulsar
npx expo prebuild

# npm
npm install react-native-pulsar react-native-worklets
```

Requires React Native 0.71+, New Architecture, and `react-native-worklets` for gesture integration.

## Play Presets

Preset functions are synchronous, parameterless, and worklet-compatible.

```tsx
import { Presets } from 'react-native-pulsar';

<Button title="Confirm" onPress={() => Presets.stamp()} />
```

Use `scripts/find_presets.py` to discover valid names. Convert the returned lower-camel `method` directly to `Presets.<method>()`.

## System Presets

```ts
import { Presets } from 'react-native-pulsar';

Presets.System.impactLight();
Presets.System.impactMedium();
Presets.System.impactHeavy();
Presets.System.impactSoft();
Presets.System.impactRigid();
Presets.System.notificationSuccess();
Presets.System.notificationWarning();
Presets.System.notificationError();
Presets.System.selection();
```

Android-specific system effects live under `Presets.System.Android`, including `effectClick`, `effectDoubleClick`, `effectHeavyClick`, `effectTick`, and composition primitives. Use these only when Android-specific behavior is intentional.

## Caching and Settings

Pulsar caches preset players by default. Preload only latency-critical presets, using PascalCase names:

```ts
import { Settings } from 'react-native-pulsar';

Settings.preloadPresets(['Ping', 'Stamp', 'Fanfare']);
Settings.enableCache(true);
Settings.clearCache();
```

Relevant settings:

| Method | Purpose |
|---|---|
| `Settings.enableHaptics(boolean)` | Globally enable or disable haptics. |
| `Settings.enableSound(boolean)` | Toggle simulator/emulator audio. |
| `Settings.enableCache(boolean)` | Toggle preset caching. |
| `Settings.preloadPresets(string[])` | Preload PascalCase preset names. |
| `Settings.stopHaptics()` | Stop active playback. |
| `Settings.shutDownEngine()` | Release engine resources. |
| `Settings.getHapticsSupportLevel()` | Return current `HapticSupport`. |
| `Settings.forceHapticsSupportLevel(level)` | Override Android support for testing. |
| `Settings.setRealtimeComposerStrategy(strategy)` | Select Android realtime strategy. |

## Compatibility

```ts
import { HapticSupport, Settings } from 'react-native-pulsar';

const support = Settings.getHapticsSupportLevel();

if (support >= HapticSupport.STANDARD_SUPPORT) {
  Presets.stamp();
} else if (support >= HapticSupport.LIMITED_SUPPORT) {
  Presets.System.impactMedium();
}
```

Levels are `NO_SUPPORT`, `LIMITED_SUPPORT`, `STANDARD_SUPPORT`, and `ADVANCED_SUPPORT`. Keep visual feedback regardless of level.

## Worklets

Preset functions and composer hook methods can run directly inside Reanimated gesture callbacks:

```ts
const tap = Gesture.Tap().onEnd(() => {
  Presets.ping();
});
```

For custom patterns, read [PatternComposer](pattern-composer.md). For `useRealtimeComposer`, read [gesture haptics](gesture-haptics.md).

Official docs: [Pulsar React Native SDK](https://docs.swmansion.com/pulsar/sdk/react-native/).
