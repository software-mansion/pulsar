import Foundation
import CoreHaptics
import UIKit
import AVFAudio

public class PatternComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var discreteLine = DiscreteLine()
  private var continuousLine = ContinuousLine()
  private var continuousPlayerId: Int?
  private var discretePlayerId: Int?
  private var continuousPattern: CHHapticPattern?
  private var discretePattern: CHHapticPattern?
  private var audioBuffer: AVAudioPCMBuffer?
  private var audioSimulator: AudioSimulator!

  public convenience init(engine: HapticEngineWrapper, audioSimulator: AudioSimulator) {
    self.init()
    self.engine = engine
    self.audioSimulator = audioSimulator
  }

  deinit {
    stop()
  }

  @objc public func parsePattern(hapticsData: PatternData) {
    discreteLine.reset()
    continuousLine.reset()

    let intensityCurveLine = continuousLine.intensityCurveLine
    let sharpnessCurveLine = continuousLine.sharpnessCurveLine

    for discretePoint in hapticsData.discretePattern {
      discreteLine.addEvent(timestamp: discretePoint.time, intensity: discretePoint.amplitude, sharpness: discretePoint.frequency)
    }

    for intensityPoint in hapticsData.continuousPattern.amplitude {
      intensityCurveLine.addPoint(time: intensityPoint.time, value: intensityPoint.value)
    }
    for sharpnessPoint in hapticsData.continuousPattern.frequency {
      sharpnessCurveLine.addPoint(time: sharpnessPoint.time, value: sharpnessPoint.value)
    }

    do {
      if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
        let pattern = try CHHapticPattern(
          events: [
            CHHapticEvent(
              eventType: .hapticContinuous,
              parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.0)
              ],
              relativeTime: 0,
              duration: max(intensityCurveLine.getDuration(), sharpnessCurveLine.getDuration())
            )
          ],
          parameterCurves: [
            intensityCurveLine.getCurve,
            sharpnessCurveLine.getCurve
          ]
        )
        continuousPattern = pattern
        continuousPlayerId = engine.createPlayer(pattern: pattern)
      }

      if (!discreteLine.getEvents.isEmpty) {
        let pattern = try CHHapticPattern(
          events: discreteLine.getEvents,
          parameters: []
        )
        discretePattern = pattern
        discretePlayerId = engine.createPlayer(pattern: pattern)
      }
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }

    audioBuffer = audioSimulator.parsePattern(from: hapticsData)
  }

  public func playPattern(hapticsData: PatternData) {
    self.parsePattern(hapticsData: hapticsData)
    self.play()
  }

  @objc public func play() {
    audioSimulator.play(buffer: audioBuffer)
    if let id = continuousPlayerId { engine.playPlayer(id: id, pattern: continuousPattern) }
    if let id = discretePlayerId { engine.playPlayer(id: id, pattern: discretePattern) }
  }

  @objc public func playAudioOnly() {
    audioSimulator.play(buffer: audioBuffer)
  }

  @objc public func stop() {
    audioSimulator.stop()
    if let id = continuousPlayerId { engine.stopPlayer(id: id) }
    if let id = discretePlayerId { engine.stopPlayer(id: id) }
  }
}
