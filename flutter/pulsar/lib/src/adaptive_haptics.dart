part of 'package:pulsar_haptics/pulsar.dart';

/// Plays platform-adaptive haptic feedback.
///
/// Created via [Pulsar.createAdaptiveHaptics]. Example:
/// ```dart
/// final pulsar = Pulsar();
/// final adaptive = await pulsar.createAdaptiveHaptics(AdaptivePreset(
///   ios: AdaptivePresetCallback(() => pulsar.presets.systemImpactMedium()),
///   android: AdaptivePresetPattern(myPattern),
/// ));
///
/// await adaptive.play();
/// // …
/// await adaptive.dispose();
/// ```
class AdaptiveHaptics {
  AdaptiveHaptics._({
    required PulsarPatternComposer composer,
    required AdaptivePresetConfig config,
  }) : _composer = composer,
       _config = config;

  final PulsarPatternComposer _composer;
  final AdaptivePresetConfig _config;

  /// Trigger the platform-appropriate haptic feedback.
  Future<void> play() async {
    switch (_config) {
      case AdaptivePresetCallback():
        await _config.play();
      case AdaptivePresetPattern():
        await _composer.play();
    }
  }

  /// Stop an in-progress pattern-based haptic. No-op for callback configs.
  Future<void> stop() async {
    if (_config is AdaptivePresetPattern) {
      await _composer.stop();
    }
  }

  /// Release the underlying native resources.
  Future<void> dispose() async => _composer.dispose();
}
