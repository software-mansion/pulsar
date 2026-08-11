import Testing
import Foundation
@testable import Pulsar

/// `RealtimeComposer` never actually starts on the simulator (no haptics hardware), so it should
/// stay inactive and swallow every call without crashing.
@MainActor
@Suite struct RealtimeComposerTests {

    @Test func staysInactiveWhenHardwareIsUnsupported() {
        let composer = Pulsar().getRealtimeComposer()
        #expect(composer.isActive == false)
        composer.set(amplitude: 0.5, frequency: 0.5)
        #expect(composer.isActive == false)
    }

    @Test func setToleratesOutOfRangeValues() {
        // set() clamps amplitude/frequency internally; out-of-range input must not crash.
        let composer = Pulsar().getRealtimeComposer()
        composer.set(amplitude: 2.0, frequency: -1.0)
        composer.set(amplitude: -5.0, frequency: 9.0)
        #expect(composer.isActive == false)
    }

    @Test func playDiscreteAndStopAreSafeNoOps() {
        let composer = Pulsar().getRealtimeComposer()
        composer.playDiscrete()
        composer.playDiscrete(amplitude: 1.0, frequency: 0.5)
        composer.stop()
        #expect(composer.isActive == false)
    }
}

/// `AudioSimulator` renders PCM buffers purely (no session needed for `parsePattern`). On the
/// simulator sound is force-enabled, so rendering yields a real buffer.
@Suite struct AudioSimulatorTests {

    private let pattern = PatternData(
        line: [
            [[0, 0.0], [100, 1.0], [200, 0.0]],
            [[0, 0.5], [200, 0.5]],
        ],
        bar: [[0, 1.0, 0.3]]
    )

    @Test func rendersANonEmptyBufferWhenSoundIsOn() {
        let simulator = AudioSimulator()
        let buffer = simulator.parsePattern(from: pattern)
        #expect(buffer != nil)
        #expect((buffer?.frameLength ?? 0) > 0)
    }

    @Test func rendersNilWhenSoundIsDisabled() {
        let simulator = AudioSimulator()
        simulator.enableSound(false)
        #expect(simulator.parsePattern(from: pattern) == nil)
    }

    @Test func rendersContinuousAudioWithASingleFrequencyPoint() {
        // Regression: a continuous pattern with exactly one frequency point used to be dropped
        // (count > 1 guard). It must now still render a non-empty buffer.
        let singleFreq = PatternData(
            line: [
                [[0, 0.5], [200, 0.5]],
                [[0, 0.5]],
            ],
            bar: []
        )
        let buffer = AudioSimulator().parsePattern(from: singleFreq)
        #expect(buffer != nil)
        #expect((buffer?.frameLength ?? 0) > 0)
    }
}

/// `PatternComposer.resolveSoundURL` maps a JS/native-supplied sound uri to a local
/// file URL for Core Haptics audio-resource registration. Pure string/file logic —
/// no engine or hardware needed.
@Suite struct SoundURLResolutionTests {

    @Test func passesThroughFileScheme() {
        let url = PatternComposer.resolveSoundURL("file:///tmp/pulsar/boom.wav")
        #expect(url?.absoluteString == "file:///tmp/pulsar/boom.wav")
    }

    @Test func resolvesAnExistingAbsolutePath() {
        let path = NSTemporaryDirectory() + "pulsar-\(UUID().uuidString).caf"
        FileManager.default.createFile(atPath: path, contents: Data([0x00, 0x01]))
        defer { try? FileManager.default.removeItem(atPath: path) }

        let url = PatternComposer.resolveSoundURL(path)
        #expect(url?.isFileURL == true)
        #expect(url?.path == path)
    }

    @Test func returnsNilForAnUnresolvableName() {
        // Not a file path and not a bundled resource -> nil (caller falls back to haptics-only).
        #expect(PatternComposer.resolveSoundURL("pulsar-missing-\(UUID().uuidString)") == nil)
    }
}

/// `PatternComposer.parsePatternWithSound` must degrade gracefully: on the simulator
/// there is no Core Haptics, and a missing/unregisterable sound file must leave a
/// plain haptics parse behind without crashing.
@MainActor
@Suite struct PatternComposerSoundTests {

    private let pattern = PatternData(
        line: [
            [[0, 1.0], [100, 0.0]],
            [[0, 0.5]],
        ],
        bar: [[0, 1.0, 0.3]]
    )

    @Test func parsePatternWithSoundIsSafeWhenFileMissing() {
        let composer = Pulsar().getPatternComposer()
        composer.parsePatternWithSound(hapticsData: pattern, uri: "pulsar-missing-sound.caf", volume: 0.8, offset: 20)
        composer.play()
        composer.playAudioOnly()
        composer.stop()
        composer.dispose()
    }

    @Test func parsePatternWithSoundAppliesDefaultVolumeAndOffset() {
        // Swift default params (volume = 1, offset = 0) must be callable with just a uri.
        let composer = Pulsar().getPatternComposer()
        composer.parsePatternWithSound(hapticsData: pattern, uri: "pulsar-missing-sound.caf")
        composer.play()
        composer.dispose()
    }
}
