import Foundation
import CoreHaptics
import UIKit

public class PatternComposerImpl: NSObject {
  private var engine: HapticEngineWrapper!
  private var discreteLine = DiscreteLine()
  private var continuousLine = ContinuousLine()
  private var continuousPlayer: CHHapticPatternPlayer?
  private var discretePlayer: CHHapticPatternPlayer?
    
  public convenience init(engine: HapticEngineWrapper) {
    self.init()
    self.engine = engine
  }
  
  deinit {
    do {
      try continuousPlayer?.stop(atTime: 0)
      try discretePlayer?.stop(atTime: 0)
    } catch {}
  }
  
  public func parseJSON(_ jsonData: String) -> PlaygroundData {
    let decoder = JSONDecoder()
    do {
      let hapticData = try decoder.decode(PlaygroundData.self, from: jsonData.data(using: .utf8)!)
      return hapticData
    } catch {
      return PlaygroundData(line: [[], []], bar: [])
    }
  }
  
  public func parsePattern(hapticsData: PlaygroundData) {
    discreteLine.reset()
    continuousLine.reset()
    
    let intensityCurveLine = continuousLine.intensityCurveLine
    let sharpnessCurveLine = continuousLine.sharpnessCurveLine
    
    for bar in hapticsData.bar {
      discreteLine.addEvent(timestamp: bar.x, intensity: bar.y1, sharpness: bar.y2)
    }
    
    for intensityPoint in hapticsData.line[0] {
      intensityCurveLine.addPoint(time: intensityPoint.x, value: intensityPoint.y)
    }
    for sharpnessPoint in hapticsData.line[1] {
      sharpnessCurveLine.addPoint(time: sharpnessPoint.x, value: sharpnessPoint.y)
    }
    
    do {
      var continuousPattern: CHHapticPattern?;
      var discretePattern: CHHapticPattern?;
      if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
        continuousPattern = try CHHapticPattern(
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
      }
      
      if (!discreteLine.getEvents.isEmpty) {
        discretePattern = try CHHapticPattern(
          events: discreteLine.getEvents,
          parameters: []
        )
      }
      
      continuousPlayer = engine.getPlayer(pattern: continuousPattern)
      discretePlayer = engine.getPlayer(pattern: discretePattern)
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }
  }
  
  public func playPattern(hapticsData: PlaygroundData) {
    self.parsePattern(hapticsData: hapticsData)
    self.play()
  }
  
  public func play() {
    do {
      try continuousPlayer?.start(atTime: 0)
      try discretePlayer?.start(atTime: 0)
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }
  }
  
  public func getDiscreteLine() -> DiscreteLine {
    return discreteLine
  }
  
  public func getContinuousLine() -> ContinuousLine {
    return continuousLine
  }
}
