part of 'package:pulsar_haptics/pulsar.dart';

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
/// final composer = pulsar.getPatternComposer();
/// await composer.parsePattern(pattern);
/// await composer.play();
/// ```
class PulsarPatternComposer {
  PulsarPatternComposer._();

  int? _composerId;

  Future<int> _requireComposerId() async {
    final composerId = _composerId;
    if (composerId != null) {
      return composerId;
    }
    throw StateError(
      'PatternComposer has no parsed pattern yet. Call parsePattern() or playPattern() first.',
    );
  }

  /// Parse and store a pattern for playback. Call [play] afterwards.
  Future<void> parsePattern(PatternData data) async {
    _composerId = await PulsarPlatform.instance.patternParsePattern(
      data,
      composerId: _composerId,
    );
  }

  /// Parse and play a pattern in one step.
  Future<void> playPattern(PatternData data) async {
    _composerId = await PulsarPlatform.instance.patternPlayPattern(
      data,
      composerId: _composerId,
    );
  }

  /// Play the last parsed pattern.
  Future<void> play() async =>
      PulsarPlatform.instance.patternPlay(await _requireComposerId());

  /// Play only the audio simulation for the last parsed pattern.
  Future<void> playAudioOnly() async =>
      PulsarPlatform.instance.patternPlayAudioOnly(await _requireComposerId());

  /// Stop pattern playback.
  Future<void> stop() async =>
      PulsarPlatform.instance.patternStop(await _requireComposerId());

  /// Release the native composer handle held by this instance.
  Future<void> dispose() async {
    final composerId = _composerId;
    if (composerId == null) {
      return;
    }
    _composerId = null;
    await PulsarPlatform.instance.patternRelease(composerId);
  }
}
