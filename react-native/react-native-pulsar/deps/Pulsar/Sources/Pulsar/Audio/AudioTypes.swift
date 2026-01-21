import Foundation

@objc public class ChartPoint: NSObject, Codable {
  let x: Double
  let y: Float
  @objc public init(x: Double, y: Float) {
    self.x = x
    self.y = y
  }
}
 
@objc public class BarChartPoint: NSObject, Codable {
  let x: Double
  let y1: Float
  let y2: Float
  @objc public init(x: Double, y1: Float, y2: Float) {
    self.x = x
    self.y1 = y1
    self.y2 = y2
  }
}

@objc public class PatternData: NSObject, Codable {
  let line: [[ChartPoint]]
  let bar: [BarChartPoint]
  @objc public init(linePoints: [[ChartPoint]], barPoints: [BarChartPoint]) {
    self.line = linePoints
    self.bar = barPoints
  }
  public init(line: [[[Double]]], bar: [[Double]]) {
    self.line = line.map { $0.map { ChartPoint(x: Double($0[0]), y: Float($0[1])) } }
    self.bar = bar.map { BarChartPoint(x: Double($0[0]), y1: Float($0[1]), y2: Float($0[2])) }
  }
}

public enum WaveformType: String {
	case sine = "sine"
	case square = "square"
	case triangle = "triangle"
	case sawtooth = "sawtooth"
}

struct OscillatorConfig {
	let frequency: (initial: Double, final: Double, decayTime: Double)
	let envelope: (attack: Double, decay: Double, sustainLevel: Double, sustainDuration: Double, release: Double)
	let waveform: WaveformType
}

struct DiscreteAudioConfig {
	let oscillator: OscillatorConfig
	let timestamp: Double
	let volume: Float
}

struct ContinuousAudioConfig {
	let type: String
	let data: (amplitude: [ChartPoint], frequency: [ChartPoint])
}

struct AudioPatternConfig {
	let discreteData: [DiscreteAudioConfig]
	let continuousData: [ContinuousAudioConfig]
}
