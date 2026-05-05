import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'pulsar_method_channel.dart';
import 'pulsar_types.dart';

abstract class PulsarPlatform extends PlatformInterface {
  PulsarPlatform() : super(token: _token);

  static final Object _token = Object();

  static PulsarPlatform _instance = MethodChannelPulsar();

  static PulsarPlatform get instance => _instance;

  static set instance(PulsarPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  // ── Pulsar ──────────────────────────────────────────────────────────────────

  Future<void> play(String name) =>
      throw UnimplementedError('play() not implemented');

  Future<void> enableHaptics(bool state) =>
      throw UnimplementedError('enableHaptics() not implemented');

  Future<void> enableSound(bool state) =>
      throw UnimplementedError('enableSound() not implemented');

  Future<void> enableCache(bool state) =>
      throw UnimplementedError('enableCache() not implemented');

  Future<bool> isCacheEnabled() =>
      throw UnimplementedError('isCacheEnabled() not implemented');

  Future<void> clearCache() =>
      throw UnimplementedError('clearCache() not implemented');

  Future<void> preloadPreset(String presetName) =>
      throw UnimplementedError('preloadPreset() not implemented');

  Future<void> preloadPresets(List<String> presetNames) =>
      throw UnimplementedError('preloadPresets() not implemented');

  Future<void> stopHaptics() =>
      throw UnimplementedError('stopHaptics() not implemented');

  Future<void> shutDownEngine() =>
      throw UnimplementedError('shutDownEngine() not implemented');

  Future<bool> isHapticsEnabled() =>
      throw UnimplementedError('isHapticsEnabled() not implemented');

  Future<bool> canPlayHaptics() =>
      throw UnimplementedError('canPlayHaptics() not implemented');

  Future<HapticSupport> hapticSupport() =>
      throw UnimplementedError('hapticSupport() not implemented');

  Future<void> forceHapticsSupportLevel(HapticSupport level) =>
      throw UnimplementedError('forceHapticsSupportLevel() not implemented');

  Future<void> enableImpulseCompositionMode(bool state) =>
      throw UnimplementedError(
        'enableImpulseCompositionMode() not implemented',
      );

  Future<void> setRealtimeComposerStrategy(RealtimeComposerStrategy strategy) =>
      throw UnimplementedError('setRealtimeComposerStrategy() not implemented');

  // ── RealtimeComposer ────────────────────────────────────────────────────────

  Future<void> realtimeSet(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) => throw UnimplementedError('realtimeSet() not implemented');

  Future<void> realtimeStop({RealtimeComposerStrategy? strategy}) =>
      throw UnimplementedError('realtimeStop() not implemented');

  Future<bool> realtimeIsActive({RealtimeComposerStrategy? strategy}) =>
      throw UnimplementedError('realtimeIsActive() not implemented');

  Future<void> realtimePlayDiscrete(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) => throw UnimplementedError('realtimePlayDiscrete() not implemented');

  // ── PatternComposer ─────────────────────────────────────────────────────────

  Future<int> patternParsePattern(PatternData data, {int? composerId}) =>
      throw UnimplementedError('patternParsePattern() not implemented');

  Future<int> patternPlayPattern(PatternData data, {int? composerId}) =>
      throw UnimplementedError('patternPlayPattern() not implemented');

  Future<void> patternPlay(int composerId) =>
      throw UnimplementedError('patternPlay() not implemented');

  Future<void> patternPlayAudioOnly(int composerId) =>
      throw UnimplementedError('patternPlayAudioOnly() not implemented');

  Future<void> patternStop(int composerId) =>
      throw UnimplementedError('patternStop() not implemented');

  Future<void> patternRelease(int composerId) =>
      throw UnimplementedError('patternRelease() not implemented');
}
