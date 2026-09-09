import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsar_haptics/pulsar.dart';
import 'package:pulsar_haptics_lottie/pulsar_haptics_lottie.dart';

import 'fake_pulsar_platform.dart';

const _sixtyFramesAtThirtyFps = Duration(seconds: 2);

const _lottieJson =
    '{"v":"5.7.4","fr":30,"ip":0,"op":60,"w":100,"h":100,"nm":"empty",'
    '"ddd":0,"assets":[],"layers":[]}';

const _pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 800, value: 1)],
    frequency: [ValuePoint(time: 0, value: 0.3)],
  ),
  discretePattern: [DiscretePoint(time: 250, amplitude: 1, frequency: 0.5)],
);

PresetHandle _preset({bool withAnimation = true, double duration = 0}) =>
    PresetHandle(
      'token',
      'celebration',
      name: 'Celebration',
      duration: duration,
      pattern: _pattern,
      animation: withAnimation
          ? BundleAnimation(
              data: Uint8List.fromList(utf8.encode(_lottieJson)),
              frameRate: 30,
              totalFrames: 60,
            )
          : null,
    );

class _TestAssetBundle extends CachingAssetBundle {
  @override
  Future<ByteData> load(String key) async =>
      ByteData.sublistView(Uint8List.fromList(utf8.encode(_lottieJson)));

  @override
  Future<String> loadString(String key, {bool cache = true}) async =>
      _lottieJson;
}

void main() {
  late RecordingPulsarPlatform native;

  setUp(() {
    native = RecordingPulsarPlatform.install();
  });

  Future<void> settleComposition(WidgetTester tester) async {
    await tester.pump();
    await tester.pump();
  }

  Future<void> pumpLottie(WidgetTester tester, Widget child) async {
    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: Center(
          child: DefaultAssetBundle(bundle: _TestAssetBundle(), child: child),
        ),
      ),
    );
    await settleComposition(tester);
  }

  group('HapticLottie.preset', () {
    testWidgets('renders the animation the preset was authored against', (
      tester,
    ) async {
      await pumpLottie(tester, HapticLottie.preset(_preset(), width: 40));

      expect(find.byType(Lottie), findsOneWidget);
      expect(tester.widget<Lottie>(find.byType(Lottie)).width, 40);
    });

    testWidgets('hands the controller back through onControllerCreated', (
      tester,
    ) async {
      final preset = _preset();
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(preset, onControllerCreated: (c) => controller = c),
      );

      expect(controller, isNotNull);
      expect(controller!.preset, same(preset));
      expect(controller!.hapticMode, HapticMode.realtime);
    });

    testWidgets('a preset with no animation renders a sized box instead', (
      tester,
    ) async {
      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(withAnimation: false),
          width: 20,
          height: 30,
        ),
      );

      expect(find.byType(Lottie), findsNothing);
      final box = tester.widget<SizedBox>(
        find.descendant(
          of: find.byType(HapticLottie),
          matching: find.byType(SizedBox),
        ),
      );
      expect(box.width, 20);
      expect(box.height, 30);
    });

    testWidgets('autoPlay starts the animation and the haptics with it', (
      tester,
    ) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(),
          autoPlay: true,
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(const Duration(milliseconds: 500));

      expect(controller!.animationController.isAnimating, isTrue);
      expect(controller!.animationController.value, greaterThan(0));
      expect(native.realtimeSets, isNotEmpty);
    });

    testWidgets('without autoPlay nothing moves until asked', (tester) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(),
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(const Duration(milliseconds: 500));

      expect(controller!.animationController.isAnimating, isFalse);
      expect(native.calls, isEmpty);
    });

    testWidgets('autoPlay + repeat loops the animation', (tester) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(),
          autoPlay: true,
          repeat: true,
          repeatCount: 2,
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(_sixtyFramesAtThirtyFps + const Duration(milliseconds: 500));

      expect(controller!.animationController.isAnimating, isTrue);
      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('disposing the widget silences later frames', (tester) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(),
          autoPlay: true,
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));
      expect(native.realtimeSets, isNotEmpty);

      await tester.pumpWidget(const SizedBox());
      native.realtimeSets.clear();
      await tester.pump(const Duration(milliseconds: 200));

      expect(native.realtimeSets, isEmpty);
      expect(controller, isNotNull);
    });

    testWidgets('hapticsEnabled: false animates without touching the engine', (
      tester,
    ) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.preset(
          _preset(),
          autoPlay: true,
          hapticsEnabled: false,
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(const Duration(milliseconds: 500));

      expect(controller!.animationController.value, greaterThan(0));
      expect(native.calls, isEmpty);
    });
  });

  group('HapticLottie.asset', () {
    testWidgets('loads the asset and adopts the composition length', (
      tester,
    ) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.asset(
          'assets/anim.json',
          haptics: _pattern,
          onControllerCreated: (c) => controller = c,
        ),
      );

      expect(find.byType(Lottie), findsOneWidget);
      expect(
        controller!.durationMsResolved,
        _sixtyFramesAtThirtyFps.inMilliseconds,
      );
    });

    testWidgets('an explicit durationMs still wins over the composition', (
      tester,
    ) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.asset(
          'assets/anim.json',
          haptics: _pattern,
          durationMs: 500,
          onControllerCreated: (c) => controller = c,
        ),
      );

      expect(controller!.durationMsResolved, 500);
    });

    testWidgets('forwards the layout props to the Lottie widget', (
      tester,
    ) async {
      await pumpLottie(
        tester,
        HapticLottie.asset(
          'assets/anim.json',
          width: 64,
          height: 48,
          fit: BoxFit.cover,
          alignment: Alignment.bottomRight,
        ),
      );

      final lottie = tester.widget<Lottie>(find.byType(Lottie));
      expect(lottie.width, 64);
      expect(lottie.height, 48);
      expect(lottie.fit, BoxFit.cover);
      expect(lottie.alignment, Alignment.bottomRight);
    });

    testWidgets('with no haptics it is just a Lottie view', (tester) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.asset(
          'assets/anim.json',
          autoPlay: true,
          onControllerCreated: (c) => controller = c,
        ),
      );
      await tester.pump(const Duration(milliseconds: 500));

      expect(controller!.animationController.value, greaterThan(0));
      expect(native.calls, isEmpty);
    });
  });

  group('HapticLottie.network', () {
    testWidgets('builds and wires a controller even before the fetch lands', (
      tester,
    ) async {
      HapticLottieController? controller;

      await pumpLottie(
        tester,
        HapticLottie.network(
          'https://example.com/anim.json',
          haptics: _pattern,
          onControllerCreated: (c) => controller = c,
        ),
      );

      expect(find.byType(LottieBuilder), findsOneWidget);
      expect(find.byType(Lottie), findsNothing);
      expect(controller, isNotNull);
      expect(controller!.durationMsResolved, 800, reason: 'the pattern length');
    });
  });
}
