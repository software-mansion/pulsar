import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:pulsar_haptics/pulsar.dart';

import 'sampler.dart';

/// How the haptics are produced while the animation plays.
enum HapticMode {
  /// The animation timeline is the master clock: the pattern is sampled every
  /// frame into `RealtimeComposer` events. Honours pause/seek/loop. Requires a
  /// [PatternData] source.
  realtime,

  /// A whole pattern is played once via `PatternComposer`, aligned to the start
  /// (best native fidelity). Seek/pause on the haptic side are best-effort.
  pattern,
}

/// Drives Pulsar haptics from a Lottie [AnimationController].
///
/// Attach it to the `AnimationController` you already pass to the `Lottie`
/// widget; transport ([play]/[pause]/[resume]/[stop]/[reset]/[setTimestamp]/
/// [setLoop]) steers both the animation and the haptics. In [HapticMode.realtime]
/// the controller listens to the animation and samples the pattern; in
/// [HapticMode.pattern] it fires a pre-parsed pattern aligned to the start.
///
/// The `AnimationController` is owned by the caller — this class does not
/// dispose it. Call [dispose] to detach and release the haptic resources.
class HapticLottieController {
  /// Creates a controller bound to [animationController].
  ///
  /// Pass a bundle [preset] to take its pattern and authored duration, or
  /// [haptics] for a pattern of your own — an explicit [haptics] wins. Omit both
  /// for a plain animation. A preset that carries audio plays through its own
  /// handle, which needs [HapticMode.pattern], so [hapticMode] defaults to
  /// `pattern` for one; pass it yourself to override. The [pulsar] instance is
  /// created internally if not supplied.
  HapticLottieController({
    required this.animationController,
    this.preset,
    this.haptics,
    HapticMode? hapticMode,
    this.hapticOffset = 0,
    this.hapticsEnabled = true,
    this.durationMs,
    Pulsar? pulsar,
  }) : _pulsar = pulsar ?? Pulsar(),
       _playsItself = haptics == null && (preset?.hasAudio ?? false),
       hapticMode =
           hapticMode ??
           (haptics == null && (preset?.hasAudio ?? false)
               ? HapticMode.pattern
               : HapticMode.realtime) {
    _attach();
  }

  /// The Lottie animation clock this controller follows and steers.
  final AnimationController animationController;

  /// Bundle preset supplying the pattern and the authored duration. `null` ⇒ none.
  final PresetHandle? preset;

  /// Pattern to sync with the animation. Overrides [preset]'s own pattern.
  final PatternData? haptics;

  /// Engine mode. Defaults to [HapticMode.realtime], or to [HapticMode.pattern]
  /// for a [preset] that carries audio.
  final HapticMode hapticMode;

  /// Device tuning: shift haptics by ±ms relative to the animation.
  final double hapticOffset;

  /// When `false`, the animation still plays but no haptics are emitted.
  final bool hapticsEnabled;

  /// Explicit clock length in ms. Overrides every derived duration.
  final double? durationMs;

  final Pulsar _pulsar;
  final bool _playsItself;
  PulsarRealtimeComposer? _realtime;
  PulsarPatternComposer? _pattern;
  double _lastT = 0;
  bool _disposed = false;

  /// The pattern actually driving the haptics: an explicit one, else the preset's.
  PatternData? get _resolvedPattern => haptics ?? preset?.pattern;

  bool get _useRealtime =>
      hapticMode == HapticMode.realtime && _resolvedPattern != null;

  bool get _hasContinuous {
    final pattern = _resolvedPattern;
    return pattern != null &&
        pattern.continuousPattern.amplitude.isNotEmpty &&
        pattern.continuousPattern.frequency.isNotEmpty;
  }

  /// Effective clock length in ms: an explicit [durationMs], else the preset's
  /// authored duration, else the Lottie composition once loaded, else the
  /// pattern's own length.
  double get durationMsResolved {
    final explicit = durationMs;
    if (explicit != null && explicit > 0) {
      return explicit;
    }
    final authored = preset?.duration;
    if (authored != null && authored > 0) {
      return authored;
    }
    final d = animationController.duration;
    if (d != null && d.inMicroseconds > 0) {
      return d.inMicroseconds / 1000.0;
    }
    final pattern = _resolvedPattern;
    return pattern != null ? patternDurationMs(pattern) : 0;
  }

  void _attach() {
    if (_resolvedPattern == null || !hapticsEnabled) {
      return;
    }
    if (_useRealtime) {
      _realtime = _pulsar.getRealtimeComposer();
      animationController.addListener(_onTick);
    } else if (!_playsItself) {
      _pattern = _pulsar.getPatternComposer();
      // Pre-parse so the engine is warm and play() fires without delay.
      unawaited(_pattern!.parsePattern(_resolvedPattern!));
    }
  }

  void _onTick() {
    final pattern = _resolvedPattern;
    if (_disposed || !hapticsEnabled || !_useRealtime || pattern == null) {
      return;
    }
    final dur = durationMsResolved;
    final t = animationController.value * dur;
    final ht = t + hapticOffset;
    if (_hasContinuous) {
      unawaited(
        _realtime!.set(
          clamp01(sampleEnvelope(pattern.continuousPattern.amplitude, ht)),
          clamp01(sampleEnvelope(pattern.continuousPattern.frequency, ht)),
        ),
      );
    }
    var prev = _lastT;
    if (t < prev) {
      prev = 0; // wrapped on loop
    }
    for (final e in pattern.discretePattern) {
      if (e.time > prev && e.time <= t) {
        unawaited(
          _realtime!.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency)),
        );
      }
    }
    _lastT = t;
  }

  Future<void> _fireHaptics() async {
    if (!hapticsEnabled || _resolvedPattern == null) {
      return;
    }
    if (_useRealtime) {
      _lastT = 0;
    } else if (_playsItself) {
      preset!.play();
    } else {
      await _pattern?.play();
    }
  }

  Future<void> _stopHaptics() async {
    if (_useRealtime) {
      _lastT = 0;
      if (_hasContinuous) {
        await _realtime?.stop();
      }
    } else if (_playsItself) {
      preset?.stop();
    } else {
      await _pattern?.stop();
    }
  }

  /// Play from the start, animation and haptics together.
  Future<void> play() async {
    _lastT = 0;
    unawaited(animationController.forward(from: 0));
    await _fireHaptics();
  }

  /// Pause both animation and haptics.
  Future<void> pause() async {
    animationController.stop();
    await _stopHaptics();
  }

  /// Resume from the current position.
  Future<void> resume() async {
    unawaited(animationController.forward());
  }

  /// Stop and rewind to the start.
  Future<void> stop() async {
    animationController.reset();
    _lastT = 0;
    await _stopHaptics();
  }

  /// Rewind to the start (also stops haptics).
  Future<void> reset() async {
    animationController.reset();
    _lastT = 0;
    await _stopHaptics();
  }

  /// Seek both animation and haptics to [ms] from the start.
  void setTimestamp(double ms) {
    final dur = durationMsResolved;
    if (dur > 0) {
      animationController.value = clamp01(ms / dur);
    }
    _lastT = ms;
  }

  /// Loop the animation. [count] limits the iterations (null = forever);
  /// [reverse] plays a boomerang. In `pattern` mode the pattern fires once at
  /// the start (per-iteration re-fire is not automatic).
  Future<void> setLoop(bool loop, {int? count, bool reverse = false}) async {
    if (loop) {
      _lastT = 0;
      unawaited(animationController.repeat(reverse: reverse, count: count));
      await _fireHaptics();
    } else {
      animationController.stop();
    }
  }

  /// Detach from the animation and release haptic resources. Does **not**
  /// dispose [animationController] — the caller owns it.
  void dispose() {
    if (_disposed) {
      return;
    }
    _disposed = true;
    if (_useRealtime) {
      animationController.removeListener(_onTick);
    }
    unawaited(_stopHaptics());
    unawaited(_pattern?.dispose());
  }
}
