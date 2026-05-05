import Foundation
import AVFoundation

public class AudioSimulator: NSObject {
	private let sampleRate: Double = 22050
	private var audioContext: AVAudioEngine = AVAudioEngine()
	private var offlineContext: AVAudioEngine?
	private var currentSource: AVAudioPlayerNode?
	private var playerNode: AVAudioPlayerNode = AVAudioPlayerNode()
	private var filterNode: AVAudioUnitEQ = AVAudioUnitEQ(numberOfBands: 1)
	private var isInitialized = false
	private var isEngineConfigured = false
 #if DEBUG
  private var playSound: Bool = true
#else
  private var playSound: Bool = false
#endif

	public override init() {
		super.init()
    if (playSound) {
      configureAudioContext()
    }
	}

	public func parsePattern(from data: PatternData) -> AVAudioPCMBuffer? {
    if (!playSound) {
      return nil
    }

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
				timestamp: Double(discretePoint.time),
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
				timestamp: Double(discretePoint.time),
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
				timestamp: Double(discretePoint.time),
				volume: volume
			))
		}

		return discreteData
	}

	private func generateContinuousAudioConfig(from data: PatternData) -> [ContinuousAudioConfig] {
		let amplitudePoints: [ValuePoint] = data.continuousPattern.amplitude.count > 0 ? data.continuousPattern.amplitude : []
		let frequencyPoints: [ValuePoint] = data.continuousPattern.frequency.count > 1 ? data.continuousPattern.frequency : []

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
          continuousDuration = max(continuousDuration, wave.data.amplitude.last!.time / 1000.0)
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

		let sampleRateF = Float(sampleRate)
		let twoPi = Float.pi * 2
		var phasesContinuous: [Float] = Array(repeating: 0, count: continuousData.count)
		var phasesDiscrete: [Float] = Array(repeating: 0, count: discreteData.count)

		let continuousWaveforms: [WaveformType] = continuousData.map { WaveformType(rawValue: $0.type) ?? .sine }

		struct DiscreteOscillatorCache {
			let startSample: Int
			let endSample: Int
			let freqInitial: Float
			let freqFinal: Float
			let freqDecaySamples: Int
			let logFreqRatio: Float
			let envAttackSamples: Int
			let envDecayEndSamples: Int
			let envSustainEndSamples: Int
			let envTotalSamples: Int
			let sustainLevel: Float
			let volume: Float
			let waveform: WaveformType
		}
		let discretePrecomp: [DiscreteOscillatorCache] = discreteData.map { osc in
			let env = osc.oscillator.envelope
			let totalEnvDur = env.attack + env.decay + env.sustainDuration + env.release
			let startSample = Int(osc.timestamp / 1000.0 * sampleRate)
			let endSample = startSample + Int(ceil(totalEnvDur * sampleRate))
			let freqCfg = osc.oscillator.frequency
			let sweepDur = freqCfg.decayTime > 0 ? min(freqCfg.decayTime, totalEnvDur) : 0
			let logRatio: Float = (freqCfg.decayTime > 0 && freqCfg.initial > 0)
				? log(Float(freqCfg.final / freqCfg.initial))
				: 0
			return DiscreteOscillatorCache(
				startSample: startSample,
				endSample: endSample,
				freqInitial: Float(freqCfg.initial),
				freqFinal: Float(freqCfg.final),
				freqDecaySamples: Int(sweepDur * sampleRate),
				logFreqRatio: logRatio,
				envAttackSamples: Int(env.attack * sampleRate),
				envDecayEndSamples: Int((env.attack + env.decay) * sampleRate),
				envSustainEndSamples: Int((env.attack + env.decay + env.sustainDuration) * sampleRate),
				envTotalSamples: Int(totalEnvDur * sampleRate),
				sustainLevel: Float(env.sustainLevel),
				volume: osc.volume,
				waveform: osc.oscillator.waveform
			)
		}

		var continuousAmpCursors: [Int] = Array(repeating: 1, count: continuousData.count)
		var continuousFreqCursors: [Int] = Array(repeating: 1, count: continuousData.count)

		@inline(__always)
		func valueForTime(_ points: [ValuePoint], _ tMs: Float, cursor: inout Int) -> Float {
			if points.isEmpty { return 0 }
			if tMs <= Float(points[0].time) { return points[0].value }
			if tMs >= Float(points.last!.time) { return points.last!.value }
			while cursor < points.count && Float(points[cursor].time) < tMs { cursor += 1 }
			let p1 = points[cursor - 1], p2 = points[cursor]
			let ratio = (tMs - Float(p1.time)) / (Float(p2.time) - Float(p1.time))
			return p1.value + (p2.value - p1.value) * ratio
		}

		for i in 0..<Int(frameCount) {
			let tMs = Float(i) / sampleRateF * 1000.0
			var sampleValue: Float = 0

			for waveIdx in 0..<continuousData.count {
				let waveConfig = continuousData[waveIdx]
				if !waveConfig.data.amplitude.isEmpty && !waveConfig.data.frequency.isEmpty {
					if tMs < Float(waveConfig.data.amplitude[0].time) { continue }
					let amp = valueForTime(waveConfig.data.amplitude, tMs, cursor: &continuousAmpCursors[waveIdx])
					let freq = valueForTime(waveConfig.data.frequency, tMs, cursor: &continuousFreqCursors[waveIdx])

					phasesContinuous[waveIdx] += twoPi * freq / sampleRateF
					if phasesContinuous[waveIdx] > twoPi { phasesContinuous[waveIdx] -= twoPi }

					sampleValue += amp * Float(generateWaveform(continuousWaveforms[waveIdx], phase: Double(phasesContinuous[waveIdx])))
				}
			}

			for oscIdx in 0..<discretePrecomp.count {
				let pre = discretePrecomp[oscIdx]
				guard i >= pre.startSample && i < pre.endSample else { continue }

				let relSample = i - pre.startSample

				let envValue: Float
				if relSample < pre.envAttackSamples {
					envValue = pre.envAttackSamples > 0 ? Float(relSample) / Float(pre.envAttackSamples) : 1.0
				} else if relSample < pre.envDecayEndSamples {
					envValue = 1.0
				} else if relSample < pre.envSustainEndSamples {
					envValue = pre.sustainLevel
				} else {
					let relRelease = relSample - pre.envSustainEndSamples
					let releaseSamples = pre.envTotalSamples - pre.envSustainEndSamples
					envValue = releaseSamples > 0 ? 1.0 - Float(relRelease) / Float(releaseSamples) : 0
				}

				let freq: Float
				if pre.freqDecaySamples > 0 && relSample < pre.freqDecaySamples {
					let ratio = Float(relSample) / Float(pre.freqDecaySamples)
					freq = pre.freqInitial * exp(pre.logFreqRatio * ratio)
				} else {
					freq = pre.freqFinal
				}

				phasesDiscrete[oscIdx] += twoPi * freq / sampleRateF
				if phasesDiscrete[oscIdx] > twoPi { phasesDiscrete[oscIdx] -= twoPi }

				sampleValue += pre.volume * envValue * Float(generateWaveform(pre.waveform, phase: Double(phasesDiscrete[oscIdx])))
			}

			out[i] = sampleValue
		}

		return buffer
	}

	public func play(buffer: AVAudioPCMBuffer?) {
    guard let buffer = buffer, playSound else { return }
		configureAudioContext()

		if playerNode.isPlaying { playerNode.stop() }
		if !audioContext.isRunning {
			do {
				try AVAudioSession.sharedInstance().setActive(true)
				try audioContext.start()
			} catch {
				print("Failed to start audio engine: \(error)")
				return
			}
		}

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
