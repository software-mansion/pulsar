# @pulsar/haptics

A lightweight TypeScript library for playing haptics (vibrations) on web devices. Works directly in HTML via `<script>` tags and integrates seamlessly with React and modern bundlers via ES modules.

## Features

- 🎯 **Simple API** - Easy to use for both simple taps and complex patterns
- 📦 **Dual Distribution** - Works as UMD (script tags) and ESM (imports)
- 📱 **Cross-device** - Works on all devices with Vibration API support
- 🎨 **Preset Patterns** - Built-in patterns (tap, pulse, success, warning, error)
- ⚙️ **Custom Patterns** - Create and register your own haptic sequences
- 📝 **TypeScript** - Fully typed with strict mode enabled
- 🔧 **Watch Mode** - Development with Hot Module Reloading

## Installation

### For Node.js / React Projects

```bash
npm install @pulsar/haptics
# or
yarn add @pulsar/haptics
```

### Direct Browser Usage

Include the UMD bundle directly in HTML:

```html
<script src="https://unpkg.com/@pulsar/haptics@latest/dist/haptics.umd.js"></script>
<script>
  // Use window.Haptics
  window.Haptics.playHaptic({ duration: 100 })
</script>
```

## Usage

### Basic Usage (CommonJS / React)

```typescript
import { playHaptic, playPattern } from '@pulsar/haptics'

// Simple haptic
playHaptic()

// Customized haptic
playHaptic({
  duration: 200,
  intensity: 'heavy',
  delay: 0
})

// Play preset pattern
playPattern('success')
playPattern('error')
playPattern('warning')
playPattern('tap')
playPattern('pulse')
```

### In HTML (UMD)

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="dist/haptics.umd.js"></script>
  </head>
  <body>
    <button onclick="window.Haptics.playHaptic()">Tap me</button>
    <script>
      window.Haptics.playPattern('tap')
    </script>
  </body>
</html>
```

### Using the Singleton Instance

```typescript
import { haptics } from '@pulsar/haptics'

haptics.play({ duration: 100, intensity: 'medium' })
haptics.stop()
haptics.pause()
haptics.resume()
haptics.playPattern('success')
haptics.getStatus() // 'idle' | 'playing' | 'paused' | 'stopped'
```

### Creating Custom Patterns

```typescript
import { haptics } from '@pulsar/haptics'

haptics.registerPattern({
  name: 'custom-pattern',
  effects: [
    { duration: 50, intensity: 'light' },
    { duration: 50, intensity: 'medium', delay: 50 },
    { duration: 100, intensity: 'heavy', delay: 50 }
  ]
})

haptics.playPattern('custom-pattern')
```

### Checking Device Support

```typescript
import { haptics, isVibrationSupported } from '@pulsar/haptics'

if (isVibrationSupported()) {
  haptics.play()
} else {
  console.log('Device does not support haptics')
}

// Or check capabilities
const capabilities = haptics.getCapabilities()
console.log(capabilities.supported) // boolean
console.log(capabilities.supportedIntensities) // ['light', 'medium', 'heavy']
```

## API Reference

### Functions

#### `playHaptic(config?: HapticConfig): void`

Play a single haptic effect.

**Parameters:**
- `config` (optional) - Configuration object

#### `playPattern(patternId: string): void`

Play a registered haptic pattern.

**Parameters:**
- `patternId` - ID of the pattern to play

#### `stopHaptic(): void`

Stop the current haptic playback immediately.

### HapticsManager Instance

The `haptics` singleton provides:

- `play(config?: HapticConfig): void` - Play a haptic
- `stop(): void` - Stop playback
- `pause(): void` - Pause playback
- `resume(): void` - Resume paused playback
- `playPattern(patternId: string): void` - Play a pattern
- `registerPattern(input: HapticPatternInput): void` - Register custom pattern
- `getPattern(patternId: string): HapticPattern | undefined` - Get pattern details
- `getAllPatterns(): HapticPattern[]` - Get all patterns
- `getStatus(): HapticStatus` - Get playback status
- `getCapabilities(): HapticCapabilities` - Get device capabilities

### Types

```typescript
interface HapticConfig {
  duration?: number        // milliseconds (default: 100)
  intensity?: HapticIntensity // 'light' | 'medium' | 'heavy' (default: 'medium')
  delay?: number          // milliseconds (default: 0)
  loop?: boolean          // repeat pattern (default: false)
  loopCount?: number      // number of repetitions (default: 1)
}

type HapticIntensity = 'light' | 'medium' | 'heavy'

type HapticStatus = 'idle' | 'playing' | 'paused' | 'stopped'

interface HapticCapabilities {
  supported: boolean
  maxDuration: number
  supportedIntensities: HapticIntensity[]
  supportsPatterns: boolean
}
```

## Development

### Scripts

- `npm run dev` - Start TypeScript watch mode
- `npm run build` - Build UMD and ESM bundles
- `npm run typecheck` - Type check without emitting
- `npm run preview` - Preview built library
- `npm run clean` - Remove build artifacts

### Building

```bash
npm run build
```

Outputs to `dist/`:
- `haptics.umd.js` - UMD bundle (for script tags)
- `haptics.es.js` - ES module bundle (for import)
- `haptics.d.ts` - TypeScript declarations

## Browser Support

Works on all modern browsers that support the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API):

- Chrome 32+
- Firefox 26+
- Safari on iOS 13+
- Edge 15+
- Android browsers

## License

MIT - see LICENSE file
