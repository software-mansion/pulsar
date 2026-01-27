import Foundation
import AVFoundation

public class AudioSimulator: NSObject {
	private let sampleRate: Double = 44100
	private var audioContext: AVAudioEngine = AVAudioEngine()
	private var offlineContext: AVAudioEngine?
	private var currentSource: AVAudioPlayerNode?
	private var playerNode: AVAudioPlayerNode = AVAudioPlayerNode()
	private var filterNode: AVAudioUnitEQ = AVAudioUnitEQ(numberOfBands: 1)
	private var isInitialized = false
	private var isEngineConfigured = false
  private var playSound: Bool = true
    
	public override init() {
		super.init()
  #if DEBUG
		configureAudioContext()
  #endif
	}

	public func parsePattern(from data: PatternData) -> AVAudioPCMBuffer? {
    #if NDEBUG
      return nil
    #endif
		
		let currentConfig = AudioPatternConfig(
      discreteData: generateDiscreteAudioConfig(from: data),
      continuousData: generateContinuousAudioConfig(from: data)
    )
		
		return renderPattern(config: currentConfig)
	}
 
  public func enableSound(_ value: Bool) {
    self.playSound = value
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
    do {
			band.filterType = .lowPass
      band.frequency = 700
      band.bandwidth = 1.0
      band.gain = 1
      band.bypass = false
      audioContext.attach(filterNode)
		} catch {
			print("Failed to configure filterNode: \(error)")
		}
        
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
    
	private func generateDiscreteAudioConfig(from data: PatternData) -> [DiscreteAudioConfig] {
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
		
		for discretePoint in data.discretePattern {
			let baseFrequency = normalizeFrequency(discretePoint.frequency)
			let targetFrequency = baseFrequency * 0.2
			let volume = alignVolume(discretePoint.amplitude, sources: sources)
			
			// Base oscillator
			discreteData.append(DiscreteAudioConfig(
				oscillator: OscillatorConfig(
					frequency: (initial: baseFrequency, final: targetFrequency, decayTime: 0.028),
					envelope: (attack: 0.002, decay: 0, sustainLevel: 1, sustainDuration: 0, release: 0.014),
					waveform: .sine
				),
				timestamp: Double(discretePoint.time) * 1000,
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
				timestamp: Double(discretePoint.time) * 1000,
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
				timestamp: Double(discretePoint.time) * 1000,
				volume: volume
			))
		}
		
		return discreteData
	}
	
	private func generateContinuousAudioConfig(from data: PatternData) -> [ContinuousAudioConfig] {
		let amplitudePoints: [ValuePoint] = data.continuesPattern.amplitude.count > 0 ? data.continuesPattern.amplitude : []
		let frequencyPoints: [ValuePoint] = data.continuesPattern.frequency.count > 1 ? data.continuesPattern.frequency : []
		
		func normalizeFrequency(_ x: Float) -> Double {
			return 80.0 + (230.0 - 80.0) * Double(x)
		}
		
		func applyModifiers(amplitude: [ValuePoint], frequency: [ValuePoint], ampMod: Double, freqMod: Double) -> (amplitude: [ValuePoint], frequency: [ValuePoint]) {
			let modifiedAmplitude = amplitude.map { point in
				ValuePoint(time: point.time, value: Float(Double(point.value) * ampMod))
			}
			let modifiedFrequency = frequency.map { point in
				ValuePoint(time: point.time, value: Float(normalizeFrequency(point.value) * freqMod))
			}
			return (modifiedAmplitude, modifiedFrequency)
		}
		
		let continuousConfigs: [ContinuousAudioConfig] = [
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
	
	private func renderPattern(config: AudioPatternConfig) -> AVAudioPCMBuffer? {
		let discreteData = config.discreteData
		let continuousData = config.continuousData
    
    func calculateTotalDuration() -> Double {
      var continuousDuration: Double = 0
      for wave in continuousData {
        if !wave.data.amplitude.isEmpty {
          continuousDuration = max(continuousDuration, wave.data.amplitude.last!.time)
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
			return nil
		}
		buffer.frameLength = frameCount
		let out = buffer.floatChannelData![0]
        
		// Initialize buffer to silence
		memset(out, 0, Int(frameCount) * MemoryLayout<Float>.size)
        
		var phasesContinuous: [Double] = Array(repeating: 0, count: continuousData.count)
		var phasesDiscrete: [Double] = Array(repeating: 0, count: discreteData.count)
		let twoPi = Double.pi * 2
        
		func valueForTime(_ points: [ValuePoint], _ t: Double) -> Float {
			if points.isEmpty { return 0 }
			if t <= points[0].time { return points[0].value }
			if t >= points.last!.time { return points.last!.value }
			for i in 1..<points.count {
				let p1 = points[i - 1]
				let p2 = points[i]
				if t <= p2.time {
					let t0 = p1.time, t1 = p2.time
					let v0 = p1.value, v1 = p2.value
					let ratio = Float((t - t0) / (t1 - t0))
					return v0 + (v1 - v0) * ratio
				}
			}
			return points.last!.value
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
        
		return buffer
	}
  
	public func play(buffer: AVAudioPCMBuffer?) {
    #if NDEBUG
      return
    #endif
    guard buffer != nil && playSound else { return }
		configureAudioContext()
        
		if playerNode.isPlaying { playerNode.stop() }
    
		playerNode.scheduleBuffer(buffer!, at: nil, options: []) { [weak self] in
			DispatchQueue.main.async {
				self?.stop()
			}
		}
		playerNode.play()
	}
    
	public func stop() {
    #if NDEBUG
      return
    #endif 
		playerNode.stop()
	}
    
	public var isPlaying: Bool {
		return playerNode.isPlaying
	}
}
