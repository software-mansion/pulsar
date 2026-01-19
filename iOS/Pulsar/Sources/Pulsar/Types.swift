import Foundation

@objc public class ChartPoint: NSObject, Codable {
  let x: Double
  let y: Float
  init(x: Double, y: Float) {
    self.x = x
    self.y = y
  }
}
 
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
