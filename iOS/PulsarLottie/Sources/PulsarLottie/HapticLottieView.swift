import SwiftUI
import Lottie
import Pulsar

/// A SwiftUI view that plays a Lottie animation with synced Pulsar haptics.
///
/// A thin wrapper over `LottieAnimationView` + ``HapticLottieController``. Pass
/// `haptics` to enable synced haptics; omit it for a plain animation.
///
/// A bundle preset supplies the animation, the pattern and the duration at once:
///
///     HapticLottieView(preset: pack.celebration)
public struct HapticLottieView: UIViewRepresentable {
    /// Where the Lottie animation comes from.
    private enum Animation {
        /// A `.json` / `.lottie` resource in a bundle.
        case named(String, Bundle)
        /// Raw Lottie bytes, as carried by a bundle preset.
        case data(Data)
    }

    private let animation: Animation
    private let preset: PresetHandle?
    private let haptics: PatternData?
    private let hapticMode: HapticMode?
    private let hapticOffset: Double
    private let hapticsEnabled: Bool
    private let durationMs: Double?
    private let autoPlay: Bool
    private let loopMode: LottieLoopMode

    /// Load a Lottie animation named `name` from `bundle`.
    public init(
        _ name: String,
        bundle: Bundle = .main,
        preset: PresetHandle? = nil,
        haptics: PatternData? = nil,
        hapticMode: HapticMode? = nil,
        hapticOffset: Double = 0,
        hapticsEnabled: Bool = true,
        durationMs: Double? = nil,
        autoPlay: Bool = true,
        loopMode: LottieLoopMode = .playOnce
    ) {
        self.animation = .named(name, bundle)
        self.preset = preset
        self.haptics = haptics
        self.hapticMode = hapticMode
        self.hapticOffset = hapticOffset
        self.hapticsEnabled = hapticsEnabled
        self.durationMs = durationMs
        self.autoPlay = autoPlay
        self.loopMode = loopMode
    }

    /// Render a bundle `preset`: its Lottie animation, its pattern and its authored
    /// duration, with no separate `source`.
    ///
    /// A preset that carries audio plays that audio too, which needs
    /// ``HapticMode/pattern`` — so `hapticMode` defaults to `.pattern` for one.
    /// A preset with no animation renders nothing; check `hasAnimation`, or use the
    /// `name:` initializer and pass the preset alongside it.
    public init(
        preset: PresetHandle,
        haptics: PatternData? = nil,
        hapticMode: HapticMode? = nil,
        hapticOffset: Double = 0,
        hapticsEnabled: Bool = true,
        durationMs: Double? = nil,
        autoPlay: Bool = true,
        loopMode: LottieLoopMode = .playOnce
    ) {
        self.animation = .data(preset.animation?.data ?? Data())
        self.preset = preset
        self.haptics = haptics
        self.hapticMode = hapticMode
        self.hapticOffset = hapticOffset
        self.hapticsEnabled = hapticsEnabled
        self.durationMs = durationMs
        self.autoPlay = autoPlay
        self.loopMode = loopMode
    }

    public func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    public func makeUIView(context: Context) -> LottieAnimationView {
        let view: LottieAnimationView
        switch animation {
        case let .named(name, bundle):
            view = LottieAnimationView(name: name, bundle: bundle)
        case let .data(data):
            view = LottieAnimationView(animation: try? LottieAnimation.from(data: data))
        }
        view.loopMode = loopMode
        view.contentMode = .scaleAspectFit
        let controller = HapticLottieController(
            animationView: view,
            pulsar: context.coordinator.pulsar,
            preset: preset,
            haptics: haptics,
            hapticMode: hapticMode,
            hapticOffset: hapticOffset,
            hapticsEnabled: hapticsEnabled,
            durationMs: durationMs
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
