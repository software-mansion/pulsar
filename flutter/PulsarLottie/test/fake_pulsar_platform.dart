import 'package:pulsar_haptics/pulsar.dart';

class RecordingPulsarPlatform extends PulsarPlatform {
  static RecordingPulsarPlatform install() {
    final platform = RecordingPulsarPlatform();
    PulsarPlatform.instance = platform;
    return platform;
  }

  final List<String> calls = <String>[];
  final List<List<double>> realtimeSets = <List<double>>[];
  final List<List<double>> discretes = <List<double>>[];
  final List<PatternData> parsedPatterns = <PatternData>[];
  final List<String> playedPresets = <String>[];
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
