/// Maps to CompatibilityMode on Android and Pulsar's support model on iOS.
/// Ordinal values match the native CompatibilityMode enum order.
enum HapticSupport {
  noSupport,
  limitedSupport,
  standardSupport,
  advancedSupport,
}

/// Android-only haptic composition strategy.
/// Ordinal values match the Android RealtimeComposerStrategy enum order.
enum RealtimeComposerStrategy {
  envelope,
  primitiveTick,
  primitiveComplex,
  envelopeWithDiscretePrimitives,
}

/// A point in a continuous haptic curve.
/// [time] is in milliseconds. [value] is 0.0–1.0.
class ValuePoint {
  const ValuePoint({required this.time, required this.value});

  final double time;
  final double value;

  Map<String, dynamic> toMap() => {'time': time, 'value': value};
}

/// A discrete haptic event.
/// [time] is in milliseconds. [amplitude] and [frequency] are 0.0–1.0.
class DiscretePoint {
  const DiscretePoint({
    required this.time,
    required this.amplitude,
    required this.frequency,
  });

  final double time;
  final double amplitude;
  final double frequency;

  Map<String, dynamic> toMap() => {
    'time': time,
    'amplitude': amplitude,
    'frequency': frequency,
  };
}

/// A continuous haptic pattern defined by amplitude and frequency curves.
class ContinuousPattern {
  const ContinuousPattern({required this.amplitude, required this.frequency});

  final List<ValuePoint> amplitude;
  final List<ValuePoint> frequency;

  Map<String, dynamic> toMap() => {
    'amplitude': amplitude.map((p) => p.toMap()).toList(),
    'frequency': frequency.map((p) => p.toMap()).toList(),
  };
}

/// Full haptic pattern combining a continuous curve and discrete events.
class PatternData {
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

  final ContinuousPattern continuousPattern;
  final List<DiscretePoint> discretePattern;

  Map<String, dynamic> toMap() => {
    'continuousPattern': continuousPattern.toMap(),
    'discretePattern': discretePattern.map((p) => p.toMap()).toList(),
  };
}
