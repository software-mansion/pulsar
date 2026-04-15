# Migrating from expo-haptics to Pulsar

`expo-haptics` offers a small set of generic system-level haptics. Pulsar replaces them with richer, more expressive equivalents.

## Installation

```bash
# Expo
npx expo install react-native-pulsar
npx expo prebuild

# Yarn / npm / pnpm / Bun
yarn add react-native-pulsar react-native-worklets
```

**Requirements:** React Native 0.71+, New Architecture enabled.

## Mapping: expo-haptics → Pulsar

| expo-haptics | Pulsar equivalent | Notes |
|---|---|---|
| `Haptics.impactAsync(ImpactFeedbackStyle.Light)` | `Presets.System.impactLight()` | Direct system preset |
| `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` | `Presets.System.impactMedium()` | Direct system preset |
| `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)` | `Presets.System.impactHeavy()` | Direct system preset |
| `Haptics.impactAsync(ImpactFeedbackStyle.Soft)` | `Presets.System.impactSoft()` | Android: expo-haptics uses identical waveform as Light |
| `Haptics.impactAsync(ImpactFeedbackStyle.Rigid)` | `Presets.System.impactRigid()` | Android: expo-haptics uses identical waveform as Medium |
| `Haptics.notificationAsync(NotificationFeedbackType.Success)` | `Presets.System.notificationSuccess()` | Direct system preset |
| `Haptics.notificationAsync(NotificationFeedbackType.Warning)` | `Presets.System.notificationWarning()` | Direct system preset |
| `Haptics.notificationAsync(NotificationFeedbackType.Error)` | `Presets.System.notificationError()` | Direct system preset |
| `Haptics.selectionAsync()` | `Presets.System.selection()` | Android: expo-haptics uses identical waveform as Light impact |

### Android notes

expo-haptics on Android uses raw `VibrationEffect.createWaveform()` patterns rather than system effects or predefined constants. Several styles collapse to identical vibrations on Android:

- **`Soft` = `Light`** — expo-haptics uses the exact same waveform (amplitude 30, 50 ms) for both
- **`Rigid` = `Medium`** — expo-haptics uses the exact same waveform (amplitude 50, 43 ms) for both
- **`selectionAsync`** — same waveform as `Light` impact (amplitude 30, 50 ms)
- **Notification types** — multi-pulse waveforms: `success` is two pulses, `warning` is two pulses at lower amplitude, `error` is three pulses

Pulsar's `Presets.System.*` equivalents use actual Android system effects (`VibrationEffect.EFFECT_CLICK`, `EFFECT_TICK`, etc.), which respect device-level haptic tuning and feel more native. The Android feel will be higher quality with Pulsar than with expo-haptics.

For tighter per-platform control or to match the exact Android effect used under each Pulsar preset, use the Android-specific presets directly (no-ops on iOS):

| expo-haptics | Pulsar Android-specific | Android effect |
|---|---|---|
| `impactAsync(Light)` | `Presets.System.Android.effectClick()` | `VibrationEffect.EFFECT_CLICK` |
| `impactAsync(Medium)` | `Presets.System.Android.effectHeavyClick()` | `VibrationEffect.EFFECT_HEAVY_CLICK` |
| `impactAsync(Heavy)` | `Presets.System.Android.effectHeavyClick()` | `VibrationEffect.EFFECT_HEAVY_CLICK` |
| `impactAsync(Soft)` | `Presets.System.Android.effectTick()` | `VibrationEffect.EFFECT_TICK` (Soft = Light in expo) |
| `impactAsync(Rigid)` | `Presets.System.Android.effectClick()` | `VibrationEffect.EFFECT_CLICK` (Rigid = Medium in expo) |
| `selectionAsync()` | `Presets.System.Android.effectTick()` | `VibrationEffect.EFFECT_TICK` (same waveform as Light in expo) |
| `notificationAsync(Success)` | `Presets.System.Android.effectDoubleClick()` | `VibrationEffect.EFFECT_DOUBLE_CLICK` |
| `notificationAsync(Warning)` | `Presets.System.Android.effectHeavyClick()` | `VibrationEffect.EFFECT_HEAVY_CLICK` |
| `notificationAsync(Error)` | `Presets.System.Android.effectDoubleClick()` | `VibrationEffect.EFFECT_DOUBLE_CLICK` |

## Code Migration Example

```tsx
// BEFORE: expo-haptics
import * as Haptics from 'expo-haptics';

function handleSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function handleButtonPress() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// AFTER: Pulsar — drop-in system preset replacements
import { Presets } from 'react-native-pulsar';

function handleSuccess() {
  Presets.System.notificationSuccess(); // identical feel, worklet-compatible
}

function handleButtonPress() {
  Presets.System.impactMedium();
}

// OR: take advantage of Pulsar's expressive library
function handleSuccess() {
  Presets.flourish(); // richer, more celebratory than a plain system notification
}

function handleButtonPress() {
  Presets.ping(); // crisp and precise — feels like a real selection
}
```

## Key Differences

- Pulsar functions are **synchronous and worklet-compatible** — no `await` needed.
- 150+ named presets let you match the haptic character to the action semantics.
- Caching and preloading give you **zero-latency playback** on critical interactions.
- Custom `Pattern` composition and real-time `useRealtimeComposer` have no expo-haptics equivalent.
