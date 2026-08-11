/// Play [Pulsar](https://github.com/software-mansion/pulsar) haptics in sync
/// with a Lottie animation.
///
/// - [HapticLottie] — a drop-in widget wrapping the `lottie` `Lottie` widget.
/// - [HapticLottieController] — attach haptics to an `AnimationController` you
///   already own.
library;

export 'src/haptic_lottie.dart' show HapticLottie;
export 'src/haptic_lottie_controller.dart'
    show HapticLottieController, HapticMode;
