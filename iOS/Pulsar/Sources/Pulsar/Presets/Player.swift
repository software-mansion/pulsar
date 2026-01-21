import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class Player : NSObject {
  private var patternComposer: PatternComposerImpl!
  
  public init(_ haptics: Pulsar, rawContinuesPattern: [[[Double]]] = [], rawDiscretePattern: [[Double]] = []) {
    super.init()
    patternComposer = haptics.PatternComposer()
    
    let continuesPoints = convertContinuesPattern(rawContinuesPattern)
    let discretePoints = convertDiscretePattern(rawDiscretePattern)
    let patternData = PatternData(linePoints: continuesPoints, barPoints: discretePoints)
    
    patternComposer.parsePattern(hapticsData: patternData)
  }
  
  @objc public func play() {
    patternComposer.play()
  }
  
  @objc public func stop() {
    patternComposer.stop()
  }
  
  private func convertContinuesPattern(_ linePattern: [[[Double]]]) -> [[ChartPoint]] {
    var lines: [[ChartPoint]] = []
    for line in linePattern {
      var points: [ChartPoint] = []
      for point in line {
        if point.count >= 2 {
          points.append(ChartPoint(x: point[0], y: Float(point[1])))
        }
      }
      lines.append(points)
    }
    return lines
  }
  
  private func convertDiscretePattern(_ barPattern: [[Double]]) -> [BarChartPoint] {
    var points: [BarChartPoint] = []
    for bar in barPattern {
      if bar.count >= 3 {
        points.append(BarChartPoint(x: bar[0], y1: Float(bar[1]), y2: Float(bar[2])))
      }
    }
    return points
  }
}
