import Foundation
import AVFoundation

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

public class AudioSimulator: NSObject {
	private let sampleRate: Double = 44100
	private var audioContext: AVAudioEngine = AVAudioEngine()
	private var offlineContext: AVAudioEngine?
	private var renderedBuffer: AVAudioPCMBuffer?
	private var currentSource: AVAudioPlayerNode?
	private var playerNode: AVAudioPlayerNode = AVAudioPlayerNode()
	private var filterNode: AVAudioUnitEQ = AVAudioUnitEQ(numberOfBands: 1)
	private var isInitialized = false
	private var isEngineConfigured = false
	private var currentConfig: AudioPatternConfig?
    
	public override init() {
		super.init()
		configureAudioContext()
	}

	public func parsePattern(from data: PlaygroundData) {
		renderedBuffer = nil
		
		currentConfig = AudioPatternConfig(
      discreteData: generateDiscreteAudioConfig(from: data),
      continuousData: generateContinuousAudioConfig(from: data)
    )
		
		renderPattern(config: currentConfig!)
	}
    
	private func configureAudioContext() {
		guard !isEngineConfigured else { return }
		
    let session = AVAudioSession.sharedInstance()
		do {
			try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
			try session.setActive(true)
		} catch {
			print("AudioSession error: \(error)")
		}
        
		// Setup audio engine: Player -> Filter(lowpass) -> MainMixer
		audioContext.attach(playerNode)
        
		let band = filterNode.bands.first!
		band.filterType = .lowPass
		band.frequency = 700
		band.bandwidth = 1.0
		band.gain = 1
		band.bypass = false
		audioContext.attach(filterNode)
        
		let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
		audioContext.connect(playerNode, to: filterNode, format: format)
		audioContext.connect(filterNode, to: audioContext.mainMixerNode, format: format)
        
		do {
			try audioContext.start()
			isEngineConfigured = true
		} catch {
			print("Failed to start AVAudioEngine: \(error)")
		}
	}
	
	private func generateWaveform(_ waveform: WaveformType, phase: Double) -> Double {
		let normalizedPhase = phase.truncatingRemainder(dividingBy: Double.pi * 2) / (Double.pi * 2)
		
		switch waveform {
		case .sine:
			return sin(phase)
		case .square:
			return normalizedPhase < 0.5 ? 1.0 : -1.0
		case .triangle:
			if normalizedPhase < 0.25 {
				return normalizedPhase * 4.0
			} else if normalizedPhase < 0.75 {
				return 2.0 - (normalizedPhase * 4.0)
			} else {
				return (normalizedPhase - 1.0) * 4.0
			}
		case .sawtooth:
			return (normalizedPhase * 2.0) - 1.0
		}
	}
    
	private func generateDiscreteAudioConfig(from data: PlaygroundData) -> [DiscreteAudioConfig] {
		var discreteData: [DiscreteAudioConfig] = []
		
		let sources = 3
		let maxFrequency = 440.0
		let minFrequency = 60.0
		
		func normalizeFrequency(_ value: Float) -> Double {
			return minFrequency + (maxFrequency - minFrequency) * Double(value)
		}
		
		func alignVolume(_ x: Float, sources: Int) -> Float {
			return Float(0.1 / Double(sources) + 0.9 / Double(sources) * Double(x))
		}
		
		for bar in data.bar {
			let baseFrequency = normalizeFrequency(bar.y2)
			let targetFrequency = baseFrequency * 0.2
			let volume = alignVolume(bar.y1, sources: sources)
			
			// Base oscillator
			discreteData.append(DiscreteAudioConfig(
				oscillator: OscillatorConfig(
					frequency: (initial: baseFrequency, final: targetFrequency, decayTime: 0.028),
					envelope: (attack: 0.002, decay: 0, sustainLevel: 1, sustainDuration: 0, release: 0.014),
					waveform: .sine
				),
				timestamp: Double(bar.x) * 1000,
				volume: volume
			))
			
			// Harmonic 1 (1.5x)
			let harmonic1 = baseFrequency * 1.5
			let targetHarmonic1 = harmonic1 * 0.4
			discreteData.append(DiscreteAudioConfig(
				oscillator: OscillatorConfig(
					frequency: (initial: harmonic1, final: targetHarmonic1, decayTime: 0.031),
					envelope: (attack: 0, decay: 0, sustainLevel: 1, sustainDuration: 0, release: 0.015),
					waveform: .sine
				),
				timestamp: Double(bar.x) * 1000,
				volume: volume
			))
			
			// Harmonic 2 (0.3x)
			let harmonic2 = baseFrequency * 0.3
			let targetHarmonic2 = harmonic2 * 0.5
			discreteData.append(DiscreteAudioConfig(
				oscillator: OscillatorConfig(
					frequency: (initial: harmonic2, final: targetHarmonic2, decayTime: 0.039),
					envelope: (attack: 0.005, decay: 0, sustainLevel: 1, sustainDuration: 0, release: 0.018),
					waveform: .sine
				),
				timestamp: Double(bar.x) * 1000,
				volume: volume
			))
		}
		
		return discreteData
	}
	
	private func generateContinuousAudioConfig(from data: PlaygroundData) -> [ContinuousAudioConfig] {
		let amplitudePoints: [ChartPoint] = data.line.count > 0 ? data.line[0] : []
		let frequencyPoints: [ChartPoint] = data.line.count > 1 ? data.line[1] : []
		
		func normalizeFrequency(_ x: Float) -> Double {
			return 80.0 + (230.0 - 80.0) * Double(x)
		}
		
		func applyModifiers(amplitude: [ChartPoint], frequency: [ChartPoint], ampMod: Double, freqMod: Double) -> (amplitude: [ChartPoint], frequency: [ChartPoint]) {
			let modifiedAmplitude = amplitude.map { point in
				ChartPoint(x: point.x, y: Float(Double(point.y) * ampMod))
			}
			let modifiedFrequency = frequency.map { point in
				ChartPoint(x: point.x, y: Float(normalizeFrequency(point.y) * freqMod))
			}
			return (modifiedAmplitude, modifiedFrequency)
		}
		
		var continuousConfigs: [ContinuousAudioConfig] = [
      ContinuousAudioConfig(
        type: "sine",
        data: applyModifiers(amplitude: amplitudePoints, frequency: frequencyPoints, ampMod: 0.6, freqMod: 0.8),
      ),
      ContinuousAudioConfig(
        type: "triangle",
        data: applyModifiers(amplitude: amplitudePoints, frequency: frequencyPoints, ampMod: 0.2, freqMod: 0.4),
      ),
      ContinuousAudioConfig(
        type: "sine",
        data: applyModifiers(amplitude: amplitudePoints, frequency: frequencyPoints, ampMod: 0.5, freqMod: 1.0),
      )
    ]
		
		return continuousConfigs
	}
	
	private func renderPattern(config: AudioPatternConfig) {
		let discreteData = config.discreteData
		let continuousData = config.continuousData
    
    func calculateTotalDuration() -> Double {
      var continuousDuration: Double = 0
      for wave in continuousData {
        if !wave.data.amplitude.isEmpty {
          continuousDuration = max(continuousDuration, wave.data.amplitude.last!.x)
        }
      }
      continuousDuration += 0.01
      
      var discreteDuration: Double = 0
      for config in discreteData {
        let eventStartTime = config.timestamp / 1000.0
        let envelope = config.oscillator.envelope
        let oscillatorDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release
        let eventEndTime = eventStartTime + oscillatorDuration
        discreteDuration = max(discreteDuration, eventEndTime)
      }
      discreteDuration += 0.1
      
      return max(continuousDuration, discreteDuration)
    }
		
    let totalDuration = calculateTotalDuration()
		let frameCount = AVAudioFrameCount(Int(totalDuration * sampleRate) + 1)
		let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
		guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
			renderedBuffer = nil
			return
		}
		buffer.frameLength = frameCount
		let out = buffer.floatChannelData![0]
        
		// Initialize buffer to silence
		memset(out, 0, Int(frameCount) * MemoryLayout<Float>.size)
        
		var phasesContinuous: [Double] = Array(repeating: 0, count: continuousData.count)
		var phasesDiscrete: [Double] = Array(repeating: 0, count: discreteData.count)
		let twoPi = Double.pi * 2
        
		func valueForTime(_ points: [ChartPoint], _ t: Double) -> Float {
			if points.isEmpty { return 0 }
			if t <= points[0].x { return points[0].y }
			if t >= points.last!.x { return points.last!.y }
			for i in 1..<points.count {
				let p1 = points[i - 1]
				let p2 = points[i]
				if t <= p2.x {
					let t0 = p1.x, t1 = p2.x
					let v0 = p1.y, v1 = p2.y
					let ratio = Float((t - t0) / (t1 - t0))
					return v0 + (v1 - v0) * ratio
				}
			}
			return points.last!.y
		}
        
		func normalizeFrequency(_ y: Float) -> Double {
			return Double(y)
		}
		
		for i in 0..<Int(frameCount) {
			let t = Double(i) / sampleRate
			var sampleValue: Double = 0
            
			// Continuous waves
			for (waveIdx, waveConfig) in continuousData.enumerated() {
				if !waveConfig.data.amplitude.isEmpty && !waveConfig.data.frequency.isEmpty {
					let amp = Double(valueForTime(waveConfig.data.amplitude, t))
					let freq = normalizeFrequency(valueForTime(waveConfig.data.frequency, t))
                    
					phasesContinuous[waveIdx] += twoPi * freq / sampleRate
					if phasesContinuous[waveIdx] > twoPi { phasesContinuous[waveIdx] -= twoPi }
					
					let waveformType = WaveformType(rawValue: waveConfig.type) ?? .sine
					sampleValue += amp * generateWaveform(waveformType, phase: phasesContinuous[waveIdx])
				}
			}
            
			// Discrete waves (transients)
			for (oscIdx, oscConfig) in discreteData.enumerated() {
				let eventStartTime = oscConfig.timestamp / 1000.0
				let relativeTime = t - eventStartTime
				
				guard relativeTime >= 0 else { continue }
				
				let envelope = oscConfig.oscillator.envelope
				let totalDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release
				
				guard relativeTime < totalDuration else { continue }
				guard oscIdx < phasesDiscrete.count else { continue }
                
				// Apply envelope (ADSR)
				var envValue: Float = 0
				if relativeTime < envelope.attack {
					envValue = envelope.attack > 0 ? Float(relativeTime / envelope.attack) : 1.0
				} else if relativeTime < envelope.attack + envelope.decay {
					envValue = 1.0
				} else if relativeTime < envelope.attack + envelope.decay + envelope.sustainDuration {
					envValue = Float(envelope.sustainLevel)
				} else {
					let releaseTime = relativeTime - (envelope.attack + envelope.decay + envelope.sustainDuration)
					envValue = envelope.release > 0 ? Float(1.0 - (releaseTime / envelope.release)) : 0
				}
                
				// Frequency sweep
				let freqConfig = oscConfig.oscillator.frequency
				var freq = freqConfig.initial
				if freqConfig.decayTime > 0 {
					let sweepDuration = min(freqConfig.decayTime, totalDuration)
					if relativeTime < sweepDuration {
						let ratio = relativeTime / freqConfig.decayTime
						freq = freqConfig.initial * pow(freqConfig.final / freqConfig.initial, ratio)
					} else {
						freq = freqConfig.final
					}
				}
                
				phasesDiscrete[oscIdx] += twoPi * freq / sampleRate
				if phasesDiscrete[oscIdx] > twoPi { phasesDiscrete[oscIdx] -= twoPi }
                
				sampleValue += Double(oscConfig.volume * envValue) * generateWaveform(oscConfig.oscillator.waveform, phase: phasesDiscrete[oscIdx])
			}
            
			out[i] = Float(sampleValue)
		}
        
		renderedBuffer = buffer
	}
  
	public func play() {
		guard let buffer = renderedBuffer else { return }
		configureAudioContext()
        
		if playerNode.isPlaying { playerNode.stop() }
		playerNode.scheduleBuffer(buffer, at: nil, options: []) { [weak self] in
			DispatchQueue.main.async {
				self?.stop()
			}
		}
		playerNode.play()
	}
    
	public func stop() {
		playerNode.stop()
	}
    
	public var isPlaying: Bool {
		return playerNode.isPlaying
	}
}
