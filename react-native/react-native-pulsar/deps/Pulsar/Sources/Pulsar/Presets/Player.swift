import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class Player : NSObject {
  private var audioSimulator: AudioSimulator = AudioSimulator()
  private var haptics: Pulsar!
  private var playSound: Bool = true
  private var patternComposer: PatternComposerImpl!
  
  public init(_ haptics: Pulsar, linePattern: [[[Double]]] = [], barPattern: [[Double]] = []) {
    super.init()
    self.haptics = haptics
    patternComposer = haptics.PatternComposer()
    
    let linePoints = convertLinePattern(linePattern)
    let barPoints = convertBarPattern(barPattern)
    let playgroundData = PlaygroundData(linePoints: linePoints, barPoints: barPoints)
    
    patternComposer.parsePattern(hapticsData: playgroundData)
    audioSimulator.parsePattern(from: playgroundData)
  }
  
  @objc public func play() {
    if playSound {
      audioSimulator.play()
    }
    patternComposer.play()
  }
  
  @objc public func stop() {
    audioSimulator.stop()
  }
  
  @objc public func enableSound(state: Bool) {
    self.playSound = state
  }
  
  private func convertLinePattern(_ linePattern: [[[Double]]]) -> [[ChartPoint]] {
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
  
  private func convertBarPattern(_ barPattern: [[Double]]) -> [BarChartPoint] {
    var points: [BarChartPoint] = []
    for bar in barPattern {
      if bar.count >= 3 {
        points.append(BarChartPoint(x: bar[0], y1: Float(bar[1]), y2: Float(bar[2])))
      }
    }
    return points
  }
}
