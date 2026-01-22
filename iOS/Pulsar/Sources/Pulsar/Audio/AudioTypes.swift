import Foundation

@objc public class PatternPoint: NSObject, Codable {
  let time: Double
  let value: Float
  @objc public init(time: Double, value: Float) {
    self.time = time
    self.value = value
  }
}
 
@objc public class DiscretePoint: NSObject, Codable {
  let time: Double
  let amplitude: Float
  let frequency: Float
  @objc public init(time: Double, amplitude: Float, frequency: Float) {
    self.time = time
    self.amplitude = amplitude
    self.frequency = frequency
  }
}

@objc public class ContinuesPattern: NSObject, Codable {
  let amplitude: [PatternPoint]
  let frequency: [PatternPoint]
  @objc public init(amplitude: [PatternPoint], frequency: [PatternPoint]) {
    self.amplitude = amplitude
    self.frequency = frequency
  }
}

@objc public class PatternData: NSObject, Codable {
  let continuesPattern: ContinuesPattern
  let discretePattern: [DiscretePoint]
  @objc public init(continuesPattern: ContinuesPattern, discretePattern: [DiscretePoint]) {
    self.continuesPattern = continuesPattern
    self.discretePattern = discretePattern
  }
  public init(line: [[[Double]]], bar: [[Double]]) {
    self.continuesPattern = ContinuesPattern(
      amplitude: line[0].map { PatternPoint(time: Double($0[0]), value: Float($0[1])) },
      frequency: line[1].map { PatternPoint(time: Double($0[0]), value: Float($0[1])) }
    )
    self.discretePattern = bar.map { DiscretePoint(time: Double($0[0]), amplitude: Float($0[1]), frequency: Float($0[2])) }
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
	let data: (amplitude: [PatternPoint], frequency: [PatternPoint])
}

struct AudioPatternConfig {
	let discreteData: [DiscreteAudioConfig]
	let continuousData: [ContinuousAudioConfig]
}
