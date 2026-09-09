import Testing
import Foundation
@testable import Pulsar

@Suite struct PatternSeekTests {

  private let ramp = PatternData(
    continuousPattern: ContinuousPattern(
      amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 1000, value: 1)],
      frequency: [ValuePoint(time: 0, value: 0.2), ValuePoint(time: 500, value: 0.8)]
    ),
    discretePattern: [
      DiscretePoint(time: 0, amplitude: 1, frequency: 0.5),
      DiscretePoint(time: 400, amplitude: 0.8, frequency: 0.4),
      DiscretePoint(time: 1000, amplitude: 0.6, frequency: 0.3),
    ]
  )

  @Test func durationIsTheLastTimestampAcrossBothLines() {
    #expect(PatternSeek.lastTimestamp(of: ramp) == 1000)
    let empty = PatternData(
      continuousPattern: ContinuousPattern(amplitude: [], frequency: []),
      discretePattern: []
    )
    #expect(PatternSeek.lastTimestamp(of: empty) == 0)
  }

  @Test func seekingToZeroReturnsTheSamePattern() {
    let original = ObjectIdentifier(ramp)
    let atZero = ObjectIdentifier(PatternSeek.pattern(ramp, from: 0))
    let beforeZero = ObjectIdentifier(PatternSeek.pattern(ramp, from: -100))
    #expect(atZero == original)
    #expect(beforeZero == original)
  }

  @Test func discreteEventsBeforeTheSeekAreDroppedAndTheRestRebased() {
    let seeked = PatternSeek.pattern(ramp, from: 400)
    #expect(seeked.discretePattern.map { $0.time } == [0, 600])
    #expect(seeked.discretePattern.map { $0.amplitude } == [0.8, 0.6])
  }

  @Test func envelopeIsReanchoredOnItsInterpolatedValue() {
    let seeked = PatternSeek.pattern(ramp, from: 250)
    #expect(seeked.continuousPattern.amplitude.map { $0.time } == [0, 750])
    #expect(seeked.continuousPattern.amplitude.map { $0.value } == [0.25, 1])
  }

  @Test func anEnvelopeEntirelyBeforeTheSeekHoldsItsLastValue() {
    let seeked = PatternSeek.pattern(ramp, from: 800)
    #expect(seeked.continuousPattern.frequency.map { $0.time } == [0, 200])
    #expect(seeked.continuousPattern.frequency.map { $0.value } == [0.8, 0.8])
    #expect(!seeked.continuousPattern.amplitude.isEmpty)
  }

  @Test func aHeldEnvelopeCollapsesToOnePointOnceNothingRemains() {
    let seeked = PatternSeek.pattern(ramp, from: 1000)
    #expect(seeked.continuousPattern.frequency.map { $0.time } == [0])
    #expect(seeked.continuousPattern.frequency.map { $0.value } == [0.8])
  }

  @Test func anEmptyEnvelopeStaysEmpty() {
    let noFrequency = PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: ramp.continuousPattern.amplitude,
        frequency: []
      ),
      discretePattern: []
    )
    #expect(PatternSeek.pattern(noFrequency, from: 250).continuousPattern.frequency.isEmpty)
  }

  @Test func soundSeeksIntoTheFileByTheSameAmount() {
    let window = PatternSeek.soundWindow(offset: 0, start: 0, duration: 0, from: 300)
    #expect(window.start == 300)
    #expect(window.offset == 0)
    #expect(window.duration == 0)
  }

  @Test func soundEatsIntoTheLeadInBeforeItTouchesTheFile() {
    let early = PatternSeek.soundWindow(offset: 500, start: 0, duration: 0, from: 200)
    #expect(early.start == 0)
    #expect(early.offset == 300)

    let late = PatternSeek.soundWindow(offset: 500, start: 0, duration: 0, from: 800)
    #expect(late.start == 300)
    #expect(late.offset == 0)
  }

  @Test func anAuthoredTrimWindowShrinksAndItsStartAdvances() {
    let window = PatternSeek.soundWindow(offset: 0, start: 1000, duration: 900, from: 400)
    #expect(window.start == 1400)
    #expect(window.duration == 500)
  }
}
