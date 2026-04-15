export 'pulsar_types.dart';
export 'pulsar_platform_interface.dart';
export 'pulsar_method_channel.dart';

import 'pulsar_platform_interface.dart';
import 'pulsar_types.dart';

/// Entry point for the Pulsar haptics library.
///
/// Create one instance and reuse it throughout your app:
/// ```dart
/// final pulsar = Pulsar();
/// pulsar.presets.systemImpactMedium();
/// pulsar.realtimeComposer.set(0.8, 0.5);
/// ```
class Pulsar {
  Pulsar()
      : presets = PulsarPresets._(),
        realtimeComposer = PulsarRealtimeComposer._(),
        patternComposer = PulsarPatternComposer._();

  /// Access to the 200+ built-in haptic presets.
  final PulsarPresets presets;

  /// Real-time continuous haptic feedback (e.g. for gestures/sliders).
  final PulsarRealtimeComposer realtimeComposer;

  /// Pattern-based haptic feedback for pre-defined sequences.
  final PulsarPatternComposer patternComposer;

  // ── Configuration ──────────────────────────────────────────────────────────

  Future<void> enableHaptics(bool state) =>
      PulsarPlatform.instance.enableHaptics(state);

  Future<void> enableSound(bool state) =>
      PulsarPlatform.instance.enableSound(state);

  Future<void> enableCache(bool state) =>
      PulsarPlatform.instance.enableCache(state);

  Future<void> clearCache() =>
      PulsarPlatform.instance.clearCache();

  Future<void> preloadPresets(List<String> presetNames) =>
      PulsarPlatform.instance.preloadPresets(presetNames);

  Future<void> stopHaptics() =>
      PulsarPlatform.instance.stopHaptics();

  /// iOS only — shuts down the CoreHaptics engine. No-op on Android.
  Future<void> shutDownEngine() =>
      PulsarPlatform.instance.shutDownEngine();

  /// Returns the device's haptic support level.
  Future<HapticSupport> hapticSupport() =>
      PulsarPlatform.instance.hapticSupport();

  /// Override haptic support level (useful for testing). Android only.
  Future<void> forceHapticsSupportLevel(HapticSupport level) =>
      PulsarPlatform.instance.forceHapticsSupportLevel(level);

  /// Android only — enables impulse composition mode.
  Future<void> enableImpulseCompositionMode(bool state) =>
      PulsarPlatform.instance.enableImpulseCompositionMode(state);

  /// Android only — sets the realtime composer strategy.
  Future<void> setRealtimeComposerStrategy(RealtimeComposerStrategy strategy) =>
      PulsarPlatform.instance.setRealtimeComposerStrategy(strategy);
}

// ── PulsarPresets ─────────────────────────────────────────────────────────────

/// Provides access to Pulsar's 200+ built-in haptic presets.
///
/// Call any named method to play that preset immediately, or use [play] with a
/// preset name string.
class PulsarPresets {
  PulsarPresets._();

  Future<void> play(String name) => PulsarPlatform.instance.play(name);

  // System — Impacts
  Future<void> systemImpactLight() => play('systemImpactLight');
  Future<void> systemImpactMedium() => play('systemImpactMedium');
  Future<void> systemImpactHeavy() => play('systemImpactHeavy');
  Future<void> systemImpactSoft() => play('systemImpactSoft');
  Future<void> systemImpactRigid() => play('systemImpactRigid');

  // System — Notifications
  Future<void> systemNotificationSuccess() => play('systemNotificationSuccess');
  Future<void> systemNotificationWarning() => play('systemNotificationWarning');
  Future<void> systemNotificationError() => play('systemNotificationError');
  Future<void> systemSelection() => play('systemSelection');

  // System — Effects (Android)
  Future<void> systemEffectClick() => play('systemEffectClick');
  Future<void> systemEffectDoubleClick() => play('systemEffectDoubleClick');
  Future<void> systemEffectTick() => play('systemEffectTick');
  Future<void> systemEffectHeavyClick() => play('systemEffectHeavyClick');

  // Named presets (curated selection)
  Future<void> afterglow() => play('afterglow');
  Future<void> alarm() => play('alarm');
  Future<void> anvil() => play('anvil');
  Future<void> applause() => play('applause');
  Future<void> balloonPop() => play('balloonPop');
  Future<void> barrage() => play('barrage');
  Future<void> bassDrop() => play('bassDrop');
  Future<void> buzz() => play('buzz');
  Future<void> click() => play('click');
  Future<void> countdown() => play('countdown');
  Future<void> dogBark() => play('dogBark');
  Future<void> earthquake() => play('earthquake');
  Future<void> fanfare() => play('fanfare');
  Future<void> hammer() => play('hammer');
  Future<void> heartbeat() => play('heartbeat');
  Future<void> punch() => play('punch');
  Future<void> rumble() => play('rumble');
  Future<void> springBounce() => play('springBounce');
  Future<void> thunder() => play('thunder');
  Future<void> zipper() => play('zipper');
}

// ── PulsarRealtimeComposer ────────────────────────────────────────────────────

/// Controls continuous, real-time haptic feedback.
///
/// Ideal for gesture-driven feedback (e.g. sliders, drag gestures).
/// ```dart
/// // Start/update haptic as the user drags
/// await pulsar.realtimeComposer.set(amplitude: 0.8, frequency: 0.5);
/// // Stop when the gesture ends
/// await pulsar.realtimeComposer.stop();
/// ```
class PulsarRealtimeComposer {
  PulsarRealtimeComposer._();

  /// Set continuous haptic parameters. Starts automatically if not already active.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  Future<void> set(double amplitude, double frequency) =>
      PulsarPlatform.instance.realtimeSet(amplitude, frequency);

  /// Stop the continuous haptic.
  Future<void> stop() => PulsarPlatform.instance.realtimeStop();

  /// Returns true if the realtime composer is currently active.
  Future<bool> isActive() => PulsarPlatform.instance.realtimeIsActive();

  /// Fire a single discrete haptic event.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  Future<void> playDiscrete(double amplitude, double frequency) =>
      PulsarPlatform.instance.realtimePlayDiscrete(amplitude, frequency);
}

// ── PulsarPatternComposer ─────────────────────────────────────────────────────

/// Plays pre-defined haptic patterns.
///
/// ```dart
/// final pattern = PatternData(
///   continuousPattern: ContinuousPattern(
///     amplitude: [ValuePoint(time: 0, value: 0.5), ValuePoint(time: 500, value: 1.0)],
///     frequency: [ValuePoint(time: 0, value: 0.3)],
///   ),
///   discretePattern: [DiscretePoint(time: 100, amplitude: 1.0, frequency: 0.8)],
/// );
/// await pulsar.patternComposer.parsePattern(pattern);
/// await pulsar.patternComposer.play();
/// ```
class PulsarPatternComposer {
  PulsarPatternComposer._();

  /// Parse and store a pattern for playback. Call [play] afterwards.
  Future<void> parsePattern(PatternData data) =>
      PulsarPlatform.instance.patternParsePattern(data);

  /// Play the last parsed pattern.
  Future<void> play() => PulsarPlatform.instance.patternPlay();

  /// Stop pattern playback.
  Future<void> stop() => PulsarPlatform.instance.patternStop();
}
