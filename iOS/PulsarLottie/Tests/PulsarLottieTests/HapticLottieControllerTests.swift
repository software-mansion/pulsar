import XCTest
import Lottie
import Pulsar
@testable import PulsarLottie

/// Public-API coverage for ``HapticLottieController``, ``PulsarLottie/bind`` and
/// ``HapticLottieView``.
///
/// The controller's own state is private, so the assertions read what it did to the
/// `LottieAnimationView` it drives: `currentProgress` for the clock (which makes the
/// duration-resolution order observable through `setTimestamp`), and `loopMode` /
/// `isAnimationPlaying` for transport.
///
/// Runs on an iOS Simulator, where `CHHapticEngine` reports haptics unsupported — so the
/// engine never actually vibrates and what is verified is the SDK's own behaviour.
@MainActor
final class HapticLottieControllerTests: XCTestCase {

  private var pulsar: Pulsar!

  private let pattern = PatternData(
    continuousPattern: ContinuousPattern(
      amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 800, value: 1)],
      frequency: [ValuePoint(time: 0, value: 0.3)]
    ),
    discretePattern: [
      DiscretePoint(time: 250, amplitude: 1, frequency: 0.5),
      DiscretePoint(time: 600, amplitude: 0.4, frequency: 0.2),
    ]
  )

  override func setUp() {
    super.setUp()
    pulsar = Pulsar()
  }

  // MARK: - Helpers

  /// A view rendering the 2s test composition. `currentProgress` only sticks on a view
  /// that has an animation, so every seek assertion needs one.
  private func animationView() -> LottieAnimationView {
    let animation = try? LottieAnimation.from(data: Data(TestBundle.lottieJSON.utf8))
    XCTAssertNotNil(animation, "the test Lottie document must parse")
    return LottieAnimationView(animation: animation)
  }

  /// A view whose composition has no length, so the controller falls through to the
  /// next duration source while `currentProgress` remains observable.
  private func zeroLengthAnimationView() -> LottieAnimationView {
    let json = TestBundle.lottieJSON.replacingOccurrences(of: #""op":60"#, with: #""op":0"#)
    return LottieAnimationView(animation: try? LottieAnimation.from(data: Data(json.utf8)))
  }

  private func preset(
    durationMs: Double = 1500,
    withAudio: Bool = false,
    withAnimation: Bool = true
  ) throws -> PresetHandle {
    let bundle = try pulsar.loadBundle(
      data: TestBundle.data(durationMs: durationMs, withAudio: withAudio, withAnimation: withAnimation)
    )
    return try XCTUnwrap(bundle.handle("celebration"))
  }

  /// Lets the main run loop turn, so a display-link-driven controller can step.
  private func spinRunLoop(_ seconds: TimeInterval = 0.3) {
    let done = expectation(description: "run loop")
    DispatchQueue.main.asyncAfter(deadline: .now() + seconds) { done.fulfill() }
    wait(for: [done], timeout: seconds + 2)
  }

  // MARK: - Duration resolution, observed through setTimestamp

  func testAnExplicitDurationWinsOverEverything() throws {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view,
      pulsar: pulsar,
      preset: try preset(),
      haptics: pattern,
      durationMs: 1000
    )

    controller.setTimestamp(500)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  func testThePresetsAuthoredDurationComesNext() throws {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, preset: try preset(durationMs: 1500)
    )

    controller.setTimestamp(750)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  func testThenTheLottieCompositionLength() {
    let view = animationView() // 60 frames @ 30fps = 2s
    let controller = HapticLottieController(animationView: view, pulsar: pulsar, haptics: pattern)

    controller.setTimestamp(1000)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  /// After the composition comes the pattern's own length — but that fallback only applies
  /// when the view has no usable composition, and such a view ignores `currentProgress`
  /// altogether, so there is nothing to observe. `patternDurationMs`, the value it falls back
  /// to, is covered in `SamplerTests`.
  func testAViewWithoutAUsableCompositionCannotBeSeeked() {
    let view = zeroLengthAnimationView()
    let controller = HapticLottieController(animationView: view, pulsar: pulsar, haptics: pattern)

    controller.setTimestamp(400)

    XCTAssertEqual(view.currentProgress, 0, accuracy: 1e-6)
  }

  func testAZeroDurationFallsThroughInsteadOfStoppingTheClock() throws {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, preset: try preset(durationMs: 1500), durationMs: 0
    )

    controller.setTimestamp(750)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  func testSetTimestampClampsToBothEndsOfTheClock() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 800
    )

    controller.setTimestamp(5000)
    XCTAssertEqual(view.currentProgress, 1, accuracy: 1e-3)

    controller.setTimestamp(-100)
    XCTAssertEqual(view.currentProgress, 0, accuracy: 1e-3)
  }

  func testWithNoHapticsAndNoDurationSeekingIsANoOp() {
    let view = animationView()
    let controller = HapticLottieController(animationView: view, pulsar: pulsar, durationMs: 0)

    // No pattern and no explicit duration: the 2s composition is still the clock.
    controller.setTimestamp(1000)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  // MARK: - Transport

  func testPlayRewindsToTheStart() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 800
    )
    controller.setTimestamp(400)

    controller.play()
    controller.pause() // freeze it before the display link can advance much

    XCTAssertLessThan(view.currentProgress, 0.4)
  }

  func testRealtimePlaybackAdvancesTheAnimationItself() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 4000
    )

    controller.play()
    spinRunLoop()
    controller.pause()
    let progressed = view.currentProgress

    XCTAssertGreaterThan(progressed, 0, "the display link drives the timeline in realtime mode")
    XCTAssertLessThan(progressed, 1)

    // Paused means paused: the playhead stays put.
    spinRunLoop(0.2)
    XCTAssertEqual(view.currentProgress, progressed, accuracy: 1e-6)
  }

  func testResumeContinuesFromWhereItPaused() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 4000
    )
    controller.setTimestamp(1000)

    controller.resume()
    spinRunLoop(0.2)
    controller.pause()

    XCTAssertGreaterThan(view.currentProgress, 0.25)
  }

  func testStopAndResetBothRewind() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 800
    )

    controller.setTimestamp(600)
    controller.stop()
    XCTAssertEqual(view.currentProgress, 0, accuracy: 1e-6)
    XCTAssertFalse(view.isAnimationPlaying)

    controller.setTimestamp(600)
    controller.reset()
    XCTAssertEqual(view.currentProgress, 0, accuracy: 1e-6)
  }

  func testRealtimePlaybackStopsAtTheEndWithoutLooping() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 100
    )

    controller.play()
    spinRunLoop()

    XCTAssertEqual(view.currentProgress, 1, accuracy: 1e-6)
  }

  func testALoopingRealtimePlaybackWrapsInsteadOfEnding() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, haptics: pattern, durationMs: 100
    )
    controller.setLoop(true)

    controller.play()
    spinRunLoop()
    controller.pause()

    XCTAssertLessThan(view.currentProgress, 1, "a looping clock wrapped rather than parking at the end")
  }

  func testSetLoopMapsOntoTheViewsLoopMode() {
    let view = animationView()
    let controller = HapticLottieController(animationView: view, pulsar: pulsar, haptics: pattern)

    controller.setLoop(true)
    XCTAssertEqual(view.loopMode, .loop)

    controller.setLoop(true, count: 3)
    XCTAssertEqual(view.loopMode, .repeat(3))

    controller.setLoop(true, count: 3, reverse: true)
    XCTAssertEqual(view.loopMode, .autoReverse, "reverse wins: it is a boomerang, not a count")

    controller.setLoop(false)
    XCTAssertEqual(view.loopMode, .playOnce)
  }

  // MARK: - Modes

  func testPatternModeLetsTheViewRunItsOwnAnimation() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view,
      pulsar: pulsar,
      haptics: pattern,
      hapticMode: .pattern,
      durationMs: 4000
    )

    controller.play()

    XCTAssertTrue(view.isAnimationPlaying, "pattern mode hands playback back to Lottie")

    controller.pause()
    XCTAssertFalse(view.isAnimationPlaying)
  }

  func testAPresetWithAudioDefaultsToPatternModeSoItsAudioPlays() throws {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view, pulsar: pulsar, preset: try preset(withAudio: true)
    )

    controller.play()

    XCTAssertTrue(view.isAnimationPlaying, "the audio preset needs pattern mode, which Lottie drives")

    controller.stop()
  }

  func testAnExplicitModeWinsOverTheAudioPresetDefault() throws {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view,
      pulsar: pulsar,
      preset: try preset(withAudio: true),
      hapticMode: .realtime,
      durationMs: 4000
    )

    controller.play()
    spinRunLoop(0.2)
    controller.pause()

    XCTAssertFalse(view.isAnimationPlaying, "realtime drives the timeline itself")
    XCTAssertGreaterThan(view.currentProgress, 0)
  }

  func testWithNoHapticsTheTransportStillSteersTheAnimation() {
    let view = animationView()
    let controller = HapticLottieController(animationView: view, pulsar: pulsar)

    controller.play()
    XCTAssertTrue(view.isAnimationPlaying)

    controller.stop()
    XCTAssertFalse(view.isAnimationPlaying)
    XCTAssertEqual(view.currentProgress, 0, accuracy: 1e-6)
  }

  func testHapticsDisabledStillAnimates() {
    let view = animationView()
    let controller = HapticLottieController(
      animationView: view,
      pulsar: pulsar,
      haptics: pattern,
      hapticsEnabled: false,
      durationMs: 4000
    )

    controller.play()
    spinRunLoop(0.2)
    controller.pause()

    XCTAssertGreaterThan(view.currentProgress, 0)
  }

  // MARK: - The bind entry point

  func testBindReturnsAControllerForTheView() throws {
    let view = animationView()

    let controller = PulsarLottie.bind(
      view, pulsar: pulsar, preset: try preset(durationMs: 1500)
    )
    controller.setTimestamp(750)

    XCTAssertEqual(view.currentProgress, 0.5, accuracy: 1e-3)
  }

  // MARK: - The SwiftUI view

  func testTheSwiftUIViewBuildsFromANameOrAPreset() throws {
    let named = HapticLottieView("anim", haptics: pattern, autoPlay: false)
    let fromPreset = HapticLottieView(preset: try preset(), autoPlay: false)

    // Each view owns a coordinator holding its Pulsar instance and, later, its controller.
    XCTAssertNil(named.makeCoordinator().controller)
    XCTAssertNil(fromPreset.makeCoordinator().controller)
  }
}
