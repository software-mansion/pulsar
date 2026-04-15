import ComposeApp
import Foundation

enum PulsarBridgeBootstrap {
    private static var didRegister = false

    static func register() {
        guard !didRegister else { return }
        didRegister = true
        PulsarRuntimeKt.registerPulsarFactory(factory: IOSPulsarFactory())
    }
}

final class IOSPulsarFactory: NSObject, ComposeApp.PulsarPlatformFactory {
    func createPulsar() -> ComposeApp.PulsarPlatformHandle {
        IOSPulsarHandle()
    }
}

final class IOSPulsarHandle: NSObject, ComposeApp.PulsarPlatformHandle {
    private let nativePulsar = Pulsar()
    private lazy var presetsHandle = IOSPulsarPresetsHandle(nativePresets: nativePulsar.getPresets())
    private lazy var patternHandle = IOSPatternComposerHandle(nativeComposer: nativePulsar.getPatternComposer())
    private lazy var realtimeHandle = IOSRealtimeComposerHandle(nativeComposer: nativePulsar.getRealtimeComposer())

    func presets() -> ComposeApp.PulsarPresetsHandle {
        presetsHandle
    }

    func patternComposer() -> ComposeApp.PatternComposerHandle {
        patternHandle
    }

    func realtimeComposer() -> ComposeApp.RealtimeComposerHandle {
        realtimeHandle
    }

    func preloadPreset(name: String) {
        nativePulsar.preloadPresets(presetNames: [name])
    }

    func enableHaptics(state: Bool) {
        nativePulsar.enableHaptics(state: state)
    }

    func enableSound(state: Bool) {
        nativePulsar.enableSound(state: state)
    }

    func enableCache(state: Bool) {
        nativePulsar.enableCache(state: state)
    }

    func clearCache() {
        nativePulsar.clearCache()
    }

    func stopHaptics() {
        nativePulsar.stopHaptics()
    }

    func isHapticsSupported() -> Bool {
        nativePulsar.isHapticsSupported()
    }
}

final class IOSPulsarPresetsHandle: NSObject, ComposeApp.PulsarPresetsHandle {
    private let nativePresets: PresetsWrapper

    init(nativePresets: PresetsWrapper) {
        self.nativePresets = nativePresets
    }

    func play(name: String) -> Bool {
        guard let preset = nativePresets.getByName(name) else {
            return false
        }
        preset.play()
        return true
    }

    func systemImpactLight() {
        nativePresets.systemImpactLight()
    }

    func systemImpactMedium() {
        nativePresets.systemImpactMedium()
    }

    func systemImpactHeavy() {
        nativePresets.systemImpactHeavy()
    }

    func systemImpactSoft() {
        nativePresets.systemImpactSoft()
    }

    func systemImpactRigid() {
        nativePresets.systemImpactRigid()
    }

    func systemNotificationSuccess() {
        nativePresets.systemNotificationSuccess()
    }

    func systemNotificationWarning() {
        nativePresets.systemNotificationWarning()
    }

    func systemNotificationError() {
        nativePresets.systemNotificationError()
    }

    func systemSelection() {
        nativePresets.systemSelection()
    }
}

final class IOSPatternComposerHandle: NSObject, ComposeApp.PatternComposerHandle {
    private let nativeComposer: PatternComposer

    init(nativeComposer: PatternComposer) {
        self.nativeComposer = nativeComposer
    }

    func parsePattern(pattern: ComposeApp.PatternData) {
        nativeComposer.parsePattern(hapticsData: pattern.toNativePatternData())
    }

    func play() {
        nativeComposer.play()
    }

    func playAudioOnly() {
        nativeComposer.playAudioOnly()
    }

    func stop() {
        nativeComposer.stop()
    }
}

final class IOSRealtimeComposerHandle: NSObject, ComposeApp.RealtimeComposerHandle {
    private let nativeComposer: RealtimeComposer

    init(nativeComposer: RealtimeComposer) {
        self.nativeComposer = nativeComposer
    }

    func set(amplitude: Float, frequency: Float) {
        nativeComposer.set(amplitude: amplitude, frequency: frequency)
    }

    func playDiscrete(amplitude: Float, frequency: Float) {
        nativeComposer.playDiscrete(amplitude: amplitude, frequency: frequency)
    }

    func stop() {
        nativeComposer.stop()
    }

    func isActive() -> Bool {
        nativeComposer.isActive
    }
}

private extension ComposeApp.PatternData {
    func toNativePatternData() -> PatternData {
        let nativeContinuous = ContinuousPattern(
            amplitude: continuousPattern.amplitude.map {
                ValuePoint(time: Double($0.time), value: $0.value)
            },
            frequency: continuousPattern.frequency.map {
                ValuePoint(time: Double($0.time), value: $0.value)
            }
        )
        let nativeDiscrete = discretePattern.map {
            DiscretePoint(
                time: Double($0.time),
                amplitude: $0.amplitude,
                frequency: $0.frequency
            )
        }
        return PatternData(continuousPattern: nativeContinuous, discretePattern: nativeDiscrete)
    }
}
