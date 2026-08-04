import Testing
import Foundation
@testable import Pulsar

/// Top-level façade + engine-wrapper behaviour. Runs on the iOS Simulator, where
/// `CHHapticEngine.capabilitiesForHardware().supportsHaptics` is false — so haptics are
/// unsupported and the engine never actually starts. That lets us verify the state machine and
/// object graph without real hardware.
///
/// Marked `@MainActor` because the engine seeds its app-lifecycle cache from `UIApplication`, which
/// must be read on the main thread.
@MainActor
@Suite struct PulsarAPITests {

    @Test func hapticsAreUnsupportedAndUnplayableOnTheSimulator() {
        let pulsar = Pulsar()
        #expect(pulsar.isHapticsSupported() == false)
        #expect(pulsar.canPlayHaptics() == false)
    }

    @Test func hapticsAreEnabledByDefaultAndToggle() {
        let pulsar = Pulsar()
        #expect(pulsar.isHapticsEnabled == true)

        pulsar.enableHaptics(state: false)
        #expect(pulsar.isHapticsEnabled == false)

        pulsar.enableHaptics(state: true)
        #expect(pulsar.isHapticsEnabled == true)
    }

    @Test func getPresetsReturnsACachedInstance() {
        let pulsar = Pulsar()
        let a = pulsar.getPresets()
        let b = pulsar.getPresets()
        #expect(a === b)
    }

    @Test func getRealtimeComposerReturnsACachedInstance() {
        let pulsar = Pulsar()
        let a = pulsar.getRealtimeComposer()
        let b = pulsar.getRealtimeComposer()
        #expect(a === b)
    }

    @Test func getPatternComposerReturnsAFreshInstanceEachCall() {
        // Documents current behaviour: unlike presets/realtime, the pattern composer is not cached.
        let pulsar = Pulsar()
        let a = pulsar.getPatternComposer()
        let b = pulsar.getPatternComposer()
        #expect(a !== b)
    }

    @Test func lifecycleAndCacheCallsAreSafeWhenUnsupported() {
        let pulsar = Pulsar()
        // None of these should throw or crash on the simulator.
        pulsar.enableCache(state: true)
        pulsar.enableSound(state: false)
        pulsar.preloadPresets(presetNames: ["Heartbeat"])
        pulsar.clearCache()
        pulsar.stopHaptics()
        pulsar.shutDownEngine()
    }
}

/// Direct coverage of `HapticEngineWrapper`'s state and null-safety on the simulator.
@MainActor
@Suite struct HapticEngineWrapperTests {

    @Test func startsEnabledAndUnsupportedOnSimulator() {
        let engine = HapticEngineWrapper()
        #expect(engine.isHapticsEnabled == true)
        #expect(engine.isHapticsSupported() == false)
        #expect(engine.canPlayHaptics() == false)
    }

    @Test func enableHapticsTogglesState() {
        let engine = HapticEngineWrapper()
        engine.enableHaptics(false)
        #expect(engine.isHapticsEnabled == false)
        engine.enableHaptics(true)
        #expect(engine.isHapticsEnabled == true)
    }

    @Test func cannotBuildPlayersWhenHapticsAreUnsupported() {
        let engine = HapticEngineWrapper()
        #expect(engine.createPlayer(pattern: nil) == nil)
        #expect(engine.getRealtimePlayer() == nil)
    }

    @Test func stoppingOrRemovingAnUnknownPlayerIsANoOp() {
        let engine = HapticEngineWrapper()
        engine.stopPlayer(id: 999)
        engine.removePlayer(id: 999)
        engine.stopHaptics()
        engine.shutDownEngine()
    }
}
