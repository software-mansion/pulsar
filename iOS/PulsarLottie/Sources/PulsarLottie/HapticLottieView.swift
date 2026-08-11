import SwiftUI
import Lottie
import Pulsar

/// A SwiftUI view that plays a Lottie animation with synced Pulsar haptics.
///
/// A thin wrapper over `LottieAnimationView` + ``HapticLottieController``. Pass
/// `haptics` to enable synced haptics; omit it for a plain animation.
public struct HapticLottieView: UIViewRepresentable {
    private let name: String
    private let bundle: Bundle
    private let haptics: PatternData?
    private let mode: HapticMode
    private let hapticOffset: Double
    private let hapticsEnabled: Bool
    private let autoPlay: Bool
    private let loopMode: LottieLoopMode

    /// Load a Lottie animation named `name` from `bundle`.
    public init(
        _ name: String,
        bundle: Bundle = .main,
        haptics: PatternData? = nil,
        mode: HapticMode = .realtime,
        hapticOffset: Double = 0,
        hapticsEnabled: Bool = true,
        autoPlay: Bool = true,
        loopMode: LottieLoopMode = .playOnce
    ) {
        self.name = name
        self.bundle = bundle
        self.haptics = haptics
        self.mode = mode
        self.hapticOffset = hapticOffset
        self.hapticsEnabled = hapticsEnabled
        self.autoPlay = autoPlay
        self.loopMode = loopMode
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    public func makeUIView(context: Context) -> LottieAnimationView {
        let view = LottieAnimationView(name: name, bundle: bundle)
        view.loopMode = loopMode
        view.contentMode = .scaleAspectFit
        let controller = HapticLottieController(
            animationView: view,
            pulsar: context.coordinator.pulsar,
            haptics: haptics,
            mode: mode,
            offsetMs: hapticOffset,
            enabled: hapticsEnabled
        )
        context.coordinator.controller = controller
        if autoPlay { controller.play() }
        return view
    }

    public func updateUIView(_ uiView: LottieAnimationView, context: Context) {}

    /// Holds the shared `Pulsar` instance and the controller for the view's lifetime.
    public final class Coordinator {
        let pulsar = Pulsar()
        var controller: HapticLottieController?
    }
}
