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
  /// Pass [haptics] (a [PatternData]) to enable haptics; omit it for a plain
  /// animation. The [pulsar] instance is created internally if not supplied.
  HapticLottieController({
    required this.animationController,
    this.haptics,
    this.mode = HapticMode.realtime,
    this.offsetMs = 0,
    this.enabled = true,
    Pulsar? pulsar,
  }) : _pulsar = pulsar ?? Pulsar() {
    _attach();
  }

  /// The Lottie animation clock this controller follows and steers.
  final AnimationController animationController;

  /// Pattern to sync with the animation. `null` ⇒ animation only.
  final PatternData? haptics;

  /// Engine mode. Defaults to [HapticMode.realtime].
  final HapticMode mode;

  /// Device tuning: shift haptics by ±ms relative to the animation.
  final double offsetMs;

  /// When `false`, the animation still plays but no haptics are emitted.
  final bool enabled;

  final Pulsar _pulsar;
  PulsarRealtimeComposer? _realtime;
  PulsarPatternComposer? _pattern;
  double _lastT = 0;
  bool _disposed = false;

  bool get _useRealtime => mode == HapticMode.realtime && haptics != null;

  bool get _hasContinuous =>
      haptics != null &&
      haptics!.continuousPattern.amplitude.isNotEmpty &&
      haptics!.continuousPattern.frequency.isNotEmpty;

  /// Effective clock length in ms: the Lottie composition duration once loaded,
  /// else the pattern's length.
  double get durationMs {
    final d = animationController.duration;
    if (d != null && d.inMicroseconds > 0) {
      return d.inMicroseconds / 1000.0;
    }
    return haptics != null ? patternDurationMs(haptics!) : 0;
  }

  void _attach() {
    if (haptics == null || !enabled) {
      return;
    }
    if (_useRealtime) {
      _realtime = _pulsar.getRealtimeComposer();
      animationController.addListener(_onTick);
    } else {
      _pattern = _pulsar.getPatternComposer();
      // Pre-parse so the engine is warm and play() fires without delay.
      unawaited(_pattern!.parsePattern(haptics!));
    }
  }

  void _onTick() {
    if (_disposed || !enabled || !_useRealtime) {
      return;
    }
    final dur = durationMs;
    final t = animationController.value * dur;
    final ht = t + offsetMs;
    if (_hasContinuous) {
      unawaited(
        _realtime!.set(
          clamp01(sampleEnvelope(haptics!.continuousPattern.amplitude, ht)),
          clamp01(sampleEnvelope(haptics!.continuousPattern.frequency, ht)),
        ),
      );
    }
    var prev = _lastT;
    if (t < prev) {
      prev = 0; // wrapped on loop
    }
    for (final e in haptics!.discretePattern) {
      if (e.time > prev && e.time <= t) {
        unawaited(_realtime!.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency)));
      }
    }
    _lastT = t;
  }

  Future<void> _fireHaptics() async {
    if (!enabled || haptics == null) {
      return;
    }
    if (_useRealtime) {
      _lastT = 0;
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
    final dur = durationMs;
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
