import 'package:pulsar_haptics/pulsar.dart';

/// A [PulsarPlatform] that records every call the Lottie SDK makes into the
/// engine, so tests can assert what a transport action actually emitted rather
/// than only that it did not throw.
class FakePulsarPlatform extends PulsarPlatform {
  /// Installs a fresh recorder as the platform every test reads through.
  static FakePulsarPlatform install() {
    final platform = FakePulsarPlatform();
    PulsarPlatform.instance = platform;
    return platform;
  }

  /// Every recorded call, in order, by method name.
  final List<String> calls = <String>[];

  /// `[amplitude, frequency]` of each `RealtimeComposer.set`.
  final List<List<double>> realtimeSets = <List<double>>[];

  /// `[amplitude, frequency]` of each `RealtimeComposer.playDiscrete`.
  final List<List<double>> discretes = <List<double>>[];

  /// Patterns handed to `PatternComposer.parsePattern`.
  final List<PatternData> parsedPatterns = <PatternData>[];

  /// Preset ids played through their own native handle (the audio path).
  final List<String> playedPresets = <String>[];

  /// Preset ids stopped through their own native handle.
  final List<String> stoppedPresets = <String>[];

  int _nextComposerId = 1;

  @override
  Future<void> realtimeSet(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) async {
    calls.add('realtimeSet');
    realtimeSets.add([amplitude, frequency]);
  }

  @override
  Future<void> realtimePlayDiscrete(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) async {
    calls.add('realtimePlayDiscrete');
    discretes.add([amplitude, frequency]);
  }

  @override
  Future<void> realtimeStop({RealtimeComposerStrategy? strategy}) async {
    calls.add('realtimeStop');
  }

  @override
  Future<int> patternParsePattern(PatternData data, {int? composerId}) async {
    calls.add('patternParsePattern');
    parsedPatterns.add(data);
    return composerId ?? _nextComposerId++;
  }

  @override
  Future<void> patternPlay(int composerId) async => calls.add('patternPlay');

  @override
  Future<void> patternStop(int composerId) async => calls.add('patternStop');

  @override
  Future<void> patternRelease(int composerId) async =>
      calls.add('patternRelease');

  @override
  Future<void> playBundlePreset(String token, String presetId) async {
    calls.add('playBundlePreset');
    playedPresets.add(presetId);
  }

  @override
  Future<void> stopBundlePreset(String token, String presetId) async {
    calls.add('stopBundlePreset');
    stoppedPresets.add(presetId);
  }
}
