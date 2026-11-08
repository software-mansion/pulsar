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
    private func activeEngine(resetAfterWarmup: Bool = true, waitForStart: Bool = true) async -> HapticEngineWrapper {
        let engine = HapticEngineWrapper()
        _ = engine.createPlayer(pattern: nil)          // trigger bootstrap/seed
        engine.updatePlaybackAvailability(for: .active) // force active
        if waitForStart {
            _ = engine.createPlayer(pattern: nil)      // start the engine (asynchronously)
            await waitUntil { engine.isEngineRunning }
        }
        if resetAfterWarmup { HapticMockRecorder.shared.reset() }
        return engine
    }

    /// The engine starts off the main thread and reports back on main, so yield the main actor.
    private func waitUntil(timeout: TimeInterval = 2, _ condition: () -> Bool) async {
        let deadline = Date().addingTimeInterval(timeout)
        while !condition() && Date() < deadline {
            try? await Task.sleep(nanoseconds: 10_000_000)
        }
    }

    @Test func mockedEngineConstructsStartsAndCreatesPlayers() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine(resetAfterWarmup: false)
        let id = engine.createPlayer(pattern: makePattern())

        #expect(id != nil)
        #expect(HapticMockRecorder.shared.enginesCreated >= 1)
        #expect(HapticMockRecorder.shared.startCalls >= 1)
    }

    @Test func engineStartsOffTheMainThreadAndPlayersAreBuiltOnFirstPlay() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine(resetAfterWarmup: false, waitForStart: false)
        let pattern = makePattern()
        let created = engine.createPlayer(pattern: pattern)
        #expect(created != nil)
        #expect(!engine.isEngineRunning)
        #expect(HapticMockRecorder.shared.playersCreated == 0)
        guard let id = created else { return }

        await waitUntil { engine.isEngineRunning }
        #expect(engine.isEngineRunning)
        #expect(HapticMockRecorder.shared.engineCallsOnMainThread == 0)

        engine.playPlayer(id: id, pattern: pattern)
        #expect(HapticMockRecorder.shared.playersCreated == 1)
        #expect(HapticMockRecorder.shared.playerStarts == 1)
    }

    @Test func stoppingWhileTheEngineStartsDiscardsTheStart() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine(waitForStart: false)
        _ = engine.createPlayer(pattern: makePattern())
        engine.stopHaptics()

        await waitUntil(timeout: 0.3) { engine.isEngineRunning }
        #expect(!engine.isEngineRunning)
    }

    @Test func createPlayerReturnsDistinctIdsAndBuildsAPlayerEachTime() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        let a = engine.createPlayer(pattern: makePattern())
        let b = engine.createPlayer(pattern: makePattern())

        #expect(a != nil && b != nil)
        #expect(a != b)
        #expect(HapticMockRecorder.shared.playersCreated == 2)
    }

    @Test func registryEvictsTheOldestPlayerBeyondTheLimit() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        // playerLimit is 20; the 21st creation must evict (and stop) the oldest.
        for _ in 0..<21 { _ = engine.createPlayer(pattern: makePattern()) }

        #expect(HapticMockRecorder.shared.playersCreated == 21)
        #expect(HapticMockRecorder.shared.playerStops >= 1)
    }

    @Test func playingAfterAStopBuildsAFreshPlayer() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        let pattern = makePattern()
        let created = engine.createPlayer(pattern: pattern)
        #expect(created != nil)
        guard let id = created else { return }

        engine.playPlayer(id: id, pattern: pattern)
        engine.stopPlayer(id: id)
        engine.playPlayer(id: id, pattern: pattern)

        #expect(HapticMockRecorder.shared.playersCreated == 2)
        #expect(HapticMockRecorder.shared.playerStarts == 2)
    }

    @Test func stopHapticsStopsEveryRegisteredPlayer() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        for _ in 0..<3 { _ = engine.createPlayer(pattern: makePattern()) }
        engine.stopHaptics()

        #expect(HapticMockRecorder.shared.playerStops >= 3)
    }

    @Test func realtimeComposerActivatesAndSendsClampedParameters() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        let composer = RealtimeComposer(engine: engine)
        composer.set(amplitude: 2.0, frequency: -1.0) // out of range

        #expect(composer.isActive)
        #expect(HapticMockRecorder.shared.advancedPlayersCreated >= 1)
        #expect(HapticMockRecorder.shared.playerStarts >= 1)

        let last = HapticMockRecorder.shared.sentParameters.last
        #expect(last?.intensity == 1.0)   // clamped up-bound
        #expect(last?.sharpness == 0.0)   // clamped low-bound
    }

    @Test func reparsingAPatternComposerReleasesItsPreviousPlayers() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        let composer = PatternComposer(engine: engine, audioSimulator: AudioSimulator())
        let data = PatternData(line: [[[0, 1.0], [100, 0.0]], [[0, 0.5]]], bar: [[0, 1.0, 0.3]])

        composer.parsePattern(hapticsData: data)
        let perParse = HapticMockRecorder.shared.playersCreated
        #expect(perParse >= 1)

        composer.parsePattern(hapticsData: data)

        #expect(HapticMockRecorder.shared.playersCreated == perParse * 2)
        #expect(HapticMockRecorder.shared.playerStops >= perParse)
    }

    @Test func stopDeactivatesTheRealtimeComposer() async {
        CoreHapticsMock.install()
        defer { CoreHapticsMock.uninstall() }

        let engine = await activeEngine()
        let composer = RealtimeComposer(engine: engine)
        composer.set(amplitude: 0.5, frequency: 0.5)
        #expect(composer.isActive)

        composer.stop()
        #expect(!composer.isActive)
        #expect(HapticMockRecorder.shared.playerStops >= 1)
    }
}
