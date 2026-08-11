import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar_haptics/pulsar.dart';
import 'package:pulsar_haptics_lottie/src/sampler.dart';

void main() {
  group('sampleEnvelope', () {
    const env = [
      ValuePoint(time: 0, value: 0),
      ValuePoint(time: 400, value: 1),
      ValuePoint(time: 800, value: 0),
    ];

    test('clamps before start and after end', () {
      expect(sampleEnvelope(env, -50), 0);
      expect(sampleEnvelope(env, 900), 0);
    });

    test('hits an exact knot', () {
      expect(sampleEnvelope(env, 400), 1);
    });

    test('interpolates linearly', () {
      expect(sampleEnvelope(env, 200), closeTo(0.5, 1e-9));
      expect(sampleEnvelope(env, 600), closeTo(0.5, 1e-9));
    });

    test('empty curve returns 0', () {
      expect(sampleEnvelope(const [], 123), 0);
    });
  });

  test('patternDurationMs is the largest timestamp', () {
    final p = PatternData.fromArrays(
      amplitude: [
        [0, 0],
        [800, 1],
      ],
      frequency: [
        [0, 0.3],
        [600, 0.8],
      ],
      discrete: [
        [0, 1, 0.5],
        [250, 0.5, 0.5],
      ],
    );
    expect(patternDurationMs(p), 800);
  });

  test('clamp01', () {
    expect(clamp01(-1), 0);
    expect(clamp01(5), 1);
    expect(clamp01(0.4), 0.4);
  });
}
