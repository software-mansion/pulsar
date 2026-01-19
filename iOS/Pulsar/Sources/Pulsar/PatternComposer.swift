import Foundation
import CoreHaptics
import UIKit

public class PatternComposerImpl: NSObject {
  private var engine: CHHapticEngine?
  private var player: CHHapticAdvancedPatternPlayer?
  private var initialized: Bool = false
  private var discreteLine: DiscreteLine = DiscreteLine()
  private var continuousLine: ContinuousLine = ContinuousLine()
  private var intensityCurveLine: IntensityCurveLineModifier = IntensityCurveLineModifier()
  private var sharpnessCurveLine: SharpnessCurveLineModifier = SharpnessCurveLineModifier()
  
  @objc public override init() {
    super.init()
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      print("Error: Device doens't supports haptics")
      return
    }
    
    do {
      engine = try CHHapticEngine()
      try engine?.start()
      initialized = true

      NotificationCenter.default.addObserver(
        self,
        selector: #selector(appDidBecomeInactive),
        name: UIApplication.didEnterBackgroundNotification,
        object: nil
      )
    } catch {
        print("Error starting engine: \(error.localizedDescription)")
    }
  }
  
  deinit {
    if !initialized { return }
    do {
      try player?.stop(atTime: 0)
      try engine?.stop()
    } catch {
        print("Error cleaning up: \(error.localizedDescription)")
    }
  }
  
  @objc func appDidBecomeInactive() {
    initialized = false
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
  
  public func playPattern(hapticsData: PlaygroundData) {
    discreteLine.reset()
    intensityCurveLine.reset()
    sharpnessCurveLine.reset()
    for bar in hapticsData.bar {
      discreteLine.addEvent(timestamp: bar.x, intensity: bar.y1, sharpness: bar.y2)
    }
    
    for intensityPoint in hapticsData.line[0] {
      intensityCurveLine.addPoint(time: intensityPoint.x, value: intensityPoint.y)
    }
    for sharpnessPoint in hapticsData.line[1] {
      sharpnessCurveLine.addPoint(time: sharpnessPoint.x, value: sharpnessPoint.y)
    }
    
    self.play()
  }
  
  public func play() {
    if !initialized {
      do {
        try engine?.start()
        initialized = true
      } catch {
        print("Error starting engine: \(error.localizedDescription)")
      }
    }
    do {
      var continuousPlayer: CHHapticPatternPlayer?;
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
        continuousPlayer = try engine?.makePlayer(with: continuousPattern)
      }
      
      var discretePlayer: CHHapticPatternPlayer?;
      if (!discreteLine.getEvents.isEmpty) {
        let discretePattern = try CHHapticPattern(
          events: discreteLine.getEvents,
          parameters: []
        )
        discretePlayer = try engine?.makePlayer(with: discretePattern)
      }
      
      if (continuousPlayer != nil) {
        try continuousPlayer?.start(atTime: 0)
      }
      if (discretePlayer != nil) {
        try discretePlayer?.start(atTime: 0)
      }
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
