export 'pulsar_types.dart';
export 'pulsar_platform_interface.dart';
export 'pulsar_method_channel.dart';

import 'dart:io' show Platform;

import 'pulsar_platform_interface.dart';
import 'pulsar_types.dart';

/// Entry point for the Pulsar haptics library.
///
/// Create one instance and reuse it throughout your app:
/// ```dart
/// final pulsar = Pulsar();
/// pulsar.getPresets().systemImpactMedium();
/// pulsar.getRealtimeComposer().set(0.8, 0.5);
/// ```
class Pulsar {
  Pulsar();

  PulsarPresets? _presets;
  PulsarRealtimeComposer? _realtimeComposer;
  RealtimeComposerStrategy? _realtimeComposerStrategy;

  /// Access to the 200+ built-in haptic presets.
  ///
  /// Lazily created on first access; subsequent calls return the same instance,
  /// matching native iOS/Android semantics.
  PulsarPresets get presets => getPresets();

  /// Native-style accessor for built-in haptic presets.
  PulsarPresets getPresets() => _presets ??= PulsarPresets._();

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

  // ── Configuration ──────────────────────────────────────────────────────────

  Future<void> enableHaptics(bool state) =>
      PulsarPlatform.instance.enableHaptics(state);

  Future<void> enableSound(bool state) =>
      PulsarPlatform.instance.enableSound(state);

  Future<void> enableCache(bool state) =>
      PulsarPlatform.instance.enableCache(state);

  Future<bool> isCacheEnabled() => PulsarPlatform.instance.isCacheEnabled();

  Future<void> clearCache() => PulsarPlatform.instance.clearCache();

  Future<void> preloadPreset(String presetName) =>
      PulsarPlatform.instance.preloadPreset(presetName);

  Future<void> preloadPresets(List<String> presetNames) =>
      PulsarPlatform.instance.preloadPresets(presetNames);

  Future<void> stopHaptics() => PulsarPlatform.instance.stopHaptics();

  /// iOS only — shuts down the CoreHaptics engine. No-op on Android.
  Future<void> shutDownEngine() => PulsarPlatform.instance.shutDownEngine();

  Future<bool> isHapticsEnabled() => PulsarPlatform.instance.isHapticsEnabled();

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
    final config = Platform.isIOS ? preset.ios : preset.android;
    final composer = getPatternComposer();
    if (config is AdaptivePresetPattern) {
      await composer.parsePattern(config.pattern);
    }
    return AdaptiveHaptics._(composer: composer, config: config);
  }
}

// ── PulsarPresets ─────────────────────────────────────────────────────────────

/// Provides access to Pulsar's 200+ built-in haptic presets.
///
/// Call any named method to play that preset immediately, or use [play] with a
/// preset name string.
class PulsarPresets {
  PulsarPresets._();

  Future<void> play(String name) => PulsarPlatform.instance.play(name);

  /// Returns a lightweight handle to the preset with [name], or `null` if no
  /// preset matches. Mirrors the native `getByName` API.
  ///
  /// The handle does not hold a native reference; calling [PulsarPreset.play]
  /// re-resolves the preset by name on the native side.
  Future<PulsarPreset?> getByName(String name) async {
    final exists = await PulsarPlatform.instance.presetExists(name);
    if (!exists) {
      return null;
    }
    return PulsarPreset._(name);
  }

  /// Enable or disable preset caching. Mirrors `PresetsWrapper.enableCache`.
  Future<void> enableCache(bool state) =>
      PulsarPlatform.instance.enableCache(state);

  /// Whether preset caching is enabled. Mirrors `PresetsWrapper.isCacheEnabled`.
  Future<bool> isCacheEnabled() => PulsarPlatform.instance.isCacheEnabled();

  /// Clear any cached preset data. Mirrors `PresetsWrapper.resetCache`.
  Future<void> resetCache() => PulsarPlatform.instance.clearCache();

  /// Preload a single preset by name. Mirrors `PresetsWrapper.preloadPresetByName`.
  Future<void> preloadPresetByName(String name) =>
      PulsarPlatform.instance.preloadPreset(name);

  /// Preload many presets by name. Mirrors `PresetsWrapper.preloadPresetByNames`.
  Future<void> preloadPresetByNames(List<String> names) =>
      PulsarPlatform.instance.preloadPresets(names);

  // System
  Future<void> systemImpactLight() => play('systemImpactLight');
  Future<void> systemImpactMedium() => play('systemImpactMedium');
  Future<void> systemImpactHeavy() => play('systemImpactHeavy');
  Future<void> systemImpactSoft() => play('systemImpactSoft');
  Future<void> systemImpactRigid() => play('systemImpactRigid');
  Future<void> systemNotificationSuccess() => play('systemNotificationSuccess');
  Future<void> systemNotificationWarning() => play('systemNotificationWarning');
  Future<void> systemNotificationError() => play('systemNotificationError');
  Future<void> systemSelection() => play('systemSelection');
  Future<void> systemEffectClick() => play('systemEffectClick');
  Future<void> systemEffectDoubleClick() => play('systemEffectDoubleClick');
  Future<void> systemEffectTick() => play('systemEffectTick');
  Future<void> systemEffectHeavyClick() => play('systemEffectHeavyClick');
  Future<void> systemLongPress() => play('systemLongPress');
  Future<void> systemVirtualKey() => play('systemVirtualKey');
  Future<void> systemKeyboardTap() => play('systemKeyboardTap');
  Future<void> systemClockTick() => play('systemClockTick');
  Future<void> systemCalendarDate() => play('systemCalendarDate');
  Future<void> systemContextClick() => play('systemContextClick');
  Future<void> systemKeyboardPress() => play('systemKeyboardPress');
  Future<void> systemKeyboardRelease() => play('systemKeyboardRelease');
  Future<void> systemVirtualKeyRelease() => play('systemVirtualKeyRelease');
  Future<void> systemTextHandleMove() => play('systemTextHandleMove');
  Future<void> systemDragCrossing() => play('systemDragCrossing');
  Future<void> systemGestureStart() => play('systemGestureStart');
  Future<void> systemGestureEnd() => play('systemGestureEnd');
  Future<void> systemEdgeSqueeze() => play('systemEdgeSqueeze');
  Future<void> systemEdgeRelease() => play('systemEdgeRelease');
  Future<void> systemConfirm() => play('systemConfirm');
  Future<void> systemRelease() => play('systemRelease');
  Future<void> systemScrollTick() => play('systemScrollTick');
  Future<void> systemScrollItemFocus() => play('systemScrollItemFocus');
  Future<void> systemScrollLimit() => play('systemScrollLimit');
  Future<void> systemToggleOn() => play('systemToggleOn');
  Future<void> systemToggleOff() => play('systemToggleOff');
  Future<void> systemDragStart() => play('systemDragStart');
  Future<void> systemSegmentTick() => play('systemSegmentTick');
  Future<void> systemSegmentFrequentTick() => play('systemSegmentFrequentTick');
  Future<void> systemPrimitiveClick() => play('systemPrimitiveClick');
  Future<void> systemPrimitiveThud() => play('systemPrimitiveThud');
  Future<void> systemPrimitiveSpin() => play('systemPrimitiveSpin');
  Future<void> systemPrimitiveQuickRise() => play('systemPrimitiveQuickRise');
  Future<void> systemPrimitiveSlowRise() => play('systemPrimitiveSlowRise');
  Future<void> systemPrimitiveQuickFall() => play('systemPrimitiveQuickFall');
  Future<void> systemPrimitiveTick() => play('systemPrimitiveTick');
  Future<void> systemPrimitiveLowTick() => play('systemPrimitiveLowTick');

  // Library presets
  Future<void> afterglow() => play('afterglow');
  Future<void> aftershock() => play('aftershock');
  Future<void> alarm() => play('alarm');
  Future<void> anvil() => play('anvil');
  Future<void> applause() => play('applause');
  Future<void> ascent() => play('ascent');
  Future<void> balloonPop() => play('balloonPop');
  Future<void> barrage() => play('barrage');
  Future<void> bassDrop() => play('bassDrop');
  Future<void> batter() => play('batter');
  Future<void> bellToll() => play('bellToll');
  Future<void> blip() => play('blip');
  Future<void> bloom() => play('bloom');
  Future<void> bongo() => play('bongo');
  Future<void> boulder() => play('boulder');
  Future<void> breakingWave() => play('breakingWave');
  Future<void> breath() => play('breath');
  Future<void> buildup() => play('buildup');
  Future<void> burst() => play('burst');
  Future<void> buzz() => play('buzz');
  Future<void> cadence() => play('cadence');
  Future<void> cameraShutter() => play('cameraShutter');
  Future<void> canter() => play('canter');
  Future<void> cascade() => play('cascade');
  Future<void> castanets() => play('castanets');
  Future<void> catPaw() => play('catPaw');
  Future<void> charge() => play('charge');
  Future<void> chime() => play('chime');
  Future<void> chip() => play('chip');
  Future<void> chirp() => play('chirp');
  Future<void> clamor() => play('clamor');
  Future<void> clasp() => play('clasp');
  Future<void> cleave() => play('cleave');
  Future<void> coil() => play('coil');
  Future<void> coinDrop() => play('coinDrop');
  Future<void> combinationLock() => play('combinationLock');
  Future<void> crescendo() => play('crescendo');
  Future<void> dewdrop() => play('dewdrop');
  Future<void> dirge() => play('dirge');
  Future<void> dissolve() => play('dissolve');
  Future<void> dogBark() => play('dogBark');
  Future<void> drone() => play('drone');
  Future<void> engineRev() => play('engineRev');
  Future<void> exhale() => play('exhale');
  Future<void> explosion() => play('explosion');
  Future<void> fadeOut() => play('fadeOut');
  Future<void> fanfare() => play('fanfare');
  Future<void> feather() => play('feather');
  Future<void> finale() => play('finale');
  Future<void> fingerDrum() => play('fingerDrum');
  Future<void> firecracker() => play('firecracker');
  Future<void> fizz() => play('fizz');
  Future<void> flare() => play('flare');
  Future<void> flick() => play('flick');
  Future<void> flinch() => play('flinch');
  Future<void> flourish() => play('flourish');
  Future<void> flurry() => play('flurry');
  Future<void> flush() => play('flush');
  Future<void> gallop() => play('gallop');
  Future<void> gavel() => play('gavel');
  Future<void> glitch() => play('glitch');
  Future<void> guitarStrum() => play('guitarStrum');
  Future<void> hail() => play('hail');
  Future<void> hammer() => play('hammer');
  Future<void> heartbeat() => play('heartbeat');
  Future<void> herald() => play('herald');
  Future<void> hoofBeat() => play('hoofBeat');
  Future<void> ignition() => play('ignition');
  Future<void> impact() => play('impact');
  Future<void> jolt() => play('jolt');
  Future<void> keyboardMechanical() => play('keyboardMechanical');
  Future<void> keyboardMembrane() => play('keyboardMembrane');
  Future<void> knell() => play('knell');
  Future<void> knock() => play('knock');
  Future<void> lament() => play('lament');
  Future<void> latch() => play('latch');
  Future<void> lighthouse() => play('lighthouse');
  Future<void> lilt() => play('lilt');
  Future<void> lock() => play('lock');
  Future<void> lope() => play('lope');
  Future<void> march() => play('march');
  Future<void> metronome() => play('metronome');
  Future<void> murmur() => play('murmur');
  Future<void> nudge() => play('nudge');
  Future<void> passingCar() => play('passingCar');
  Future<void> patter() => play('patter');
  Future<void> peal() => play('peal');
  Future<void> peck() => play('peck');
  Future<void> pendulum() => play('pendulum');
  Future<void> ping() => play('ping');
  Future<void> pip() => play('pip');
  Future<void> piston() => play('piston');
  Future<void> plink() => play('plink');
  Future<void> plummet() => play('plummet');
  Future<void> plunk() => play('plunk');
  Future<void> poke() => play('poke');
  Future<void> pound() => play('pound');
  Future<void> powerDown() => play('powerDown');
  Future<void> propel() => play('propel');
  Future<void> pulse() => play('pulse');
  Future<void> pummel() => play('pummel');
  Future<void> push() => play('push');
  Future<void> radar() => play('radar');
  Future<void> rain() => play('rain');
  Future<void> ramp() => play('ramp');
  Future<void> rap() => play('rap');
  Future<void> ratchet() => play('ratchet');
  Future<void> rebound() => play('rebound');
  Future<void> ripple() => play('ripple');
  Future<void> rivet() => play('rivet');
  Future<void> rustle() => play('rustle');
  Future<void> shockwave() => play('shockwave');
  Future<void> snap() => play('snap');
  Future<void> sonar() => play('sonar');
  Future<void> spark() => play('spark');
  Future<void> spin() => play('spin');
  Future<void> stagger() => play('stagger');
  Future<void> stamp() => play('stamp');
  Future<void> stampede() => play('stampede');
  Future<void> stomp() => play('stomp');
  Future<void> stoneSkip() => play('stoneSkip');
  Future<void> strike() => play('strike');
  Future<void> summon() => play('summon');
  Future<void> surge() => play('surge');
  Future<void> sway() => play('sway');
  Future<void> sweep() => play('sweep');
  Future<void> swell() => play('swell');
  Future<void> syncopate() => play('syncopate');
  Future<void> throb() => play('throb');
  Future<void> thud() => play('thud');
  Future<void> thump() => play('thump');
  Future<void> thunder() => play('thunder');
  Future<void> thunderRoll() => play('thunderRoll');
  Future<void> tickTock() => play('tickTock');
  Future<void> tidalSurge() => play('tidalSurge');
  Future<void> tideSwell() => play('tideSwell');
  Future<void> tremor() => play('tremor');
  Future<void> trigger() => play('trigger');
  Future<void> triumph() => play('triumph');
  Future<void> trumpet() => play('trumpet');
  Future<void> typewriter() => play('typewriter');
  Future<void> unfurl() => play('unfurl');
  Future<void> vortex() => play('vortex');
  Future<void> wane() => play('wane');
  Future<void> warDrum() => play('warDrum');
  Future<void> waterfall() => play('waterfall');
  Future<void> wave() => play('wave');
  Future<void> wisp() => play('wisp');
  Future<void> wobble() => play('wobble');
  Future<void> woodpecker() => play('woodpecker');
  Future<void> zipper() => play('zipper');
}

// ── PulsarRealtimeComposer ────────────────────────────────────────────────────

/// Controls continuous, real-time haptic feedback.
///
/// Ideal for gesture-driven feedback (e.g. sliders, drag gestures).
/// ```dart
/// // Start/update haptic as the user drags
/// await pulsar.getRealtimeComposer().set(0.8, 0.5);
/// // Stop when the gesture ends
/// await pulsar.getRealtimeComposer().stop();
/// ```
class PulsarRealtimeComposer {
  PulsarRealtimeComposer._({this.strategy});

  final RealtimeComposerStrategy? strategy;

  /// Set continuous haptic parameters. Starts automatically if not already active.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  Future<void> set(double amplitude, double frequency) => PulsarPlatform
      .instance
      .realtimeSet(amplitude, frequency, strategy: strategy);

  /// Stop the continuous haptic.
  Future<void> stop() =>
      PulsarPlatform.instance.realtimeStop(strategy: strategy);

  /// Returns true if the realtime composer is currently active.
  Future<bool> isActive() =>
      PulsarPlatform.instance.realtimeIsActive(strategy: strategy);

  /// Fire a single discrete haptic event.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  ///
  /// Defaults match iOS native (`amplitude = 1.0`, `frequency = 0.5`).
  Future<void> playDiscrete([
    double amplitude = 1.0,
    double frequency = 0.5,
  ]) => PulsarPlatform.instance.realtimePlayDiscrete(
    amplitude,
    frequency,
    strategy: strategy,
  );
}

// ── PulsarPreset ──────────────────────────────────────────────────────────────

/// Lightweight handle to a named preset, returned by [PulsarPresets.getByName].
///
/// Each call to [play] re-resolves the preset by name on the native side, so
/// the handle is safe to store but does not hold a native object reference.
class PulsarPreset {
  PulsarPreset._(this.name);

  final String name;

  Future<void> play() => PulsarPlatform.instance.play(name);
}

// ── PulsarPatternComposer ─────────────────────────────────────────────────────

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

// ── AdaptiveHaptics ───────────────────────────────────────────────────────────

/// Plays platform-adaptive haptic feedback.
///
/// Created via [Pulsar.createAdaptiveHaptics]. Example:
/// ```dart
/// final pulsar = Pulsar();
/// final adaptive = await pulsar.createAdaptiveHaptics(AdaptivePreset(
///   ios: AdaptivePresetCallback(() => pulsar.presets.systemImpactMedium()),
///   android: AdaptivePresetPattern(myPattern),
/// ));
///
/// await adaptive.play();
/// // …
/// await adaptive.dispose();
/// ```
class AdaptiveHaptics {
  AdaptiveHaptics._({
    required PulsarPatternComposer composer,
    required AdaptivePresetConfig config,
  }) : _composer = composer,
       _config = config;

  final PulsarPatternComposer _composer;
  final AdaptivePresetConfig _config;

  /// Trigger the platform-appropriate haptic feedback.
  Future<void> play() async {
    switch (_config) {
      case AdaptivePresetCallback():
        await _config.play();
      case AdaptivePresetPattern():
        await _composer.play();
    }
  }

  /// Stop an in-progress pattern-based haptic. No-op for callback configs.
  Future<void> stop() async {
    if (_config is AdaptivePresetPattern) {
      await _composer.stop();
    }
  }

  /// Release the underlying native resources.
  Future<void> dispose() async => _composer.dispose();
}
