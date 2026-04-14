# Choosing the Right Preset

See [common/presets-guide.md](../common/presets-guide.md) for the full categorized preset reference — all descriptions and "when to use" guidance apply equally to React Native.

All presets are called directly on the `Presets` object:

```ts
import { Presets } from 'react-native-pulsar';

Presets.stamp();
Presets.ping();
Presets.buzz();
```
