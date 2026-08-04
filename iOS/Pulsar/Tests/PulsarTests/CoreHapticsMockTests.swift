import Testing
import Foundation
import CoreHaptics
import UIKit
@testable import Pulsar

/// Verifies the engine wrapper *drives* CoreHaptics correctly, using the swizzled `CoreHapticsMock`
/// so the real (simulator-unavailable) engine is stood in for. Serialized + isolated because the
/// swizzle is process-global — run these via a separate `-only-testing` invocation.
@MainActor
@Suite(.serialized)
struct CoreHapticsMockTests {

    private func makePattern() -> CHHapticPattern? {
        let event = CHHapticEvent(
            eventType: .hapticTransient,
            parameters: [CHHapticEventParameter(parameterID: .hapticIntensity, value: 1)],
            relativeTime: 0
        )
        return try? CHHapticPattern(events: [event], parameters: [])
    }

    /// Builds a wrapper, runs its one-time lifecycle bootstrap, then forces the app-active state so
    /// `canPlayHaptics()` is deterministic regardless of the test host's UIApplication state.
    private func activeEngine(resetAfterWarmup: Bool = true) -> HapticEngineWrapper {
        let engine = HapticEngineWrapper()
        _ = engine.createPlayer(pattern: nil)          // trigger bootstrap/seed
        engine.updatePlaybackAvailability(for: .active) // force active
        if resetAfterWarmup { HapticMockRecorder.shared.reset() }
        return engine
    }

    @Test func mockedEngineConstructsStartsAndCreatesPlayers() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine(resetAfterWarmup: false)
        let id = engine.createPlayer(pattern: makePattern())

        #expect(id != nil)
        #expect(HapticMockRecorder.shared.enginesCreated >= 1)
        #expect(HapticMockRecorder.shared.startCalls >= 1)
    }

    @Test func createPlayerReturnsDistinctIdsAndBuildsAPlayerEachTime() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine()
        let a = engine.createPlayer(pattern: makePattern())
        let b = engine.createPlayer(pattern: makePattern())

        #expect(a != nil && b != nil)
        #expect(a != b)
        #expect(HapticMockRecorder.shared.playersCreated == 2)
    }

    @Test func registryEvictsTheOldestPlayerBeyondTheLimit() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine()
        // playerLimit is 20; the 21st creation must evict (and stop) the oldest.
        for _ in 0..<21 { _ = engine.createPlayer(pattern: makePattern()) }

        #expect(HapticMockRecorder.shared.playersCreated == 21)
        #expect(HapticMockRecorder.shared.playerStops >= 1)
    }

    @Test func stopHapticsStopsEveryRegisteredPlayer() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine()
        for _ in 0..<3 { _ = engine.createPlayer(pattern: makePattern()) }
        engine.stopHaptics()

        #expect(HapticMockRecorder.shared.playerStops >= 3)
    }

    @Test func realtimeComposerActivatesAndSendsClampedParameters() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine()
        let composer = RealtimeComposer(engine: engine)
        composer.set(amplitude: 2.0, frequency: -1.0) // out of range

        #expect(composer.isActive)
        #expect(HapticMockRecorder.shared.advancedPlayersCreated >= 1)
        #expect(HapticMockRecorder.shared.playerStarts >= 1)

        let last = HapticMockRecorder.shared.sentParameters.last
        #expect(last?.intensity == 1.0)   // clamped up-bound
        #expect(last?.sharpness == 0.0)   // clamped low-bound
    }

    @Test func stopDeactivatesTheRealtimeComposer() {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = activeEngine()
        let composer = RealtimeComposer(engine: engine)
        composer.set(amplitude: 0.5, frequency: 0.5)
        #expect(composer.isActive)

        composer.stop()
        #expect(!composer.isActive)
        #expect(HapticMockRecorder.shared.playerStops >= 1)
    }
}
