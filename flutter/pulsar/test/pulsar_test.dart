import 'package:flutter_test/flutter_test.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:pulsar/pulsar.dart';

class MockPulsarPlatform
    with MockPlatformInterfaceMixin
    implements PulsarPlatform {
  String? lastPlayedPreset;
  int nextComposerId = 1;
  final List<int> parsedComposerIds = [];

  @override
  Future<void> play(String name) async {
    lastPlayedPreset = name;
  }

  @override
  Future<void> clearCache() async {}

  @override
  Future<void> enableCache(bool state) async {}

  @override
  Future<bool> isCacheEnabled() async => true;

  @override
  Future<void> enableHaptics(bool state) async {}

  @override
  Future<void> enableImpulseCompositionMode(bool state) async {}

  @override
  Future<void> enableSound(bool state) async {}

  @override
  Future<bool> isHapticsEnabled() async => true;

  @override
  Future<bool> canPlayHaptics() async => true;

  @override
  Future<void> forceHapticsSupportLevel(HapticSupport level) async {}

  @override
  Future<HapticSupport> hapticSupport() async => HapticSupport.standardSupport;

  @override
  Future<int> patternParsePattern(PatternData data, {int? composerId}) async {
    final resolvedComposerId = composerId ?? nextComposerId++;
    parsedComposerIds.add(resolvedComposerId);
    return resolvedComposerId;
  }

  @override
  Future<int> patternPlayPattern(PatternData data, {int? composerId}) async {
    final resolvedComposerId = composerId ?? nextComposerId++;
    parsedComposerIds.add(resolvedComposerId);
    return resolvedComposerId;
  }

  @override
  Future<void> patternPlay(int composerId) async {}

  @override
  Future<void> patternPlayAudioOnly(int composerId) async {}

  @override
  Future<void> patternRelease(int composerId) async {}

  @override
  Future<void> patternStop(int composerId) async {}

  @override
  Future<void> preloadPreset(String presetName) async {}

  @override
  Future<void> preloadPresets(List<String> presetNames) async {}

  @override
  Future<bool> realtimeIsActive({RealtimeComposerStrategy? strategy}) async =>
      false;

  @override
  Future<void> realtimePlayDiscrete(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) async {}

  @override
  Future<void> realtimeSet(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) async {}

  @override
  Future<void> realtimeStop({RealtimeComposerStrategy? strategy}) async {}

  @override
  Future<void> setRealtimeComposerStrategy(
    RealtimeComposerStrategy strategy,
  ) async {}

  @override
  Future<void> shutDownEngine() async {}

  @override
  Future<void> stopHaptics() async {}
}

void main() {
  final initialPlatform = PulsarPlatform.instance;

  test('$MethodChannelPulsar is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelPulsar>());
  });

  test('Pulsar presets delegate to the platform interface', () async {
    final pulsar = Pulsar();
    final fakePlatform = MockPulsarPlatform();
    PulsarPlatform.instance = fakePlatform;

    await pulsar.presets.balloonPop();

    expect(fakePlatform.lastPlayedPreset, 'balloonPop');

    PulsarPlatform.instance = initialPlatform;
  });

  test('getPatternComposer returns a fresh composer instance', () async {
    final pulsar = Pulsar();
    final fakePlatform = MockPulsarPlatform();
    PulsarPlatform.instance = fakePlatform;

    final pattern = PatternData(
      continuousPattern: const ContinuousPattern(amplitude: [], frequency: []),
      discretePattern: const [],
    );

    final firstComposer = pulsar.getPatternComposer();
    final secondComposer = pulsar.getPatternComposer();

    expect(identical(firstComposer, secondComposer), isFalse);

    await firstComposer.parsePattern(pattern);
    await secondComposer.parsePattern(pattern);

    expect(fakePlatform.parsedComposerIds, [1, 2]);

    PulsarPlatform.instance = initialPlatform;
  });
}
