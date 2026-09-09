import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar_haptics/pulsar.dart';
import 'package:pulsar_haptics_lottie/pulsar_haptics_lottie.dart';

const _pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 800, value: 1)],
    frequency: [ValuePoint(time: 0, value: 0.3)],
  ),
  discretePattern: [DiscretePoint(time: 250, amplitude: 1, frequency: 0.5)],
);

PresetHandle _preset({bool hasAudio = false, double duration = 1500}) =>
    PresetHandle(
      'token',
      'celebration',
      name: 'Celebration',
      duration: duration,
      pattern: _pattern,
      hasAudio: hasAudio,
    );

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
          const MethodChannel('pulsar'),
          (call) async => null,
        );
  });

  HapticLottieController controllerFor({
    PresetHandle? preset,
    PatternData? haptics,
    HapticMode? hapticMode,
    double? durationMs,
    Duration? compositionDuration,
  }) {
    final animation = AnimationController(
      vsync: const TestVSync(),
      duration: compositionDuration,
    );
    addTearDown(animation.dispose);
    final controller = HapticLottieController(
      animationController: animation,
      preset: preset,
      haptics: haptics,
      hapticMode: hapticMode,
      durationMs: durationMs,
    );
    addTearDown(controller.dispose);
    return controller;
  }

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
      controllerFor(preset: _preset(hasAudio: true), haptics: _pattern).hapticMode,
      HapticMode.realtime,
    );
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
      expect(controllerFor(haptics: _pattern).durationMsResolved, 800);
    });
  });
}
