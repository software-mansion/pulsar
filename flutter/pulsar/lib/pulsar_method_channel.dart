import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'pulsar_platform_interface.dart';
import 'pulsar_types.dart';

class MethodChannelPulsar extends PulsarPlatform {
  @visibleForTesting
  final methodChannel = const MethodChannel('pulsar');

  String _normalizePresetName(String name) {
    if (name.isEmpty) {
      return name;
    }
    return '${name[0].toUpperCase()}${name.substring(1)}';
  }

  // ── Pulsar ──────────────────────────────────────────────────────────────────

  @override
  Future<void> play(String name) => methodChannel.invokeMethod('Pulsar_play', {
    'name': _normalizePresetName(name),
  });

  @override
  Future<void> enableHaptics(bool state) =>
      methodChannel.invokeMethod('Pulsar_enableHaptics', {'state': state});

  @override
  Future<void> enableSound(bool state) =>
      methodChannel.invokeMethod('Pulsar_enableSound', {'state': state});

  @override
  Future<void> enableCache(bool state) =>
      methodChannel.invokeMethod('Pulsar_enableCache', {'state': state});

  @override
  Future<bool> isCacheEnabled() async {
    final result = await methodChannel.invokeMethod<bool>(
      'Pulsar_isCacheEnabled',
    );
    return result ?? true;
  }

  @override
  Future<void> clearCache() => methodChannel.invokeMethod('Pulsar_clearCache');

  @override
  Future<void> preloadPreset(String presetName) => methodChannel.invokeMethod(
    'Pulsar_preloadPreset',
    {'presetName': _normalizePresetName(presetName)},
  );

  @override
  Future<void> preloadPresets(List<String> presetNames) =>
      methodChannel.invokeMethod('Pulsar_preloadPresets', {
        'presetNames': presetNames.map(_normalizePresetName).toList(),
      });

  @override
  Future<void> stopHaptics() =>
      methodChannel.invokeMethod('Pulsar_stopHaptics');

  @override
  Future<void> shutDownEngine() =>
      methodChannel.invokeMethod('Pulsar_shutDownEngine');

  @override
  Future<bool> isHapticsEnabled() async {
    final result = await methodChannel.invokeMethod<bool>(
      'Pulsar_isHapticsEnabled',
    );
    return result ?? true;
  }

  @override
  Future<bool> canPlayHaptics() async {
    final result = await methodChannel.invokeMethod<bool>(
      'Pulsar_canPlayHaptics',
    );
    return result ?? false;
  }

  @override
  Future<HapticSupport> hapticSupport() async {
    final raw = await methodChannel.invokeMethod<int>('Pulsar_hapticSupport');
    return HapticSupport.values[raw ?? 0];
  }

  @override
  Future<void> forceHapticsSupportLevel(HapticSupport level) => methodChannel
      .invokeMethod('Pulsar_forceHapticsSupportLevel', {'level': level.index});

  @override
  Future<void> enableImpulseCompositionMode(bool state) => methodChannel
      .invokeMethod('Pulsar_enableImpulseCompositionMode', {'state': state});

  @override
  Future<void> setRealtimeComposerStrategy(RealtimeComposerStrategy strategy) =>
      methodChannel.invokeMethod('Pulsar_setRealtimeComposerStrategy', {
        'strategy': strategy.index,
      });

  // ── RealtimeComposer ────────────────────────────────────────────────────────

  @override
  Future<void> realtimeSet(double amplitude, double frequency) =>
      methodChannel.invokeMethod('RealtimeComposer_set', {
        'amplitude': amplitude,
        'frequency': frequency,
      });

  @override
  Future<void> realtimeStop() =>
      methodChannel.invokeMethod('RealtimeComposer_stop');

  @override
  Future<bool> realtimeIsActive() async {
    final result = await methodChannel.invokeMethod<bool>(
      'RealtimeComposer_isActive',
    );
    return result ?? false;
  }

  @override
  Future<void> realtimePlayDiscrete(double amplitude, double frequency) =>
      methodChannel.invokeMethod('RealtimeComposer_playDiscrete', {
        'amplitude': amplitude,
        'frequency': frequency,
      });

  // ── PatternComposer ─────────────────────────────────────────────────────────

  @override
  Future<void> patternParsePattern(PatternData data) => methodChannel
      .invokeMethod('PatternComposer_parsePattern', {'data': data.toMap()});

  @override
  Future<void> patternPlayPattern(PatternData data) => methodChannel
      .invokeMethod('PatternComposer_playPattern', {'data': data.toMap()});

  @override
  Future<void> patternPlay() =>
      methodChannel.invokeMethod('PatternComposer_play');

  @override
  Future<void> patternPlayAudioOnly() =>
      methodChannel.invokeMethod('PatternComposer_playAudioOnly');

  @override
  Future<void> patternStop() =>
      methodChannel.invokeMethod('PatternComposer_stop');
}
