/// Platform-specific haptic configuration for [AdaptiveHaptics].
///
/// Use [AdaptivePresetCallback] for a custom callback or
/// [AdaptivePresetPattern] for a [PatternData]-based pattern.
sealed class AdaptivePresetConfig {
  const AdaptivePresetConfig();
}

/// An [AdaptivePresetConfig] that invokes a callback when played.
final class AdaptivePresetCallback extends AdaptivePresetConfig {
  /// Creates an [AdaptivePresetCallback] with the given [play] callback.
  const AdaptivePresetCallback(this.play);

  /// Callback invoked when [AdaptiveHaptics.play] is called.
  final Future<void> Function() play;
}

/// An [AdaptivePresetConfig] that plays a [PatternData] pattern.
final class AdaptivePresetPattern extends AdaptivePresetConfig {
  /// Creates an [AdaptivePresetPattern] with the given [pattern].
  const AdaptivePresetPattern(this.pattern);

  /// The [PatternData] played when [AdaptiveHaptics.play] is called.
  final PatternData pattern;
}

/// Platform-adaptive haptic preset supplying separate [ios] and [android] configs.
///
/// Pass to [Pulsar.createAdaptiveHaptics]; the correct config is selected at runtime.
class AdaptivePreset {
  /// Creates an [AdaptivePreset] with platform-specific [ios] and [android] configs.
  const AdaptivePreset({required this.ios, required this.android});

  /// Config used on iOS devices.
  final AdaptivePresetConfig ios;

  /// Config used on Android devices.
  final AdaptivePresetConfig android;
}

/// Maps to CompatibilityMode on Android and Pulsar's support model on iOS.
/// Ordinal values match the native CompatibilityMode enum order.
enum HapticSupport {
  /// Device does not support haptics.
  noSupport,

  /// Device supports basic vibration only (Android: no amplitude control).
  limitedSupport,

  /// Device supports amplitude-controlled vibration (Android: VibrationEffect).
  standardSupport,

  /// Device supports full haptic composition (iOS: CoreHaptics, Android: AHAP).
  advancedSupport,
}

/// Android-only haptic composition strategy.
/// Ordinal values match the Android RealtimeComposerStrategy enum order.
enum RealtimeComposerStrategy {
  /// Uses VibrationEffect amplitude-envelope composition.
  envelope,

  /// Uses a repeating tick primitive for continuous feedback.
  primitiveTick,

  /// Uses complex primitives for richer continuous feedback.
  primitiveComplex,

  /// Combines an amplitude envelope with discrete primitives.
  envelopeWithDiscretePrimitives,
}

/// A point in a continuous haptic curve.
/// [time] is in milliseconds. [value] is 0.0–1.0.
class ValuePoint {
  /// Creates a [ValuePoint] with the given [time] (ms) and [value] (0.0–1.0).
  const ValuePoint({required this.time, required this.value});

  /// Time offset in milliseconds from the start of the pattern.
  final double time;

  /// Amplitude or frequency value in the range 0.0–1.0.
  final double value;

  Map<String, dynamic> toMap() => {'time': time, 'value': value};
}

/// A discrete haptic event.
/// [time] is in milliseconds. [amplitude] and [frequency] are 0.0–1.0.
class DiscretePoint {
  /// Creates a [DiscretePoint] at [time] ms with [amplitude] and [frequency].
  const DiscretePoint({
    required this.time,
    required this.amplitude,
    required this.frequency,
  });

  /// Time offset in milliseconds from the start of the pattern.
  final double time;

  /// Event intensity in the range 0.0–1.0.
  final double amplitude;

  /// Event sharpness in the range 0.0–1.0.
  final double frequency;

  Map<String, dynamic> toMap() => {
    'time': time,
    'amplitude': amplitude,
    'frequency': frequency,
  };
}

/// A continuous haptic pattern defined by amplitude and frequency curves.
class ContinuousPattern {
  /// Creates a [ContinuousPattern] with the given [amplitude] and [frequency] curves.
  const ContinuousPattern({required this.amplitude, required this.frequency});

  /// Amplitude curve: list of [ValuePoint] controlling intensity over time.
  final List<ValuePoint> amplitude;

  /// Frequency curve: list of [ValuePoint] controlling sharpness over time.
  final List<ValuePoint> frequency;

  Map<String, dynamic> toMap() => {
    'amplitude': amplitude.map((p) => p.toMap()).toList(),
    'frequency': frequency.map((p) => p.toMap()).toList(),
  };
}

/// Full haptic pattern combining a continuous curve and discrete events.
class PatternData {
  /// Creates a [PatternData] from a [continuousPattern] and a list of [discretePattern] events.
  const PatternData({
    required this.continuousPattern,
    required this.discretePattern,
  });

  /// Raw array constructor matching the native iOS/Android shorthand:
  ///
  /// ```dart
  /// PatternData.fromArrays(
  ///   amplitude: [[0, 0.5], [500, 1.0]],
  ///   frequency: [[0, 0.3]],
  ///   discrete: [[100, 1.0, 0.8]],
  /// );
  /// ```
  ///
  /// Each `amplitude`/`frequency` entry is `[time, value]`; each `discrete`
  /// entry is `[time, amplitude, frequency]`.
  factory PatternData.fromArrays({
    required List<List<double>> amplitude,
    required List<List<double>> frequency,
    required List<List<double>> discrete,
  }) {
    return PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: amplitude
            .map((p) => ValuePoint(time: p[0], value: p[1]))
            .toList(),
        frequency: frequency
            .map((p) => ValuePoint(time: p[0], value: p[1]))
            .toList(),
      ),
      discretePattern: discrete
          .map(
            (p) =>
                DiscretePoint(time: p[0], amplitude: p[1], frequency: p[2]),
          )
          .toList(),
    );
  }

  /// The continuous (envelope) portion of the pattern.
  final ContinuousPattern continuousPattern;

  /// The list of discrete haptic events layered on top of the continuous curve.
  final List<DiscretePoint> discretePattern;

  Map<String, dynamic> toMap() => {
    'continuousPattern': continuousPattern.toMap(),
    'discretePattern': discretePattern.map((p) => p.toMap()).toList(),
  };
}
