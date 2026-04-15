import Foundation

/// Represents a point in a haptic pattern's continuous curve
/// - time: Time in milliseconds (ms)
/// - value: Normalized value between 0.0 and 1.0
@objc public class ValuePoint: NSObject, Codable {
  let time: Double
  let value: Float
  @objc public init(time: Double, value: Float) {
    self.time = time
    self.value = value
  }
}
 
/// Represents a discrete haptic event
/// - time: Time in milliseconds (ms)
/// - amplitude: Intensity of the haptic (0.0 - 1.0)
/// - frequency: Sharpness of the haptic (0.0 - 1.0)
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

@objc public class ContinuousPattern: NSObject, Codable {
  let amplitude: [ValuePoint]
  let frequency: [ValuePoint]
  @objc public init(amplitude: [ValuePoint], frequency: [ValuePoint]) {
    self.amplitude = amplitude
    self.frequency = frequency
  }
}

@objc public class PatternData: NSObject, Codable {
  let continuousPattern: ContinuousPattern
  let discretePattern: [DiscretePoint]
  @objc public init(continuousPattern: ContinuousPattern, discretePattern: [DiscretePoint]) {
    self.continuousPattern = continuousPattern
    self.discretePattern = discretePattern
  }
  public init(line: [[[Double]]], bar: [[Double]]) {
    self.continuousPattern = ContinuousPattern(
      amplitude: line[0].map { ValuePoint(time: Double($0[0]), value: Float($0[1])) },
      frequency: line[1].map { ValuePoint(time: Double($0[0]), value: Float($0[1])) }
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
	let data: (amplitude: [ValuePoint], frequency: [ValuePoint])
}

struct AudioPatternConfig {
	let discreteData: [DiscreteAudioConfig]
	let continuousData: [ContinuousAudioConfig]
}
