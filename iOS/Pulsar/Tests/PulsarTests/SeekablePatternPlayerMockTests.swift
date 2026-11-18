import Testing
import Foundation
import CoreHaptics
import QuartzCore
import UIKit
@testable import Pulsar

extension CoreHapticsMockTests {

  @MainActor
  @Suite(.serialized)
  struct SeekablePatternPlayerMockTests {

    private struct ExpectedFailure: Error {}

    private let pattern = PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: [ValuePoint(time: 0, value: 1), ValuePoint(time: 3000, value: 1)],
        frequency: [ValuePoint(time: 0, value: 0.5)]
      ),
      discretePattern: [DiscretePoint(time: 500, amplitude: 1, frequency: 0.5)]
    )

    private var recorder: HapticMockRecorder { .shared }

    private var livePlayers: [MockAdvancedPlayer] {
      recorder.advancedPlayers.filter { $0.state != .cancelled }
    }

    private var isPlaying: Bool {
      livePlayers.contains { $0.state == .playing }
    }

    private func withMock(_ body: () throws -> Void) rethrows {
      CoreHapticsMock.install()
      defer { CoreHapticsMock.uninstall() }
      try autoreleasepool { try body() }
    }

    private func preparedPlayer(isHapticsEnabled: Bool = true) -> SeekablePatternPlayer {
      let player = SeekablePatternPlayer(isHapticsEnabled: isHapticsEnabled)
      player.prepare(pattern)
      player.waitForPendingWork()
      return player
    }

    private func playStarted(_ player: SeekablePatternPlayer, fromMs: Double = 0, rate: Float = 1) {
      player.play(fromMs: fromMs, rate: rate, atHostTime: CACurrentMediaTime())
      player.waitForPendingWork()
      Thread.sleep(forTimeInterval: SeekablePatternPlayer.schedulingMargin * 3)
    }

    private func playLater(_ player: SeekablePatternPlayer, fromMs: Double = 0) {
      player.play(fromMs: fromMs, rate: 1, atHostTime: CACurrentMediaTime() + 5)
      player.waitForPendingWork()
    }

    private func stopEngine(of player: SeekablePatternPlayer, reason: CHHapticEngine.StoppedReason) {
      recorder.engines.last?.stoppedHandler(reason)
      player.waitForPendingWork()
    }

    @Test func prepareMakesPausedPlayersForTapsAndRumble() {
      withMock {
        let player = preparedPlayer()

        withExtendedLifetime(player) {
          #expect(recorder.engines.count == 1)
          #expect(recorder.advancedPlayers.count == 2)
          #expect(recorder.advancedPlayers.allSatisfy { $0.state == .paused })
        }
      }
    }

    @Test func playAtAFutureHostTimeSeeksBothPlayersToTheRequestedPosition() {
      withMock {
        let player = preparedPlayer()
        player.play(fromMs: 1200, rate: 2, atHostTime: CACurrentMediaTime() + 5)
        player.waitForPendingWork()

        #expect(livePlayers.count == 2)
        for mock in livePlayers {
          #expect(mock.state == .playing)
          #expect(mock.playbackRate == 2)
          #expect(mock.seekOffsets.last == 1.2)
          #expect(mock.resumeTimes.count == 1)
        }
      }
    }

    @Test func playFromAPastHostTimeCatchesUpWithTheClock() throws {
      try withMock {
        let player = preparedPlayer()
        let hostTime = CACurrentMediaTime() - 0.5
        player.play(fromMs: 1000, rate: 2, atHostTime: hostTime)
        player.waitForPendingWork()
        let latestStart = CACurrentMediaTime() + SeekablePatternPlayer.schedulingMargin

        let offset = try #require(livePlayers.first?.seekOffsets.last)
        #expect(offset >= 2.0)
        #expect(offset <= 1.0 + (latestStart - hostTime) * 2)
      }
    }

    @Test func negativePositionStartsFromTheBeginning() {
      withMock {
        let player = preparedPlayer()
        player.play(fromMs: -500, rate: 1, atHostTime: CACurrentMediaTime() + 5)
        player.waitForPendingWork()

        #expect(livePlayers.allSatisfy { $0.seekOffsets.last == 0 })
      }
    }

    @Test func pauseAndZeroRateStopOutput() {
      withMock {
        let player = preparedPlayer()
        playStarted(player)
        #expect(isPlaying)

        player.pause()
        player.waitForPendingWork()
        #expect(!isPlaying)

        playStarted(player)
        player.play(fromMs: 0, rate: 0, atHostTime: CACurrentMediaTime())
        player.waitForPendingWork()
        #expect(!isPlaying)
      }
    }

    @Test func pauseBeforeAScheduledStartDropsIt() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        player.pause()
        player.waitForPendingWork()

        #expect(!isPlaying)
        #expect(livePlayers.count == 2)
      }
    }

    @Test func playAgainWhilePlayingSeeksTheSamePlayers() {
      withMock {
        let player = preparedPlayer()
        playStarted(player)
        player.play(fromMs: 2000, rate: 1, atHostTime: CACurrentMediaTime() + 5)
        player.waitForPendingWork()

        #expect(recorder.advancedPlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.seekOffsets.last == 2.0 && $0.state == .playing })
      }
    }

    @Test func staleEngineStopDoesNotOrphanTheNewPlayers() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        let staleStoppedHandler = recorder.engines[0].stoppedHandler
        player.shutDown()
        playLater(player)

        staleStoppedHandler(.systemError)
        player.waitForPendingWork()
        player.pause()
        player.waitForPendingWork()

        #expect(livePlayers.count == 2)
        #expect(!isPlaying)
      }
    }

    @Test func suspendedEngineStaysStoppedUntilPlayedAgain() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        NotificationCenter.default.post(name: UIApplication.didEnterBackgroundNotification, object: nil)
        player.waitForPendingWork()
        stopEngine(of: player, reason: .applicationSuspended)
        NotificationCenter.default.post(name: UIApplication.didBecomeActiveNotification, object: nil)
        player.waitForPendingWork()

        #expect(livePlayers.isEmpty)

        playLater(player)
        #expect(isPlaying)
      }
    }

    @Test func lateSuspendedStopAfterPlayingAgainKeepsPlaying() {
      withMock {
        let player = preparedPlayer()
        playLater(player, fromMs: 1000)
        stopEngine(of: player, reason: .applicationSuspended)

        #expect(livePlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.state == .playing && $0.seekOffsets.last == 1.0 })
      }
    }

    @Test func resetWhilePlayingResumesOnNewPlayers() {
      withMock {
        let player = preparedPlayer()
        playLater(player, fromMs: 1000)
        recorder.engines.last?.resetHandler()
        player.waitForPendingWork()

        #expect(recorder.advancedPlayers.count == 4)
        #expect(livePlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.state == .playing && $0.seekOffsets.last == 1.0 })
      }
    }

    @Test func resetWhileIdlePreparesPausedPlayers() {
      withMock {
        let player = preparedPlayer()
        recorder.engines.last?.resetHandler()
        player.waitForPendingWork()

        #expect(recorder.advancedPlayers.count == 4)
        #expect(livePlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.state == .paused })
      }
    }

    @Test func staleEngineResetIsIgnored() {
      withMock {
        let player = preparedPlayer()
        let staleResetHandler = recorder.engines[0].resetHandler
        player.shutDown()
        playLater(player)
        staleResetHandler()
        player.waitForPendingWork()

        #expect(recorder.advancedPlayers.count == 4)
        #expect(livePlayers.count == 2)
      }
    }

    @Test func enteringBackgroundPauses() {
      withMock {
        let player = preparedPlayer()
        playStarted(player)
        NotificationCenter.default.post(name: UIApplication.didEnterBackgroundNotification, object: nil)
        player.waitForPendingWork()
        NotificationCenter.default.post(name: UIApplication.didBecomeActiveNotification, object: nil)
        player.waitForPendingWork()

        #expect(!isPlaying)
      }
    }

    @Test func systemErrorStopResumesOnNewPlayers() {
      withMock {
        let player = preparedPlayer()
        playLater(player, fromMs: 1000)
        stopEngine(of: player, reason: .systemError)

        #expect(recorder.advancedPlayers.count == 4)
        #expect(livePlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.state == .playing && $0.seekOffsets.last == 1.0 })
      }
    }

    @Test func completionOfAReplacedPlayerIsIgnored() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        let replaced = recorder.advancedPlayers
        playLater(player)
        replaced.forEach { $0.completionHandler?(nil) }
        player.waitForPendingWork()
        stopEngine(of: player, reason: .systemError)

        #expect(isPlaying)
      }
    }

    @Test func completionWithAnErrorKeepsTheTimeline() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        livePlayers.forEach { $0.completionHandler?(ExpectedFailure()) }
        player.waitForPendingWork()
        stopEngine(of: player, reason: .systemError)

        #expect(isPlaying)
      }
    }

    @Test func finishingThePatternForgetsTheTimeline() {
      withMock {
        let player = preparedPlayer()
        playLater(player)
        livePlayers.first?.completionHandler?(nil)
        player.waitForPendingWork()
        stopEngine(of: player, reason: .systemError)

        #expect(!isPlaying)
      }
    }

    @Test func disablingHapticsReleasesTheEngineAndEnablingResumes() {
      withMock {
        let player = preparedPlayer()
        playLater(player, fromMs: 1000)
        player.setHapticsEnabled(false)
        player.waitForPendingWork()
        #expect(livePlayers.isEmpty)

        player.setHapticsEnabled(true)
        player.waitForPendingWork()
        #expect(livePlayers.count == 2)
        #expect(livePlayers.allSatisfy { $0.state == .playing && $0.seekOffsets.last == 1.0 })
      }
    }

    @Test func registryHandsDisabledStateToNewPlayers() {
      withMock {
        let registry = SeekablePatternPlayerRegistry()
        registry.setHapticsEnabled(false)
        let player = registry.makePlayer()
        player.prepare(pattern)
        player.play(fromMs: 0, rate: 1, atHostTime: CACurrentMediaTime())
        player.waitForPendingWork()

        #expect(recorder.engines.isEmpty)
        #expect(recorder.advancedPlayers.isEmpty)
      }
    }

    @Test func registryPausesAndShutsDownItsPlayers() {
      withMock {
        let registry = SeekablePatternPlayerRegistry()
        let player = registry.makePlayer()
        player.prepare(pattern)
        playLater(player)
        registry.pauseAll()
        player.waitForPendingWork()
        #expect(!isPlaying)

        registry.shutDownAll()
        player.waitForPendingWork()
        #expect(livePlayers.isEmpty)

        playLater(player)
        #expect(isPlaying)
      }
    }

    @Test func playWithoutAPatternReportsNotPrepared() throws {
      try withMock {
        let player = SeekablePatternPlayer(isHapticsEnabled: true)
        let errors = ErrorLog()
        player.setErrorHandler { errors.append($0) }
        playLater(player)

        let error = try #require(errors.all.first as? SeekablePatternPlayerError)
        #expect(error == .notPrepared)
      }
    }

    @Test func disposeForgetsThePatternAndTheErrorHandler() {
      withMock {
        let player = preparedPlayer()
        let errors = ErrorLog()
        player.setErrorHandler { errors.append($0) }
        player.dispose()
        playLater(player)

        #expect(livePlayers.isEmpty)
        #expect(errors.all.isEmpty)
      }
    }
  }
}
