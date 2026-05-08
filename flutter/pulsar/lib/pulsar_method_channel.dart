import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'pulsar_platform_interface.dart';
import 'pulsar_types.dart';

/// The default [PulsarPlatform] implementation using a [MethodChannel].
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
  Future<bool> presetExists(String presetName) async {
    final result = await methodChannel.invokeMethod<bool>(
      'Pulsar_presetExists',
      {'name': _normalizePresetName(presetName)},
    );
    return result ?? false;
  }

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
  Future<void> realtimeSet(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) => methodChannel.invokeMethod('RealtimeComposer_set', {
    'amplitude': amplitude,
    'frequency': frequency,
    if (strategy != null) 'strategy': strategy.index,
  });

  @override
  Future<void> realtimeStop({RealtimeComposerStrategy? strategy}) =>
      methodChannel.invokeMethod('RealtimeComposer_stop', {
        if (strategy != null) 'strategy': strategy.index,
      });

  @override
  Future<bool> realtimeIsActive({RealtimeComposerStrategy? strategy}) async {
    final result = await methodChannel.invokeMethod<bool>(
      'RealtimeComposer_isActive',
      {if (strategy != null) 'strategy': strategy.index},
    );
    return result ?? false;
  }

  @override
  Future<void> realtimePlayDiscrete(
    double amplitude,
    double frequency, {
    RealtimeComposerStrategy? strategy,
  }) => methodChannel.invokeMethod('RealtimeComposer_playDiscrete', {
    'amplitude': amplitude,
    'frequency': frequency,
    if (strategy != null) 'strategy': strategy.index,
  });

  // ── PatternComposer ─────────────────────────────────────────────────────────

  @override
  Future<int> patternParsePattern(PatternData data, {int? composerId}) async {
    final result = await methodChannel.invokeMethod<int>(
      'PatternComposer_parsePattern',
      {'data': data.toMap(), if (composerId != null) 'composerId': composerId},
    );
    return result ?? composerId ?? 0;
  }

  @override
  Future<int> patternPlayPattern(PatternData data, {int? composerId}) async {
    final result = await methodChannel.invokeMethod<int>(
      'PatternComposer_playPattern',
      {'data': data.toMap(), if (composerId != null) 'composerId': composerId},
    );
    return result ?? composerId ?? 0;
  }

  @override
  Future<void> patternPlay(int composerId) => methodChannel.invokeMethod(
    'PatternComposer_play',
    {'composerId': composerId},
  );

  @override
  Future<void> patternPlayAudioOnly(int composerId) =>
      methodChannel.invokeMethod('PatternComposer_playAudioOnly', {
        'composerId': composerId,
      });

  @override
  Future<void> patternStop(int composerId) => methodChannel.invokeMethod(
    'PatternComposer_stop',
    {'composerId': composerId},
  );

  @override
  Future<void> patternRelease(int composerId) => methodChannel.invokeMethod(
    'PatternComposer_release',
    {'composerId': composerId},
  );
}
