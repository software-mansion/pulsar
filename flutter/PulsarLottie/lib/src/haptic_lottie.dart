import 'package:flutter/widgets.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsar_haptics/pulsar.dart';

import 'haptic_lottie_controller.dart';

enum _LottieSource { asset, network, memory }

/// A drop-in Lottie widget that plays Pulsar haptics in sync.
///
/// Wraps the `lottie` package's `Lottie` widget with an internal
/// `AnimationController` and a [HapticLottieController]. Pass [haptics] (a
/// [PatternData]) to enable synced haptics; omit it for a plain animation.
///
/// [HapticLottie.preset] takes a bundle preset instead and renders the Lottie
/// animation it was authored against, with its pattern and duration:
///
/// ```dart
/// HapticLottie.preset(bundle.celebration, autoPlay: true)
/// ```
///
/// Grab the [HapticLottieController] via [onControllerCreated] to drive
/// transport (`play`/`pause`/`setTimestamp`/…). Prefer this widget when you
/// don't already manage your own `AnimationController`; otherwise construct a
/// [HapticLottieController] directly around your controller.
class HapticLottie extends StatefulWidget {
  /// Load a Lottie asset bundled with the app.
  const HapticLottie.asset(
    this.src, {
    super.key,
    this.preset,
    this.haptics,
    this.hapticMode,
    this.hapticOffset = 0,
    this.hapticsEnabled = true,
    this.durationMs,
    this.autoPlay = false,
    this.repeat = false,
    this.repeatCount,
    this.repeatReverse = false,
    this.onControllerCreated,
    this.width,
    this.height,
    this.fit,
    this.alignment,
  }) : _source = _LottieSource.asset;

  /// Load a Lottie animation from a network URL.
  const HapticLottie.network(
    this.src, {
    super.key,
    this.preset,
    this.haptics,
    this.hapticMode,
    this.hapticOffset = 0,
    this.hapticsEnabled = true,
    this.durationMs,
    this.autoPlay = false,
    this.repeat = false,
    this.repeatCount,
    this.repeatReverse = false,
    this.onControllerCreated,
    this.width,
    this.height,
    this.fit,
    this.alignment,
  }) : _source = _LottieSource.network;

  /// Render a bundle [preset]: its Lottie animation, its pattern and its
  /// authored duration, with no separate `src`.
  ///
  /// A preset with no animation renders an empty box; check `hasAnimation`, or
  /// use [HapticLottie.asset] and pass the preset alongside it.
  const HapticLottie.preset(
    PresetHandle this.preset, {
    super.key,
    this.haptics,
    this.hapticMode,
    this.hapticOffset = 0,
    this.hapticsEnabled = true,
    this.durationMs,
    this.autoPlay = false,
    this.repeat = false,
    this.repeatCount,
    this.repeatReverse = false,
    this.onControllerCreated,
    this.width,
    this.height,
    this.fit,
    this.alignment,
  }) : src = '',
       _source = _LottieSource.memory;

  /// Asset name or URL depending on the constructor used.
  final String src;

  /// Bundle preset supplying the pattern and the authored duration — and, for
  /// [HapticLottie.preset], the animation. `null` ⇒ none.
  final PresetHandle? preset;

  /// Pattern to sync with the animation. Overrides [preset]'s own pattern.
  final PatternData? haptics;

  /// Engine mode. Defaults to [HapticMode.realtime], or to [HapticMode.pattern]
  /// for a [preset] that carries audio.
  final HapticMode? hapticMode;

  /// Device tuning: shift haptics by ±ms relative to the animation.
  final double hapticOffset;

  /// Turn haptics off without changing the animation.
  final bool hapticsEnabled;

  /// Explicit haptic clock length in ms. Overrides every derived duration.
  final double? durationMs;

  /// Start playing as soon as the animation loads.
  final bool autoPlay;

  /// Loop the animation (with [autoPlay]).
  final bool repeat;

  /// Limit the number of loops (null = forever).
  final int? repeatCount;

  /// Boomerang loop (forward then reverse).
  final bool repeatReverse;

  /// Called once with the [HapticLottieController] so you can drive transport.
  final void Function(HapticLottieController controller)? onControllerCreated;

  /// Forwarded to the underlying `Lottie` widget.
  final double? width;

  /// Forwarded to the underlying `Lottie` widget.
  final double? height;

  /// Forwarded to the underlying `Lottie` widget.
  final BoxFit? fit;

  /// Forwarded to the underlying `Lottie` widget.
  final Alignment? alignment;

  final _LottieSource _source;

  @override
  State<HapticLottie> createState() => _HapticLottieState();
}

class _HapticLottieState extends State<HapticLottie>
    with SingleTickerProviderStateMixin {
  late final AnimationController _animController;
  late final HapticLottieController _haptic;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this);
    _haptic = HapticLottieController(
      animationController: _animController,
      preset: widget.preset,
      haptics: widget.haptics,
      hapticMode: widget.hapticMode,
      hapticOffset: widget.hapticOffset,
      hapticsEnabled: widget.hapticsEnabled,
      durationMs: widget.durationMs,
    );
    widget.onControllerCreated?.call(_haptic);
  }

  @override
  void dispose() {
    _haptic.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _onLoaded(LottieComposition composition) {
    _animController.duration = composition.duration;
    if (widget.autoPlay) {
      if (widget.repeat) {
        _haptic.setLoop(
          true,
          count: widget.repeatCount,
          reverse: widget.repeatReverse,
        );
      } else {
        _haptic.play();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    switch (widget._source) {
      case _LottieSource.asset:
        return Lottie.asset(
          widget.src,
          controller: _animController,
          onLoaded: _onLoaded,
          width: widget.width,
          height: widget.height,
          fit: widget.fit,
          alignment: widget.alignment,
        );
      case _LottieSource.network:
        return Lottie.network(
          widget.src,
          controller: _animController,
          onLoaded: _onLoaded,
          width: widget.width,
          height: widget.height,
          fit: widget.fit,
          alignment: widget.alignment,
        );
      case _LottieSource.memory:
        final animation = widget.preset?.animation;
        if (animation == null) {
          return SizedBox(width: widget.width, height: widget.height);
        }
        return Lottie.memory(
          animation.data,
          controller: _animController,
          onLoaded: _onLoaded,
          width: widget.width,
          height: widget.height,
          fit: widget.fit,
          alignment: widget.alignment,
        );
    }
  }
}
