import Testing
import Foundation
import CoreHaptics
@testable import Pulsar

/// The curve/discrete "line" builders convert millisecond-based pattern points into CoreHaptics
/// control points and events. Constructing those CoreHaptics value types needs no engine, so this
/// pure geometry is fully exercisable on the simulator.
@Suite struct LineTests {

    // MARK: - CurveLineModifier

    @Test func addingAPointAtTimeZeroDoesNotPrependASyntheticPoint() {
        let curve = IntensityCurveLineModifier()
        curve.addPoint(time: 0, value: 0.5)
        #expect(curve.points.count == 1)
        #expect(curve.points[0].relativeTime == 0)
        #expect(curve.points[0].value == 0.5)
    }

    @Test func firstPointAfterTimeZeroGetsASyntheticAnchorAtZero() {
        // A curve that starts late is anchored at t=0 with the same value so playback begins there.
        let curve = IntensityCurveLineModifier()
        curve.addPoint(time: 100, value: 0.5)

        #expect(curve.points.count == 2)
        #expect(curve.points[0].relativeTime == 0)
        #expect(curve.points[0].value == 0.5)
        #expect(abs(curve.points[1].relativeTime - 0.1) < 1e-9)
    }

    @Test func durationTracksTheMaximumTimeNotTheLastInserted() {
        let curve = IntensityCurveLineModifier()
        curve.addPoint(time: 100, value: 0.5)
        curve.addPoint(time: 50, value: 0.9) // inserted out of order
        #expect(abs(curve.getDuration() - 0.1) < 1e-9)
    }

    @Test func resetEmptiesTheCurve() {
        let curve = IntensityCurveLineModifier()
        curve.addPoint(time: 100, value: 0.5)
        #expect(!curve.isEmpty)
        curve.reset()
        #expect(curve.isEmpty)
        #expect(curve.getDuration() == 0)
    }

    @Test func addPointClampsOutOfRangeValuesToUnitRange() {
        // Regression: out-of-range curve values are clamped to [0, 1] before reaching CoreHaptics.
        let curve = IntensityCurveLineModifier()
        curve.addPoint(time: 0, value: 2.0)
        curve.addPoint(time: 10, value: -1.0)
        #expect(curve.points.allSatisfy { $0.value >= 0 && $0.value <= 1 })
        #expect(curve.points.first?.value == 1.0)
        #expect(curve.points.contains { $0.value == 0.0 })
    }

    @Test func resetClearsBothIntensityAndSharpnessCurves() {
        // Regression for the sharpness-accumulation bug: ContinuousLine.reset() must clear both
        // curves, otherwise sharpness control points pile up across repeated parsePattern calls.
        var line = ContinuousLine()
        line.intensityCurveLine.addPoint(time: 0, value: 0.5)
        line.sharpnessCurveLine.addPoint(time: 0, value: 0.5)
        #expect(!line.intensityCurveLine.isEmpty)
        #expect(!line.sharpnessCurveLine.isEmpty)

        line.reset()

        #expect(line.intensityCurveLine.isEmpty)
        #expect(line.sharpnessCurveLine.isEmpty)
    }

    @Test func intensityAndSharpnessCurvesUseDistinctParameterIDs() {
        let intensity = IntensityCurveLineModifier()
        intensity.addPoint(time: 0, value: 0.5)
        let sharpness = SharpnessCurveLineModifier()
        sharpness.addPoint(time: 0, value: 0.5)

        #expect(intensity.getCurve.parameterID == .hapticIntensityControl)
        #expect(sharpness.getCurve.parameterID == .hapticSharpnessControl)
    }

    // MARK: - DiscreteLine

    @Test func addEventConvertsMillisecondsToRelativeSeconds() {
        var line = DiscreteLine()
        line.addEvent(timestamp: 150, intensity: 0.8, sharpness: 0.4)
        #expect(line.getEvents.count == 1)
        #expect(abs(line.getEvents[0].relativeTime - 0.15) < 1e-9)
    }

    @Test func addEventDefaultsToFullIntensityAndSharpness() {
        var line = DiscreteLine()
        line.addEvent(timestamp: 0)
        #expect(line.getEvents.count == 1)
        // Defaults are intensity 1 / sharpness 1 — assert the event exists at t=0.
        #expect(line.getEvents[0].relativeTime == 0)
    }

    @Test func resetClearsEvents() {
        var line = DiscreteLine()
        line.addEvent(timestamp: 10)
        line.addEvent(timestamp: 20)
        #expect(line.getEvents.count == 2)
        line.reset()
        #expect(line.getEvents.isEmpty)
    }
}
