import Foundation
import CoreHaptics
import UIKit
import AVFAudio

public class PatternComposerImpl: NSObject {
  private var engine: HapticEngineWrapper!
  private var discreteLine = DiscreteLine()
  private var continuousLine = ContinuousLine()
  private var continuousPlayer: CHHapticPatternPlayer?
  private var discretePlayer: CHHapticPatternPlayer?
  private var audioBuffer: AVAudioPCMBuffer?
  private var audioSimulator: AudioSimulator!
    
  public convenience init(engine: HapticEngineWrapper, audioSimulator: AudioSimulator) {
    self.init()
    self.engine = engine
    self.audioSimulator = audioSimulator
  }
  
  deinit {
    do {
      try continuousPlayer?.stop(atTime: 0)
      try discretePlayer?.stop(atTime: 0)
    } catch {}
  }
  
  public func parseJSON(_ jsonData: String) -> PatternData? {
    let decoder = JSONDecoder()
    do {
      let hapticData = try decoder.decode(PatternData.self, from: jsonData.data(using: .utf8)!)
      return hapticData
    } catch {
      return nil
    }
  }
  
  @objc public func parsePattern(hapticsData: PatternData) {
    discreteLine.reset()
    continuousLine.reset()
    
    let intensityCurveLine = continuousLine.intensityCurveLine
    let sharpnessCurveLine = continuousLine.sharpnessCurveLine
    
    for discretePoint in hapticsData.discretePattern {
      discreteLine.addEvent(timestamp: discretePoint.time, intensity: discretePoint.amplitude, sharpness: discretePoint.frequency)
    }
    
    for intensityPoint in hapticsData.continuesPattern.amplitude {
      intensityCurveLine.addPoint(time: intensityPoint.time, value: intensityPoint.value)
    }
    for sharpnessPoint in hapticsData.continuesPattern.frequency {
      sharpnessCurveLine.addPoint(time: sharpnessPoint.time, value: sharpnessPoint.value)
    }
    
    do {
      if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
        let continuousPattern = try CHHapticPattern(
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
        continuousPlayer = engine.getPlayer(pattern: continuousPattern)
      }
      
      if (!discreteLine.getEvents.isEmpty) {
        let discretePattern = try CHHapticPattern(
          events: discreteLine.getEvents,
          parameters: []
        )
        discretePlayer = engine.getPlayer(pattern: discretePattern)
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
    do {
      audioSimulator.play(buffer: audioBuffer)
      try continuousPlayer?.start(atTime: 0)
      try discretePlayer?.start(atTime: 0)
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }
  }
  
  public func stop() {
    do {
      audioSimulator.stop()
      try continuousPlayer?.stop(atTime: 0)
      try discretePlayer?.stop(atTime: 0)
    } catch {
      print("Error stopping pattern: \(error.localizedDescription)")
    }
  }
  
  public func getDiscreteLine() -> DiscreteLine {
    return discreteLine
  }
  
  public func getContinuousLine() -> ContinuousLine {
    return continuousLine
  }
}
