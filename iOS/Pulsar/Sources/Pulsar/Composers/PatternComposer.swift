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
  private var hasSound = false

  public convenience init(engine: HapticEngineWrapper, audioSimulator: AudioSimulator) {
    self.init()
    self.engine = engine
    self.audioSimulator = audioSimulator
  }

  deinit {
    dispose()
  }

  @objc public func parsePattern(hapticsData: PatternData) {
    parse(hapticsData: hapticsData, audioEvent: nil)
  }

  @objc public func parsePatternWithSound(hapticsData: PatternData, uri: String, volume: Float = 1, offset: Double = 0) {
    let audioEvent = makeAudioEvent(uri: uri, volume: volume, offset: offset)
    parse(hapticsData: hapticsData, audioEvent: audioEvent)
  }

  private func parse(hapticsData: PatternData, audioEvent: CHHapticEvent?) {
    discreteLine.reset()
    continuousLine.reset()
    hasSound = audioEvent != nil

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

      let discreteEvents = discreteLine.getEvents + (audioEvent.map { [$0] } ?? [])
      if (!discreteEvents.isEmpty) {
        let pattern = try CHHapticPattern(
          events: discreteEvents,
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

  private func makeAudioEvent(uri: String, volume: Float, offset: Double) -> CHHapticEvent? {
    guard let url = PatternComposer.resolveSoundURL(uri) else {
      print("Pulsar: could not resolve sound uri: \(uri)")
      return nil
    }
    guard let resourceID = engine.registerAudioResource(url: url) else { return nil }
    return CHHapticEvent(
      audioResourceID: resourceID,
      parameters: [CHHapticEventParameter(parameterID: .audioVolume, value: volume)],
      relativeTime: max(0, offset) / 1000.0
    )
  }

  @objc public func play() {
    if !hasSound {
      audioSimulator.play(buffer: audioBuffer)
    }
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

  static func resolveSoundURL(_ uri: String) -> URL? {
    if uri.hasPrefix("file://") { return URL(string: uri) }
    if FileManager.default.fileExists(atPath: uri) { return URL(fileURLWithPath: uri) }
    let ns = uri as NSString
    let name = ns.deletingPathExtension
    let ext = ns.pathExtension.isEmpty ? "wav" : ns.pathExtension
    return Bundle.main.url(forResource: name, withExtension: ext)
  }

  @objc public func dispose() {
    stop()
    if let id = continuousPlayerId { engine.removePlayer(id: id) }
    if let id = discretePlayerId { engine.removePlayer(id: id) }
    continuousPlayerId = nil
    discretePlayerId = nil
    continuousPattern = nil
    discretePattern = nil
    audioBuffer = nil
    hasSound = false
  }
}
