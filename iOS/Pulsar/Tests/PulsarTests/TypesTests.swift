import Testing
import Foundation
@testable import Pulsar

/// Construction, parsing and Codable behaviour of the public pattern data types. These are the
/// cross-platform wire types every preset and composer is built from.
@Suite struct TypesTests {

    @Test func valuePointStoresTimeAndValue() {
        let point = ValuePoint(time: 120, value: 0.35)
        #expect(point.time == 120)
        #expect(point.value == 0.35)
    }

    @Test func discretePointStoresAllChannels() {
        let point = DiscretePoint(time: 75, amplitude: 0.9, frequency: 0.4)
        #expect(point.time == 75)
        #expect(point.amplitude == 0.9)
        #expect(point.frequency == 0.4)
    }

    @Test func patternDataFromNestedArraysMapsEveryChannel() {
        let data = PatternData(
            line: [
                [[0, 0.0], [100, 1.0]],
                [[0, 0.5], [100, 0.5]],
            ],
            bar: [[10, 1.0, 0.3]]
        )

        #expect(data.continuousPattern.amplitude.map { $0.time } == [0, 100])
        #expect(data.continuousPattern.amplitude.map { $0.value } == [0.0, 1.0])
        #expect(data.continuousPattern.frequency.map { $0.value } == [0.5, 0.5])

        #expect(data.discretePattern.count == 1)
        let impulse = data.discretePattern[0]
        #expect(impulse.time == 10)
        #expect(impulse.amplitude == 1.0)
        #expect(impulse.frequency == 0.3)
    }

    @Test func patternDataFromArraysToleratesMalformedInput() {
        // Regression: the array initializer must not trap on missing channels / short points.
        let empty = PatternData(line: [], bar: [])
        #expect(empty.continuousPattern.amplitude.isEmpty)
        #expect(empty.continuousPattern.frequency.isEmpty)
        #expect(empty.discretePattern.isEmpty)

        let partial = PatternData(
            line: [[[0, 0.5], [10]]], // second amplitude point is too short → skipped; no frequency channel
            bar: [[0, 0.5]]           // discrete point missing frequency → skipped
        )
        #expect(partial.continuousPattern.amplitude.count == 1)
        #expect(partial.continuousPattern.frequency.isEmpty)
        #expect(partial.discretePattern.isEmpty)
    }

    @Test func patternDataIsCodableRoundTrippable() throws {
        let original = PatternData(
            continuousPattern: ContinuousPattern(
                amplitude: [ValuePoint(time: 0, value: 0.2), ValuePoint(time: 100, value: 0.8)],
                frequency: [ValuePoint(time: 0, value: 0.5)]
            ),
            discretePattern: [DiscretePoint(time: 50, amplitude: 1.0, frequency: 0.3)]
        )

        let encoded = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(PatternData.self, from: encoded)

        #expect(decoded.continuousPattern.amplitude.count == 2)
        #expect(decoded.continuousPattern.amplitude[1].value == 0.8)
        #expect(decoded.continuousPattern.frequency.count == 1)
        #expect(decoded.discretePattern.count == 1)
        #expect(decoded.discretePattern[0].amplitude == 1.0)
        #expect(decoded.discretePattern[0].frequency == 0.3)
    }

    @Test func waveformTypeRawValuesAreStable() {
        #expect(WaveformType.sine.rawValue == "sine")
        #expect(WaveformType.square.rawValue == "square")
        #expect(WaveformType.triangle.rawValue == "triangle")
        #expect(WaveformType.sawtooth.rawValue == "sawtooth")
        #expect(WaveformType(rawValue: "triangle") == .triangle)
        #expect(WaveformType(rawValue: "nope") == nil)
    }
}
