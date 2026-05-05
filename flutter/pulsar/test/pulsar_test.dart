import 'package:flutter_test/flutter_test.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:pulsar/pulsar.dart';

class MockPulsarPlatform
    with MockPlatformInterfaceMixin
    implements PulsarPlatform {
  String? lastPlayedPreset;

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
  Future<void> patternParsePattern(PatternData data) async {}

  @override
  Future<void> patternPlayPattern(PatternData data) async {}

  @override
  Future<void> patternPlay() async {}

  @override
  Future<void> patternPlayAudioOnly() async {}

  @override
  Future<void> patternStop() async {}

  @override
  Future<void> preloadPreset(String presetName) async {}

  @override
  Future<void> preloadPresets(List<String> presetNames) async {}

  @override
  Future<bool> realtimeIsActive() async => false;

  @override
  Future<void> realtimePlayDiscrete(double amplitude, double frequency) async {}

  @override
  Future<void> realtimeSet(double amplitude, double frequency) async {}

  @override
  Future<void> realtimeStop() async {}

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
}
