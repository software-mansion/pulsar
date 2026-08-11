import UIKit
import Lottie
import Pulsar

/// How the haptics are produced while the animation plays.
public enum HapticMode {
    /// The animation timeline is the master clock: a `CADisplayLink` drives the
    /// Lottie progress and samples the pattern into `RealtimeComposer` events.
    /// Honours pause/seek/loop. Requires a `PatternData` source.
    case realtime
    /// A whole pattern is played once via `PatternComposer`, aligned to the
    /// start (best native fidelity). Seek/pause on the haptic side are best-effort.
    case pattern
}

/// Drives Pulsar haptics from a Lottie `LottieAnimationView`.
///
/// Attach it to a `LottieAnimationView` you already use (or via
/// ``PulsarLottie/bind(_:pulsar:haptics:mode:offsetMs:enabled:)``); the transport
/// (`play`/`pause`/`resume`/`stop`/`reset`/`setTimestamp`/`setLoop`) steers both
/// the animation and the haptics. In ``HapticMode/realtime`` a display link
/// drives `currentProgress` and samples the pattern; in ``HapticMode/pattern`` a
/// pre-parsed pattern is fired aligned to the start.
public final class HapticLottieController: NSObject {
    private let animationView: LottieAnimationView
    private let sampled: SampledPattern?
    private let mode: HapticMode
    private let offsetMs: Double
    private let enabled: Bool

    private let useRealtime: Bool
    private let hasContinuous: Bool
    private let realtime: RealtimeComposer?
    private let pattern: PatternComposer?

    private var displayLink: CADisplayLink?
    private var timeMs: Double = 0
    private var lastT: Double = 0
    private var playing = false
    private var loop = false

    /// Creates a controller bound to `animationView`.
    public init(
        animationView: LottieAnimationView,
        pulsar: Pulsar,
        haptics: PatternData? = nil,
        mode: HapticMode = .realtime,
        offsetMs: Double = 0,
        enabled: Bool = true
    ) {
        self.animationView = animationView
        self.mode = mode
        self.offsetMs = offsetMs
        self.enabled = enabled
        let realtimeMode = mode == .realtime && haptics != nil
        self.useRealtime = realtimeMode
        let flattened = haptics.flatMap { sampledPattern(from: $0) }
        self.sampled = flattened
        self.hasContinuous = flattened?.hasContinuous ?? false
        self.realtime = realtimeMode ? pulsar.getRealtimeComposer() : nil
        if !realtimeMode, let h = haptics {
            let pc = pulsar.getPatternComposer()
            pc.parsePattern(hapticsData: h) // pre-parse / warm
            self.pattern = pc
        } else {
            self.pattern = nil
        }
        super.init()
    }

    deinit {
        displayLink?.invalidate()
    }

    private var durationMs: Double {
        if let d = animationView.animation?.duration, d > 0 {
            return d * 1000.0
        }
        return sampled.map { patternDurationMs($0) } ?? 0
    }

    // MARK: Transport

    /// Play from the start, animation and haptics together.
    public func play() {
        timeMs = 0
        lastT = 0
        animationView.currentProgress = 0
        if useRealtime {
            playing = true
            startDisplayLink()
        } else {
            animationView.play()
            fireHaptics()
        }
    }

    /// Pause both animation and haptics.
    public func pause() {
        playing = false
        stopDisplayLink()
        if !useRealtime { animationView.pause() }
        stopHaptics()
    }

    /// Resume from the current position.
    public func resume() {
        if useRealtime {
            playing = true
            startDisplayLink()
        } else {
            animationView.play()
        }
    }

    /// Stop and rewind to the start.
    public func stop() {
        playing = false
        stopDisplayLink()
        animationView.stop()
        animationView.currentProgress = 0
        timeMs = 0
        lastT = 0
        stopHaptics()
    }

    /// Rewind to the start (also stops haptics).
    public func reset() {
        stop()
    }

    /// Seek both animation and haptics to `ms` from the start.
    public func setTimestamp(_ ms: Double) {
        let dur = durationMs
        timeMs = min(max(ms, 0), dur)
        if dur > 0 { animationView.currentProgress = CGFloat(timeMs / dur) }
        lastT = timeMs
    }

    /// Loop the animation. `count` limits iterations (nil = forever); `reverse`
    /// plays a boomerang.
    public func setLoop(_ loop: Bool, count: Int? = nil, reverse: Bool = false) {
        self.loop = loop
        if loop {
            if reverse {
                animationView.loopMode = .autoReverse
            } else if let count {
                animationView.loopMode = .repeat(Float(count))
            } else {
                animationView.loopMode = .loop
            }
        } else {
            animationView.loopMode = .playOnce
        }
    }

    // MARK: Engine

    private func startDisplayLink() {
        guard displayLink == nil else { return }
        let link = CADisplayLink(target: self, selector: #selector(step(_:)))
        link.add(to: .main, forMode: .common)
        displayLink = link
    }

    private func stopDisplayLink() {
        displayLink?.invalidate()
        displayLink = nil
    }

    @objc private func step(_ link: CADisplayLink) {
        guard playing, useRealtime, let s = sampled else { return }
        let dur = durationMs
        let dt = (link.targetTimestamp - link.timestamp) * 1000.0
        var t = timeMs + dt
        var ended = false
        if dur > 0 && t >= dur {
            if loop {
                t = t.truncatingRemainder(dividingBy: dur)
                lastT = 0
            } else {
                t = dur
                playing = false
                ended = true
            }
        }
        timeMs = t
        if dur > 0 { animationView.currentProgress = CGFloat(t / dur) }

        if enabled {
            let ht = t + offsetMs
            if hasContinuous {
                realtime?.set(
                    amplitude: clamp01(sampleEnvelope(s.amplitude, ht)),
                    frequency: clamp01(sampleEnvelope(s.frequency, ht))
                )
            }
            var prev = lastT
            if t < prev { prev = 0 }
            for e in s.discrete where e.time > prev && e.time <= t {
                realtime?.playDiscrete(
                    amplitude: clamp01(e.amplitude),
                    frequency: clamp01(e.frequency)
                )
            }
        }
        lastT = t

        if ended {
            stopDisplayLink()
            if enabled && hasContinuous { realtime?.stop() }
        }
    }

    private func fireHaptics() {
        guard enabled, sampled != nil else { return }
        if useRealtime {
            lastT = 0
        } else {
            pattern?.play()
        }
    }

    private func stopHaptics() {
        if useRealtime {
            lastT = 0
            if enabled && hasContinuous { realtime?.stop() }
        } else {
            pattern?.stop()
        }
    }
}

/// Entry point for attaching haptics to an existing `LottieAnimationView`.
public enum PulsarLottie {
    /// Attach Pulsar haptics to `animationView` and return the controller that
    /// steers animation + haptics.
    public static func bind(
        _ animationView: LottieAnimationView,
        pulsar: Pulsar,
        haptics: PatternData,
        mode: HapticMode = .realtime,
        offsetMs: Double = 0,
        enabled: Bool = true
    ) -> HapticLottieController {
        HapticLottieController(
            animationView: animationView,
            pulsar: pulsar,
            haptics: haptics,
            mode: mode,
            offsetMs: offsetMs,
            enabled: enabled
        )
    }
}
