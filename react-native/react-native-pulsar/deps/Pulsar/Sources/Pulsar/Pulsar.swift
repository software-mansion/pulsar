import CoreHaptics
import UIKit

@available(iOS 13.0, macOS 10.15, *)
@objc public class ChartPoint: NSObject, Codable {
  let x: Double
  let y: Float
  init(x: Double, y: Float) {
    self.x = x
    self.y = y
  }
}
 
@available(iOS 13.0, macOS 10.15, *)
@objc public class BarChartPoint: NSObject, Codable {
  let x: Double
  let y1: Float
  let y2: Float
  init(x: Double, y1: Float, y2: Float) {
    self.x = x
    self.y1 = y1
    self.y2 = y2
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class PlaygroundData: NSObject, Codable {
  let line: [[ChartPoint]]
  let bar: [BarChartPoint]
  init(linePoints: [[ChartPoint]], barPoints: [BarChartPoint]) {
    self.line = linePoints
    self.bar = barPoints
  }
  init(line: [[[Double]]], bar: [[Double]]) {
    self.line = line.map { $0.map { ChartPoint(x: Double($0[0]), y: Float($0[1])) } }
    self.bar = bar.map { BarChartPoint(x: Double($0[0]), y1: Float($0[1]), y2: Float($0[2])) }
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class Pulsar: NSObject {
  private var engine: CHHapticEngine?
  private var player: CHHapticAdvancedPatternPlayer?
  private var initialized: Bool = false
  private var events: [CHHapticEvent] = []
  private var descreteLine: DescreteLine = DescreteLine()
  private var continuousLine: ContinuousLine = ContinuousLine()
  private var intensityCurveLine: IntensityCurveLineModyfier = IntensityCurveLineModyfier()
  private var sharpnessCurveLine: SharpnessCurveLineModyfier = SharpnessCurveLineModyfier()
  private var presets: PresetsWrapper?
  
  @objc public override init() {
    super.init()
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
    
    do {
      engine = try CHHapticEngine()
      try engine?.start()
      initialized = true

      NotificationCenter.default.addObserver(
        self,
        selector: #selector(appDidBecomeInctive),
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
  
  @objc func appDidBecomeInctive() {
    initialized = false
  }
  
  @objc public func Presets() -> PresetsWrapper {
    if (presets == nil) {
      presets = PresetsWrapper(haptics: self)
    }
    return presets!
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
    descreteLine.reset()
    intensityCurveLine.reset()
    sharpnessCurveLine.reset()
    for bar in hapticsData.bar {
      descreteLine.addEvent(timestamp: bar.x, intensity: bar.y1, sharpness: bar.y2)
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
      var continousPlayer: CHHapticPatternPlayer?;
      if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
        let continousPattern = try CHHapticPattern(
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
        continousPlayer = try engine?.makePlayer(with: continousPattern)
      }
      
      var descretePlayer: CHHapticPatternPlayer?;
      if (!descreteLine.getEvents.isEmpty) {
        let descretePattern = try CHHapticPattern(
          events: descreteLine.getEvents,
          parameters: []
        )
        descretePlayer = try engine?.makePlayer(with: descretePattern)
      }
      
      if (continousPlayer != nil) {
        try continousPlayer?.start(atTime: 0)
      }
      if (descretePlayer != nil) {
        try descretePlayer?.start(atTime: 0)
      }
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }
  }
  
  public func getDescreteLine() -> DescreteLine {
    return descreteLine
  }
  
  public func getContinuousLine() -> ContinuousLine {
    return continuousLine
  }
}
