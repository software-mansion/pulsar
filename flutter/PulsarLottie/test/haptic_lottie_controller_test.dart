import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar_haptics/pulsar.dart';
import 'package:pulsar_haptics_lottie/pulsar_haptics_lottie.dart';

import 'fake_pulsar_platform.dart';

const _pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 800, value: 1)],
    frequency: [ValuePoint(time: 0, value: 0.3)],
  ),
  discretePattern: [
    DiscretePoint(time: 250, amplitude: 1, frequency: 0.5),
    DiscretePoint(time: 600, amplitude: 0.4, frequency: 0.2),
  ],
);

const _discreteOnly = PatternData(
  continuousPattern: ContinuousPattern(amplitude: [], frequency: []),
  discretePattern: [DiscretePoint(time: 100, amplitude: 1, frequency: 0.5)],
);

PresetHandle _preset({
  bool hasAudio = false,
  double duration = 1500,
  BundleAnimation? animation,
}) => PresetHandle(
  'token',
  'celebration',
  name: 'Celebration',
  duration: duration,
  pattern: _pattern,
  animation: animation,
  hasAudio: hasAudio,
);

const _patternClockMs = 800.0;
const _defaultCompositionDuration = Duration(milliseconds: 800);
const _noComposition = Duration.zero;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late RecordingPulsarPlatform native;

  setUp(() {
    native = RecordingPulsarPlatform.install();
  });

  void tickAt(HapticLottieController controller, double ms) {
    controller.animationController.value = ms / _patternClockMs;
  }

  HapticLottieController controllerFor({
    PresetHandle? preset,
    PatternData? haptics,
    HapticMode? hapticMode,
    double? durationMs,
    double hapticOffset = 0,
    bool hapticsEnabled = true,
    Duration? compositionDuration,
  }) {
    final animation = AnimationController(
      vsync: const TestVSync(),
      duration: compositionDuration ?? _defaultCompositionDuration,
    );
    addTearDown(animation.dispose);
    final controller = HapticLottieController(
      animationController: animation,
      preset: preset,
      haptics: haptics,
      hapticMode: hapticMode,
      hapticOffset: hapticOffset,
      hapticsEnabled: hapticsEnabled,
      durationMs: durationMs,
    );
    addTearDown(controller.dispose);
    return controller;
  }

  group('mode resolution', () {
    test('a silent preset stays in realtime mode', () {
      expect(controllerFor(preset: _preset()).hapticMode, HapticMode.realtime);
    });

    test('a preset with audio defaults to pattern mode, so its audio plays', () {
      expect(
        controllerFor(preset: _preset(hasAudio: true)).hapticMode,
        HapticMode.pattern,
      );
    });

    test('an explicit hapticMode wins over an audio preset default', () {
      expect(
        controllerFor(
          preset: _preset(hasAudio: true),
          hapticMode: HapticMode.realtime,
        ).hapticMode,
        HapticMode.realtime,
      );
    });

    test('explicit haptics keep an audio preset from taking over the mode', () {
      expect(
        controllerFor(
          preset: _preset(hasAudio: true),
          haptics: _pattern,
        ).hapticMode,
        HapticMode.realtime,
      );
    });

    test('with no pattern at all the mode is still reported', () {
      expect(controllerFor().hapticMode, HapticMode.realtime);
    });
  });

  group('duration resolution', () {
    test('an explicit durationMs wins over everything', () {
      expect(
        controllerFor(
          preset: _preset(),
          durationMs: 99,
          compositionDuration: const Duration(milliseconds: 2400),
        ).durationMsResolved,
        99,
      );
    });

    test("the preset's authored duration comes next", () {
      expect(
        controllerFor(
          preset: _preset(),
          compositionDuration: const Duration(milliseconds: 2400),
        ).durationMsResolved,
        1500,
      );
    });

    test('then the Lottie composition, then the pattern length', () {
      expect(
        controllerFor(
          haptics: _pattern,
          compositionDuration: const Duration(milliseconds: 2400),
        ).durationMsResolved,
        2400,
      );
      expect(
        controllerFor(
          haptics: _pattern,
          compositionDuration: _noComposition,
        ).durationMsResolved,
        800,
      );
    });

    test('a zero-length preset duration falls through to the composition', () {
      expect(
        controllerFor(
          preset: _preset(duration: 0),
          compositionDuration: const Duration(milliseconds: 2400),
        ).durationMsResolved,
        2400,
      );
    });

    test('with nothing to derive from, the clock is zero', () {
      expect(
        controllerFor(compositionDuration: _noComposition).durationMsResolved,
        0,
      );
    });
  });

  group('exposed configuration', () {
    test('the constructor arguments are readable back', () {
      final preset = _preset();
      final controller = controllerFor(
        preset: preset,
        haptics: _pattern,
        hapticOffset: -20,
        hapticsEnabled: false,
        durationMs: 700,
      );

      expect(controller.preset, same(preset));
      expect(controller.haptics, same(_pattern));
      expect(controller.hapticOffset, -20);
      expect(controller.hapticsEnabled, isFalse);
      expect(controller.durationMs, 700);
      expect(controller.animationController.value, 0);
    });
  });

  group('realtime transport', () {
    test('play restarts the animation from the beginning', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      controller.animationController.value = 0.5;

      await controller.play();

      expect(controller.animationController.value, 0);
      expect(controller.animationController.isAnimating, isTrue);
    });

    test('a tick samples the envelopes and fires the transients passed', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      tickAt(controller, 400);
      await pumpEventQueue();

      expect(native.realtimeSets.last, [closeTo(0.5, 1e-6), closeTo(0.3, 1e-6)]);
      expect(native.discretes, [
        [closeTo(1, 1e-6), closeTo(0.5, 1e-6)],
      ]);

      tickAt(controller, 720);
      await pumpEventQueue();

      expect(native.discretes.length, 2, reason: 'the 600ms transient fires too');
      expect(native.discretes.last, [closeTo(0.4, 1e-6), closeTo(0.2, 1e-6)]);
    });

    test('a transient never fires twice for the same playhead pass', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      tickAt(controller, 320);
      tickAt(controller, 360);
      tickAt(controller, 400);
      await pumpEventQueue();

      expect(native.discretes.length, 1);
    });

    test('wrapping back to the start re-arms the transients', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      tickAt(controller, 400);
      tickAt(controller, 80);
      tickAt(controller, 400);
      await pumpEventQueue();

      expect(native.discretes.length, 2);
    });

    test('hapticOffset shifts where the pattern is sampled', () async {
      final controller = controllerFor(
        haptics: _pattern,
        durationMs: _patternClockMs,
        hapticOffset: 400,
      );

      tickAt(controller, 200);
      await pumpEventQueue();

      expect(native.realtimeSets.last.first, closeTo(0.75, 1e-6));
    });

    test('a discrete-only pattern drives no continuous channel', () async {
      final controller = controllerFor(haptics: _discreteOnly, durationMs: _patternClockMs);

      tickAt(controller, 400);
      await controller.pause();
      await pumpEventQueue();

      expect(native.realtimeSets, isEmpty);
      expect(native.discretes.length, 1);
      expect(
        native.calls,
        isNot(contains('realtimeStop')),
        reason: 'nothing continuous is running, so nothing needs stopping',
      );
    });

    test('pause stops the animation and the continuous haptic', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      await controller.play();

      await controller.pause();
      await pumpEventQueue();

      expect(controller.animationController.isAnimating, isFalse);
      expect(native.calls, contains('realtimeStop'));
    });

    test('resume drives the animation forward again', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      controller.animationController.value = 0.4;

      await controller.resume();

      expect(controller.animationController.isAnimating, isTrue);
    });

    test('stop rewinds and silences the haptics', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      await controller.play();
      controller.animationController.value = 0.6;

      await controller.stop();
      await pumpEventQueue();

      expect(controller.animationController.value, 0);
      expect(controller.animationController.isAnimating, isFalse);
      expect(native.calls, contains('realtimeStop'));
    });

    test('reset rewinds like stop', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      controller.animationController.value = 0.6;
      native.calls.clear();

      await controller.reset();
      await pumpEventQueue();

      expect(controller.animationController.value, 0);
      expect(native.calls, contains('realtimeStop'));
    });

    test('setTimestamp seeks the animation', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      controller.setTimestamp(400);

      expect(controller.animationController.value, closeTo(0.5, 1e-6));
    });

    test('a tick after a seek does not replay what the seek passed', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      controller.setTimestamp(400);
      native.discretes.clear();

      tickAt(controller, 440);
      await pumpEventQueue();

      expect(native.discretes, isEmpty);
    });

    test('seeking forward replays the transients it jumps over', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      controller.setTimestamp(400);

      expect(native.discretes.length, 1);
    });

    test('setTimestamp clamps to the ends of the clock', () {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      controller.setTimestamp(5000);
      expect(controller.animationController.value, 1);

      controller.setTimestamp(-100);
      expect(controller.animationController.value, 0);
    });

    test('setTimestamp is a no-op on a zero-length clock', () {
      final controller = controllerFor(compositionDuration: _noComposition);

      controller.setTimestamp(400);

      expect(controller.animationController.value, 0);
    });

    test('setLoop(true) repeats the animation and rearms the haptics', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      await controller.setLoop(true, count: 2, reverse: true);

      expect(controller.animationController.isAnimating, isTrue);
    });

    test('setLoop(false) stops the animation', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      await controller.play();

      await controller.setLoop(false);

      expect(controller.animationController.isAnimating, isFalse);
    });

    test('dispose detaches the listener, so later frames are silent', () async {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);
      controller.dispose();
      native.calls.clear();
      native.realtimeSets.clear();

      controller.animationController.value = 0.5;
      await pumpEventQueue();

      expect(native.realtimeSets, isEmpty);
      expect(native.discretes, isEmpty);
    });

    test('dispose is idempotent', () {
      final controller = controllerFor(haptics: _pattern, durationMs: _patternClockMs);

      controller.dispose();

      expect(controller.dispose, returnsNormally);
    });
  });

  group('hapticsEnabled: false', () {
    test('the animation still runs but nothing is sent to the engine', () async {
      final controller = controllerFor(
        haptics: _pattern,
        durationMs: _patternClockMs,
        hapticsEnabled: false,
      );

      await controller.play();
      controller.animationController.value = 0.5;
      await pumpEventQueue();

      expect(controller.animationController.value, 0.5);
      expect(native.realtimeSets, isEmpty);
      expect(native.discretes, isEmpty);
      expect(native.calls, isEmpty);
    });
  });

  group('pattern mode', () {
    test('the pattern is pre-parsed up front, then played on demand', () async {
      final controller = controllerFor(
        haptics: _pattern,
        hapticMode: HapticMode.pattern,
        durationMs: _patternClockMs,
      );
      await pumpEventQueue();

      expect(native.parsedPatterns.length, 1);
      expect(native.calls, isNot(contains('patternPlay')));

      await controller.play();
      await pumpEventQueue();

      expect(native.calls, contains('patternPlay'));
    });

    test('pause and stop stop the buffered pattern', () async {
      final controller = controllerFor(
        haptics: _pattern,
        hapticMode: HapticMode.pattern,
        durationMs: _patternClockMs,
      );
      await pumpEventQueue();

      await controller.pause();
      await controller.stop();
      await pumpEventQueue();

      expect(
        native.calls.where((c) => c == 'patternStop').length,
        2,
      );
    });

    test('progress ticks send nothing — the pattern owns its own clock', () async {
      final controller = controllerFor(
        haptics: _pattern,
        hapticMode: HapticMode.pattern,
        durationMs: _patternClockMs,
      );

      controller.animationController.value = 0.5;
      await pumpEventQueue();

      expect(native.realtimeSets, isEmpty);
      expect(native.discretes, isEmpty);
    });

    test('dispose releases the native composer', () async {
      final controller = controllerFor(
        haptics: _pattern,
        hapticMode: HapticMode.pattern,
        durationMs: _patternClockMs,
      );
      await pumpEventQueue();

      controller.dispose();
      await pumpEventQueue();

      expect(native.calls, contains('patternRelease'));
    });
  });

  group('a preset that carries audio', () {
    test('plays through the preset itself, so its audio plays too', () async {
      final controller = controllerFor(preset: _preset(hasAudio: true));
      await pumpEventQueue();

      expect(
        native.parsedPatterns,
        isEmpty,
        reason: 'the native preset owns the pattern; nothing is re-parsed here',
      );

      await controller.play();
      await controller.stop();
      await pumpEventQueue();

      expect(native.playedPresets, ['celebration']);
      expect(native.stoppedPresets, ['celebration']);
    });
  });

  group('no haptics at all', () {
    test('transport steers the animation and touches no engine', () async {
      final controller = controllerFor(
        compositionDuration: const Duration(milliseconds: 800),
      );

      await controller.play();
      tickAt(controller, 400);
      await controller.pause();
      await controller.stop();
      await pumpEventQueue();

      expect(controller.animationController.value, 0);
      expect(native.calls, isEmpty);
    });
  });
}
