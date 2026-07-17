# Choosing the Right Preset

See [preset-selection.md](preset-selection.md) and [preset-catalog.md](preset-catalog.md) for the full categorized preset reference — all descriptions and "when to use" guidance apply equally to React Native.

All presets are called directly on the `Presets` object:

```ts
import { Presets } from 'react-native-pulsar';

Presets.stamp();
Presets.ping();
Presets.buzz();
```
