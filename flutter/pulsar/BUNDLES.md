# Preset bundles (Flutter)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete.

## Setup

1. Add the bundle as an asset (declare the directory once — new bundles need no extra entry):

   ```yaml
   # pubspec.yaml
   flutter:
     assets:
       - assets/pulsar/
   ```

2. Generate the typed accessor (`*.bundle.dart`) with `pulsar-gen`:

   ```bash
   npx @swmansion/pulsar-gen assets/pulsar/acme-pack.pulsar --target dart --out lib/bundles/
   ```

   (A `build_runner` builder wrapping this is a planned convenience; the CLI is the source of truth.)

## Usage

```dart
import 'package:pulsar_haptics/pulsar_haptics.dart';
import 'bundles/acme_pack.bundle.dart';

final pulsar = Pulsar();
final bundle = await pulsar.loadBundle(acmePack); // acmePack is generated
bundle.heartbeatV2.play();                 // ← autocompletes
bundle.explosion.stop();
```

Pass `strict: true` to assert the loaded bundle's content hash matches the generated types. The app
reads the `.pulsar` asset bytes and hands them to the native SDK, which decodes and plays; synced
audio uses the native iOS/Android path. Animation bytes are carried for your own Lottie view.
