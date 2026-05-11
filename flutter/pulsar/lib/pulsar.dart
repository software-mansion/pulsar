/// Pulsar — rich haptic feedback for Flutter.
///
/// Import this library to access [Pulsar], [PulsarPresets], [PulsarRealtimeComposer],
/// [PulsarPatternComposer], and [AdaptiveHaptics].
library;

export 'pulsar_types.dart';
export 'pulsar_platform_interface.dart';

import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;

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
  /// Creates a new [Pulsar] instance. Reuse a single instance throughout your app.
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
    final config = defaultTargetPlatform == TargetPlatform.iOS ? preset.ios : preset.android;
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

  /// Play a preset by its [name] string. Prefer the named shorthand methods
  /// for compile-time safety (e.g. [systemImpactMedium], [heartbeat]).
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

  /// Plays the system light-impact haptic.
  Future<void> systemImpactLight() => play('systemImpactLight');

  /// Plays the system medium-impact haptic.
  Future<void> systemImpactMedium() => play('systemImpactMedium');

  /// Plays the system heavy-impact haptic.
  Future<void> systemImpactHeavy() => play('systemImpactHeavy');

  /// Plays the system soft-impact haptic.
  Future<void> systemImpactSoft() => play('systemImpactSoft');

  /// Plays the system rigid-impact haptic.
  Future<void> systemImpactRigid() => play('systemImpactRigid');

  /// Plays the system success-notification haptic.
  Future<void> systemNotificationSuccess() => play('systemNotificationSuccess');

  /// Plays the system warning-notification haptic.
  Future<void> systemNotificationWarning() => play('systemNotificationWarning');

  /// Plays the system error-notification haptic.
  Future<void> systemNotificationError() => play('systemNotificationError');

  /// Plays the system selection-change haptic.
  Future<void> systemSelection() => play('systemSelection');

  /// Plays the system single-click effect haptic.
  Future<void> systemEffectClick() => play('systemEffectClick');

  /// Plays the system double-click effect haptic.
  Future<void> systemEffectDoubleClick() => play('systemEffectDoubleClick');

  /// Plays the system tick effect haptic.
  Future<void> systemEffectTick() => play('systemEffectTick');

  /// Plays the system heavy-click effect haptic.
  Future<void> systemEffectHeavyClick() => play('systemEffectHeavyClick');

  /// Plays the system long-press haptic.
  Future<void> systemLongPress() => play('systemLongPress');

  /// Plays the system virtual-key haptic.
  Future<void> systemVirtualKey() => play('systemVirtualKey');

  /// Plays the system keyboard-tap haptic.
  Future<void> systemKeyboardTap() => play('systemKeyboardTap');

  /// Plays the system clock-tick haptic.
  Future<void> systemClockTick() => play('systemClockTick');

  /// Plays the system calendar-date-picker haptic.
  Future<void> systemCalendarDate() => play('systemCalendarDate');

  /// Plays the system context-click haptic.
  Future<void> systemContextClick() => play('systemContextClick');

  /// Plays the system keyboard-press haptic.
  Future<void> systemKeyboardPress() => play('systemKeyboardPress');

  /// Plays the system keyboard-release haptic.
  Future<void> systemKeyboardRelease() => play('systemKeyboardRelease');

  /// Plays the system virtual-key-release haptic.
  Future<void> systemVirtualKeyRelease() => play('systemVirtualKeyRelease');

  /// Plays the system text-handle-move haptic.
  Future<void> systemTextHandleMove() => play('systemTextHandleMove');

  /// Plays the system drag-crossing haptic.
  Future<void> systemDragCrossing() => play('systemDragCrossing');

  /// Plays the system gesture-start haptic.
  Future<void> systemGestureStart() => play('systemGestureStart');

  /// Plays the system gesture-end haptic.
  Future<void> systemGestureEnd() => play('systemGestureEnd');

  /// Plays the system edge-squeeze haptic.
  Future<void> systemEdgeSqueeze() => play('systemEdgeSqueeze');

  /// Plays the system edge-release haptic.
  Future<void> systemEdgeRelease() => play('systemEdgeRelease');

  /// Plays the system confirm haptic.
  Future<void> systemConfirm() => play('systemConfirm');

  /// Plays the system release haptic.
  Future<void> systemRelease() => play('systemRelease');

  /// Plays the system scroll-tick haptic.
  Future<void> systemScrollTick() => play('systemScrollTick');

  /// Plays the system scroll-item-focus haptic.
  Future<void> systemScrollItemFocus() => play('systemScrollItemFocus');

  /// Plays the system scroll-limit haptic.
  Future<void> systemScrollLimit() => play('systemScrollLimit');

  /// Plays the system toggle-on haptic.
  Future<void> systemToggleOn() => play('systemToggleOn');

  /// Plays the system toggle-off haptic.
  Future<void> systemToggleOff() => play('systemToggleOff');

  /// Plays the system drag-start haptic.
  Future<void> systemDragStart() => play('systemDragStart');

  /// Plays the system segment-tick haptic.
  Future<void> systemSegmentTick() => play('systemSegmentTick');

  /// Plays the system frequent-segment-tick haptic.
  Future<void> systemSegmentFrequentTick() => play('systemSegmentFrequentTick');

  /// Plays the system primitive-click haptic.
  Future<void> systemPrimitiveClick() => play('systemPrimitiveClick');

  /// Plays the system primitive-thud haptic.
  Future<void> systemPrimitiveThud() => play('systemPrimitiveThud');

  /// Plays the system primitive-spin haptic.
  Future<void> systemPrimitiveSpin() => play('systemPrimitiveSpin');

  /// Plays the system primitive-quick-rise haptic.
  Future<void> systemPrimitiveQuickRise() => play('systemPrimitiveQuickRise');

  /// Plays the system primitive-slow-rise haptic.
  Future<void> systemPrimitiveSlowRise() => play('systemPrimitiveSlowRise');

  /// Plays the system primitive-quick-fall haptic.
  Future<void> systemPrimitiveQuickFall() => play('systemPrimitiveQuickFall');

  /// Plays the system primitive-tick haptic.
  Future<void> systemPrimitiveTick() => play('systemPrimitiveTick');

  /// Plays the system primitive-low-tick haptic.
  Future<void> systemPrimitiveLowTick() => play('systemPrimitiveLowTick');

  // Library presets

  /// Plays the afterglow preset.
  Future<void> afterglow() => play('afterglow');

  /// Plays the aftershock preset.
  Future<void> aftershock() => play('aftershock');

  /// Plays the alarm preset.
  Future<void> alarm() => play('alarm');

  /// Plays the anvil preset.
  Future<void> anvil() => play('anvil');

  /// Plays the applause preset.
  Future<void> applause() => play('applause');

  /// Plays the ascent preset.
  Future<void> ascent() => play('ascent');

  /// Plays the balloon-pop preset.
  Future<void> balloonPop() => play('balloonPop');

  /// Plays the barrage preset.
  Future<void> barrage() => play('barrage');

  /// Plays the bass-drop preset.
  Future<void> bassDrop() => play('bassDrop');

  /// Plays the batter preset.
  Future<void> batter() => play('batter');

  /// Plays the bell-toll preset.
  Future<void> bellToll() => play('bellToll');

  /// Plays the blip preset.
  Future<void> blip() => play('blip');

  /// Plays the bloom preset.
  Future<void> bloom() => play('bloom');

  /// Plays the bongo preset.
  Future<void> bongo() => play('bongo');

  /// Plays the boulder preset.
  Future<void> boulder() => play('boulder');

  /// Plays the breaking-wave preset.
  Future<void> breakingWave() => play('breakingWave');

  /// Plays the breath preset.
  Future<void> breath() => play('breath');

  /// Plays the buildup preset.
  Future<void> buildup() => play('buildup');

  /// Plays the burst preset.
  Future<void> burst() => play('burst');

  /// Plays the buzz preset.
  Future<void> buzz() => play('buzz');

  /// Plays the cadence preset.
  Future<void> cadence() => play('cadence');

  /// Plays the camera-shutter preset.
  Future<void> cameraShutter() => play('cameraShutter');

  /// Plays the canter preset.
  Future<void> canter() => play('canter');

  /// Plays the cascade preset.
  Future<void> cascade() => play('cascade');

  /// Plays the castanets preset.
  Future<void> castanets() => play('castanets');

  /// Plays the cat-paw preset.
  Future<void> catPaw() => play('catPaw');

  /// Plays the charge preset.
  Future<void> charge() => play('charge');

  /// Plays the chime preset.
  Future<void> chime() => play('chime');

  /// Plays the chip preset.
  Future<void> chip() => play('chip');

  /// Plays the chirp preset.
  Future<void> chirp() => play('chirp');

  /// Plays the clamor preset.
  Future<void> clamor() => play('clamor');

  /// Plays the clasp preset.
  Future<void> clasp() => play('clasp');

  /// Plays the cleave preset.
  Future<void> cleave() => play('cleave');

  /// Plays the coil preset.
  Future<void> coil() => play('coil');

  /// Plays the coin-drop preset.
  Future<void> coinDrop() => play('coinDrop');

  /// Plays the combination-lock preset.
  Future<void> combinationLock() => play('combinationLock');

  /// Plays the crescendo preset.
  Future<void> crescendo() => play('crescendo');

  /// Plays the dewdrop preset.
  Future<void> dewdrop() => play('dewdrop');

  /// Plays the dirge preset.
  Future<void> dirge() => play('dirge');

  /// Plays the dissolve preset.
  Future<void> dissolve() => play('dissolve');

  /// Plays the dog-bark preset.
  Future<void> dogBark() => play('dogBark');

  /// Plays the drone preset.
  Future<void> drone() => play('drone');

  /// Plays the engine-rev preset.
  Future<void> engineRev() => play('engineRev');

  /// Plays the exhale preset.
  Future<void> exhale() => play('exhale');

  /// Plays the explosion preset.
  Future<void> explosion() => play('explosion');

  /// Plays the fade-out preset.
  Future<void> fadeOut() => play('fadeOut');

  /// Plays the fanfare preset.
  Future<void> fanfare() => play('fanfare');

  /// Plays the feather preset.
  Future<void> feather() => play('feather');

  /// Plays the finale preset.
  Future<void> finale() => play('finale');

  /// Plays the finger-drum preset.
  Future<void> fingerDrum() => play('fingerDrum');

  /// Plays the firecracker preset.
  Future<void> firecracker() => play('firecracker');

  /// Plays the fizz preset.
  Future<void> fizz() => play('fizz');

  /// Plays the flare preset.
  Future<void> flare() => play('flare');

  /// Plays the flick preset.
  Future<void> flick() => play('flick');

  /// Plays the flinch preset.
  Future<void> flinch() => play('flinch');

  /// Plays the flourish preset.
  Future<void> flourish() => play('flourish');

  /// Plays the flurry preset.
  Future<void> flurry() => play('flurry');

  /// Plays the flush preset.
  Future<void> flush() => play('flush');

  /// Plays the gallop preset.
  Future<void> gallop() => play('gallop');

  /// Plays the gavel preset.
  Future<void> gavel() => play('gavel');

  /// Plays the glitch preset.
  Future<void> glitch() => play('glitch');

  /// Plays the guitar-strum preset.
  Future<void> guitarStrum() => play('guitarStrum');

  /// Plays the hail preset.
  Future<void> hail() => play('hail');

  /// Plays the hammer preset.
  Future<void> hammer() => play('hammer');

  /// Plays the heartbeat preset.
  Future<void> heartbeat() => play('heartbeat');

  /// Plays the herald preset.
  Future<void> herald() => play('herald');

  /// Plays the hoof-beat preset.
  Future<void> hoofBeat() => play('hoofBeat');

  /// Plays the ignition preset.
  Future<void> ignition() => play('ignition');

  /// Plays the impact preset.
  Future<void> impact() => play('impact');

  /// Plays the jolt preset.
  Future<void> jolt() => play('jolt');

  /// Plays the mechanical-keyboard preset.
  Future<void> keyboardMechanical() => play('keyboardMechanical');

  /// Plays the membrane-keyboard preset.
  Future<void> keyboardMembrane() => play('keyboardMembrane');

  /// Plays the knell preset.
  Future<void> knell() => play('knell');

  /// Plays the knock preset.
  Future<void> knock() => play('knock');

  /// Plays the lament preset.
  Future<void> lament() => play('lament');

  /// Plays the latch preset.
  Future<void> latch() => play('latch');

  /// Plays the lighthouse preset.
  Future<void> lighthouse() => play('lighthouse');

  /// Plays the lilt preset.
  Future<void> lilt() => play('lilt');

  /// Plays the lock preset.
  Future<void> lock() => play('lock');

  /// Plays the lope preset.
  Future<void> lope() => play('lope');

  /// Plays the march preset.
  Future<void> march() => play('march');

  /// Plays the metronome preset.
  Future<void> metronome() => play('metronome');

  /// Plays the murmur preset.
  Future<void> murmur() => play('murmur');

  /// Plays the nudge preset.
  Future<void> nudge() => play('nudge');

  /// Plays the passing-car preset.
  Future<void> passingCar() => play('passingCar');

  /// Plays the patter preset.
  Future<void> patter() => play('patter');

  /// Plays the peal preset.
  Future<void> peal() => play('peal');

  /// Plays the peck preset.
  Future<void> peck() => play('peck');

  /// Plays the pendulum preset.
  Future<void> pendulum() => play('pendulum');

  /// Plays the ping preset.
  Future<void> ping() => play('ping');

  /// Plays the pip preset.
  Future<void> pip() => play('pip');

  /// Plays the piston preset.
  Future<void> piston() => play('piston');

  /// Plays the plink preset.
  Future<void> plink() => play('plink');

  /// Plays the plummet preset.
  Future<void> plummet() => play('plummet');

  /// Plays the plunk preset.
  Future<void> plunk() => play('plunk');

  /// Plays the poke preset.
  Future<void> poke() => play('poke');

  /// Plays the pound preset.
  Future<void> pound() => play('pound');

  /// Plays the power-down preset.
  Future<void> powerDown() => play('powerDown');

  /// Plays the propel preset.
  Future<void> propel() => play('propel');

  /// Plays the pulse preset.
  Future<void> pulse() => play('pulse');

  /// Plays the pummel preset.
  Future<void> pummel() => play('pummel');

  /// Plays the push preset.
  Future<void> push() => play('push');

  /// Plays the radar preset.
  Future<void> radar() => play('radar');

  /// Plays the rain preset.
  Future<void> rain() => play('rain');

  /// Plays the ramp preset.
  Future<void> ramp() => play('ramp');

  /// Plays the rap preset.
  Future<void> rap() => play('rap');

  /// Plays the ratchet preset.
  Future<void> ratchet() => play('ratchet');

  /// Plays the rebound preset.
  Future<void> rebound() => play('rebound');

  /// Plays the ripple preset.
  Future<void> ripple() => play('ripple');

  /// Plays the rivet preset.
  Future<void> rivet() => play('rivet');

  /// Plays the rustle preset.
  Future<void> rustle() => play('rustle');

  /// Plays the shockwave preset.
  Future<void> shockwave() => play('shockwave');

  /// Plays the snap preset.
  Future<void> snap() => play('snap');

  /// Plays the sonar preset.
  Future<void> sonar() => play('sonar');

  /// Plays the spark preset.
  Future<void> spark() => play('spark');

  /// Plays the spin preset.
  Future<void> spin() => play('spin');

  /// Plays the stagger preset.
  Future<void> stagger() => play('stagger');

  /// Plays the stamp preset.
  Future<void> stamp() => play('stamp');

  /// Plays the stampede preset.
  Future<void> stampede() => play('stampede');

  /// Plays the stomp preset.
  Future<void> stomp() => play('stomp');

  /// Plays the stone-skip preset.
  Future<void> stoneSkip() => play('stoneSkip');

  /// Plays the strike preset.
  Future<void> strike() => play('strike');

  /// Plays the summon preset.
  Future<void> summon() => play('summon');

  /// Plays the surge preset.
  Future<void> surge() => play('surge');

  /// Plays the sway preset.
  Future<void> sway() => play('sway');

  /// Plays the sweep preset.
  Future<void> sweep() => play('sweep');

  /// Plays the swell preset.
  Future<void> swell() => play('swell');

  /// Plays the syncopate preset.
  Future<void> syncopate() => play('syncopate');

  /// Plays the throb preset.
  Future<void> throb() => play('throb');

  /// Plays the thud preset.
  Future<void> thud() => play('thud');

  /// Plays the thump preset.
  Future<void> thump() => play('thump');

  /// Plays the thunder preset.
  Future<void> thunder() => play('thunder');

  /// Plays the thunder-roll preset.
  Future<void> thunderRoll() => play('thunderRoll');

  /// Plays the tick-tock preset.
  Future<void> tickTock() => play('tickTock');

  /// Plays the tidal-surge preset.
  Future<void> tidalSurge() => play('tidalSurge');

  /// Plays the tide-swell preset.
  Future<void> tideSwell() => play('tideSwell');

  /// Plays the tremor preset.
  Future<void> tremor() => play('tremor');

  /// Plays the trigger preset.
  Future<void> trigger() => play('trigger');

  /// Plays the triumph preset.
  Future<void> triumph() => play('triumph');

  /// Plays the trumpet preset.
  Future<void> trumpet() => play('trumpet');

  /// Plays the typewriter preset.
  Future<void> typewriter() => play('typewriter');

  /// Plays the unfurl preset.
  Future<void> unfurl() => play('unfurl');

  /// Plays the vortex preset.
  Future<void> vortex() => play('vortex');

  /// Plays the wane preset.
  Future<void> wane() => play('wane');

  /// Plays the war-drum preset.
  Future<void> warDrum() => play('warDrum');

  /// Plays the waterfall preset.
  Future<void> waterfall() => play('waterfall');

  /// Plays the wave preset.
  Future<void> wave() => play('wave');

  /// Plays the wisp preset.
  Future<void> wisp() => play('wisp');

  /// Plays the wobble preset.
  Future<void> wobble() => play('wobble');

  /// Plays the woodpecker preset.
  Future<void> woodpecker() => play('woodpecker');

  /// Plays the zipper preset.
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

  /// The preset name used to resolve and play this preset on the native side.
  final String name;

  /// Trigger this preset's haptic feedback.
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
