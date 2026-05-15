part of 'package:pulsar_haptics/pulsar.dart';

/// Entry point for the Pulsar haptics library.
///
/// Create one instance and reuse it throughout your app:
/// ```dart
/// final pulsar = Pulsar();
/// pulsar.getPresets().systemImpactMedium();
/// pulsar.getRealtimeComposer().set(0.8, 0.5);
/// ```
class Pulsar {
  /// Creates a new [Pulsar] instance. Reuse a single instance throughout your app.
  Pulsar();

  PulsarPresets? _presets;
  PulsarSyncPresets? _syncPresets;
  PulsarRealtimeComposer? _realtimeComposer;
  RealtimeComposerStrategy? _realtimeComposerStrategy;

  /// Access to the 200+ built-in haptic presets.
  ///
  /// Lazily created on first access; subsequent calls return the same instance,
  /// matching native iOS/Android semantics.
  PulsarPresets get presets => getPresets();

  /// Access to the fire-and-forget built-in haptic presets.
  ///
  /// Lazily created on first access; subsequent calls return the same instance.
  PulsarSyncPresets get syncPresets => getSyncPresets();

  /// Native-style accessor for built-in haptic presets.
  PulsarPresets getPresets() => _presets ??= PulsarPresets._();

  /// Native-style accessor for fire-and-forget built-in haptic presets.
  PulsarSyncPresets getSyncPresets() =>
      _syncPresets ??= PulsarSyncPresets._(presets);

  /// Native-style accessor for the realtime composer.
  ///
  /// Mirrors Android semantics: a single composer instance is held; passing a
  /// new [strategy] rebuilds it and updates the active strategy. iOS ignores
  /// [strategy] (handled in the native bridge).
  PulsarRealtimeComposer getRealtimeComposer({
    RealtimeComposerStrategy? strategy,
  }) {
    if (_realtimeComposer == null ||
        (strategy != null && strategy != _realtimeComposerStrategy)) {
      _realtimeComposerStrategy = strategy ?? _realtimeComposerStrategy;
      _realtimeComposer = PulsarRealtimeComposer._(
        strategy: _realtimeComposerStrategy,
      );
    }
    return _realtimeComposer!;
  }

  /// Native-style accessor for a fresh pattern composer.
  ///
  /// Returns a new [PulsarPatternComposer] instance every call, matching native
  /// iOS/Android semantics.
  PulsarPatternComposer getPatternComposer() => PulsarPatternComposer._();

  /// Enable or disable haptic output globally. Defaults to `true`.
  Future<void> enableHaptics(bool state) =>
      PulsarPlatform.instance.enableHaptics(state);

  /// Enable or disable audio simulation fallback. Defaults to `true`.
  Future<void> enableSound(bool state) =>
      PulsarPlatform.instance.enableSound(state);

  /// Enable or disable preset caching. When enabled, parsed patterns are kept
  /// in memory to reduce latency on repeated playback.
  Future<void> enableCache(bool state) =>
      PulsarPlatform.instance.enableCache(state);

  /// Returns `true` if preset caching is currently enabled.
  Future<bool> isCacheEnabled() => PulsarPlatform.instance.isCacheEnabled();

  /// Evict all cached preset data from memory.
  Future<void> clearCache() => PulsarPlatform.instance.clearCache();

  /// Pre-parse [presetName] so it is ready for low-latency playback.
  Future<void> preloadPreset(String presetName) =>
      PulsarPlatform.instance.preloadPreset(presetName);

  /// Pre-parse multiple presets by name for low-latency playback.
  Future<void> preloadPresets(List<String> presetNames) =>
      PulsarPlatform.instance.preloadPresets(presetNames);

  /// Stop any currently playing haptic immediately.
  Future<void> stopHaptics() => PulsarPlatform.instance.stopHaptics();

  /// iOS only — shuts down the CoreHaptics engine. No-op on Android.
  Future<void> shutDownEngine() => PulsarPlatform.instance.shutDownEngine();

  /// Returns `true` if haptics are currently enabled via [enableHaptics].
  Future<bool> isHapticsEnabled() => PulsarPlatform.instance.isHapticsEnabled();

  /// Returns `true` if the device can play haptics right now (hardware capable
  /// and not muted by the user).
  Future<bool> canPlayHaptics() => PulsarPlatform.instance.canPlayHaptics();

  /// Returns the device's haptic support level.
  Future<HapticSupport> hapticSupport() =>
      PulsarPlatform.instance.hapticSupport();

  /// Returns whether the current device supports haptics at all.
  Future<bool> isHapticsSupported() async =>
      (await hapticSupport()) != HapticSupport.noSupport;

  /// Override haptic support level (useful for testing). Android only.
  Future<void> forceHapticsSupportLevel(HapticSupport level) =>
      PulsarPlatform.instance.forceHapticsSupportLevel(level);

  /// Android only — enables impulse composition mode.
  Future<void> enableImpulseCompositionMode(bool state) =>
      PulsarPlatform.instance.enableImpulseCompositionMode(state);

  /// Android only — sets the realtime composer strategy.
  Future<void> setRealtimeComposerStrategy(RealtimeComposerStrategy strategy) =>
      PulsarPlatform.instance.setRealtimeComposerStrategy(strategy);

  /// Creates an [AdaptiveHaptics] instance for the given [preset].
  ///
  /// Selects [AdaptivePreset.ios] or [AdaptivePreset.android] at runtime and,
  /// for pattern-based configs, pre-parses the pattern so [AdaptiveHaptics.play]
  /// is ready immediately.
  ///
  /// Call [AdaptiveHaptics.dispose] when the instance is no longer needed.
  Future<AdaptiveHaptics> createAdaptiveHaptics(AdaptivePreset preset) async {
    final config =
        defaultTargetPlatform == TargetPlatform.iOS
            ? preset.ios
            : preset.android;
    final composer = getPatternComposer();
    if (config is AdaptivePresetPattern) {
      await composer.parsePattern(config.pattern);
    }
    return AdaptiveHaptics._(composer: composer, config: config);
  }
}
