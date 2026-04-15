import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class Player : NSObject {
  private var patternComposer: PatternComposer!
  private var audioOnly: Bool = false
  private weak var pulsar: Pulsar?

  public var isEnabled: Bool {
    return pulsar?.isHapticsEnabled ?? true
  }

  public init(_ haptics: Pulsar, audioOnly: Bool = false, rawContinuousPattern: [[[Double]]] = [], rawDiscretePattern: [[Double]] = []) {
    super.init()
    self.pulsar = haptics
    self.audioOnly = audioOnly
    patternComposer = haptics.getPatternComposer()

    let continuousPoints = convertContinuousPattern(rawContinuousPattern)
    let discretePoints = convertDiscretePattern(rawDiscretePattern)
    let patternData = PatternData(continuousPattern: continuousPoints, discretePattern: discretePoints)

    patternComposer.parsePattern(hapticsData: patternData)
  }

  @objc public func play() {
    guard isEnabled else { return }
    if audioOnly {
      patternComposer.playAudioOnly()
    } else {
      patternComposer.play()
    }
  }
  
  @objc public func stop() {
    patternComposer.stop()
  }
  
  private func convertContinuousPattern(_ linePattern: [[[Double]]]) -> ContinuousPattern {
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
    
    return ContinuousPattern(amplitude: amplitudePoints, frequency: frequencyPoints)
  }
  
  private func convertDiscretePattern(_ barPattern: [[Double]]) -> [DiscretePoint] {
    var points: [DiscretePoint] = []
    for bar in barPattern {
      if bar.count >= 3 {
        points.append(DiscretePoint(time: bar[0], amplitude: Float(bar[1]), frequency: Float(bar[2])))
      }
    }
    return points
  }
}
