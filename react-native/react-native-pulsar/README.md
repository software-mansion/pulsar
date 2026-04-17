<p align="center">
  <img src="https://github.com/software-mansion/pulsar/blob/main/docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for React Native. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

## Features

- **Presets** - Library of built-in haptic patterns (hammer, dogBark, buzz, pulse) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Cross-platform** - Consistent API across iOS (Swift), Android (Kotlin), and React Native (TypeScript)
- **Worklet-compatible** - All React Native preset functions and hook methods work inside Reanimated worklets

## Quick start

### Installation

<!-- GENERATED:REACT_NATIVE_VERSION_START -->
Latest available version: `1.3.0`
<!-- GENERATED:REACT_NATIVE_VERSION_END -->

```bash
npx expo install react-native-pulsar react-native-worklets
```

### Preset example

```ts
import { Presets } from 'react-native-pulsar';

// Play a preset
Presets.hammer();

// Play a system haptic
Presets.System.impactMedium();
```

### usePatternComposer example

```ts
import { usePatternComposer } from 'react-native-pulsar';

const pattern = {
  discretePattern: [
    { time: 0, amplitude: 1, frequency: 0.5 },
    { time: 100, amplitude: 0.5, frequency: 0.5 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0 },
      { time: 200, value: 1 },
      { time: 400, value: 0 },
    ],
    frequency: [
      { time: 0, value: 0.3 },
      { time: 400, value: 0.8 },
    ],
  },
};

const { play } = usePatternComposer(pattern);

play();
```

### useRealtimeComposer example

```ts
import { useRealtimeComposer } from 'react-native-pulsar';

const { set, stop } = useRealtimeComposer();

set(0.7, 0.5);
stop();
```

## Documentation

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar).

- [SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview) - Core concepts: types of haptics, preloading, and caching
- [React Native SDK](https://docs.swmansion.com/pulsar/sdk/react-native) - TypeScript API reference

## AI Skills

Install the `pulsar-haptics` skill from the [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) repository:

```text
/plugin marketplace add software-mansion-labs/skills
/plugin install skills@swmansion
/reload-plugins
```

Or with `npx`:

```bash
npx skills add software-mansion-labs/skills
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

Pulsar library is licensed under [The MIT License](LICENSE).

## Try the Pulsar App

Download the Pulsar companion app to feel haptic presets directly on your device:

- [App Store](https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104)
- [Google Play](https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app)

## Community Discord

[Join the Software Mansion Community Discord](https://discord.swmansion.com) to chat about haptics or other Software Mansion libraries.

## Pulsar is created by Software Mansion

Since 2012 [Software Mansion](https://swmansion.com) is a software agency with experience in building web and mobile apps. We are Core React Native Contributors and experts in dealing with all kinds of React Native issues. We can help you build your next dream product – [Hire us](https://swmansion.com/contact/projects?utm_source=reanimated&utm_medium=readme).
