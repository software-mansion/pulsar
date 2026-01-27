import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class Player : NSObject {
  private var patternComposer: PatternComposer!
  
  public init(_ haptics: Pulsar, rawContinuesPattern: [[[Double]]] = [], rawDiscretePattern: [[Double]] = []) {
    super.init()
    patternComposer = haptics.getPatternComposer()
    
    let continuesPoints = convertContinuesPattern(rawContinuesPattern)
    let discretePoints = convertDiscretePattern(rawDiscretePattern)
    let patternData = PatternData(continuesPattern: continuesPoints, discretePattern: discretePoints)
    
    patternComposer.parsePattern(hapticsData: patternData)
  }
  
  @objc public func play() {
    patternComposer.play()
  }
  
  @objc public func stop() {
    patternComposer.stop()
  }
  
  private func convertContinuesPattern(_ linePattern: [[[Double]]]) -> ContinuesPattern {
    var amplitudePoints: [ValuePoint] = []
    var frequencyPoints: [ValuePoint] = []
    
    if linePattern.count > 0 {
      for point in linePattern[0] {
        if point.count >= 2 {
          amplitudePoints.append(ValuePoint(time: point[0], value: Float(point[1])))
        }
      }
    }
    
    if linePattern.count > 1 {
      for point in linePattern[1] {
        if point.count >= 2 {
          frequencyPoints.append(ValuePoint(time: point[0], value: Float(point[1])))
        }
      }
    }
    
    return ContinuesPattern(amplitude: amplitudePoints, frequency: frequencyPoints)
  }
  
  private func convertDiscretePattern(_ barPattern: [[Double]]) -> [ConfigPoint] {
    var points: [ConfigPoint] = []
    for bar in barPattern {
      if bar.count >= 3 {
        points.append(ConfigPoint(time: bar[0], amplitude: Float(bar[1]), frequency: Float(bar[2])))
      }
    }
    return points
  }
}
