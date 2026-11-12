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
   npx pulsar-gen assets/pulsar/acme-pack.pulsar --target dart --out lib/bundles/
   ```

   (A `build_runner` builder wrapping this is a planned convenience; the CLI is the source of truth.)

## Usage

```dart
import 'package:pulsar_haptics/pulsar_haptics.dart';
import 'bundles/acme_pack.bundle.dart';

final pulsar = Pulsar();
final bundle = await pulsar.loadBundleAsync(acmePack); // acmePack is generated
bundle.heartbeatV2.play();                 // ← autocompletes
bundle.heartbeatV2.play(fromMs: 2500);     // starts 2.5s in
bundle.explosion.stop();
```

The loaded bundle's content hash is asserted against the generated types unless you pass
`strict: false`. The app
reads the `.pulsar` asset bytes and hands them to the native SDK, which decodes and plays; synced
audio uses the native iOS/Android path. Animation bytes are carried for your own Lottie view.

A preset authored against a video carries it as `video` instead of an animation — the native SDK
extracts the MP4 to a cache file, and your `video_player` renders it:

```dart
final video = bundle.intro.video;
if (video != null) {
  final controller = VideoPlayerController.file(File(video.path));
  await controller.initialize();
  await controller.setVolume(video.isMuted ? 0 : 1);
  await controller.seekTo(const Duration(milliseconds: 2500));
  bundle.intro.play(fromMs: 2500);
  await controller.play();
}
```

The MP4 is extracted to a cache file when the bundle loads, so any player can stream it. Its time runs
1:1 with the preset's — seek the player to the same `fromMs` you pass to `play`. When the preset also
carries audio, that track replaces the video's own sound: `isMuted` is then `true`, and the player must
stay muted while `play()` plays the audio with the haptics.
