import XCTest
import Pulsar
@testable import PulsarLottie

final class SamplerTests: XCTestCase {
    private let env = [
        EnvPoint(time: 0, value: 0),
        EnvPoint(time: 400, value: 1),
        EnvPoint(time: 800, value: 0),
    ]

    func testClampsOutsideRange() {
        XCTAssertEqual(sampleEnvelope(env, -50), 0, accuracy: 1e-6)
        XCTAssertEqual(sampleEnvelope(env, 900), 0, accuracy: 1e-6)
    }

    func testExactKnot() {
        XCTAssertEqual(sampleEnvelope(env, 400), 1, accuracy: 1e-6)
    }

    func testInterpolatesLinearly() {
        XCTAssertEqual(sampleEnvelope(env, 200), 0.5, accuracy: 1e-6)
        XCTAssertEqual(sampleEnvelope(env, 600), 0.5, accuracy: 1e-6)
    }

    func testEmptyCurveIsZero() {
        XCTAssertEqual(sampleEnvelope([], 100), 0, accuracy: 1e-6)
    }

    /// Verifies the Codable round-trip that reads a core `PatternData` whose
    /// stored properties are `internal`.
    func testSampledPatternExtractsFromPatternData() {
        let pattern = PatternData(
            continuousPattern: ContinuousPattern(
                amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 800, value: 1)],
                frequency: [ValuePoint(time: 0, value: 0.3), ValuePoint(time: 600, value: 0.8)]
            ),
            discretePattern: [
                DiscretePoint(time: 0, amplitude: 1, frequency: 0.5),
                DiscretePoint(time: 250, amplitude: 0.5, frequency: 0.4),
            ]
        )
        let s = sampledPattern(from: pattern)
        XCTAssertNotNil(s)
        guard let s else { return }
        XCTAssertEqual(s.amplitude.count, 2)
        XCTAssertEqual(s.amplitude[1].time, 800, accuracy: 1e-6)
        XCTAssertEqual(s.amplitude[1].value, 1, accuracy: 1e-6)
        XCTAssertEqual(s.frequency[1].value, 0.8, accuracy: 1e-6)
        XCTAssertEqual(s.discrete.count, 2)
        XCTAssertEqual(s.discrete[1].time, 250, accuracy: 1e-6)
        XCTAssertEqual(s.discrete[1].amplitude, 0.5, accuracy: 1e-6)
        XCTAssertEqual(s.discrete[1].frequency, 0.4, accuracy: 1e-6)
        XCTAssertTrue(s.hasContinuous)
        XCTAssertEqual(patternDurationMs(s), 800, accuracy: 1e-6)
    }

    func testClampRange() {
        XCTAssertEqual(clamp01(-1), 0, accuracy: 1e-6)
        XCTAssertEqual(clamp01(5), 1, accuracy: 1e-6)
        XCTAssertEqual(clamp01(0.4), 0.4, accuracy: 1e-6)
    }
}
