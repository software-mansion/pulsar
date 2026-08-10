import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar_haptics/pulsar_method_channel.dart';
import 'package:pulsar_haptics/pulsar_types.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final platform = MethodChannelPulsar();
  const channel = MethodChannel('pulsar');
  final loggedCalls = <MethodCall>[];

  setUp(() {
    loggedCalls.clear();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (methodCall) async {
          loggedCalls.add(methodCall);
          if (methodCall.method == 'Pulsar_hapticSupport') {
            return 3;
          }
          return null;
        });
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
  });

  test('play normalizes Flutter preset names for native lookup', () async {
    await platform.play('balloonPop');

    expect(loggedCalls, hasLength(1));
    expect(loggedCalls.single.method, 'Pulsar_play');
    expect(loggedCalls.single.arguments, {'name': 'BalloonPop'});
  });

  test('parsePatternWithSound sends the pattern and sound over the channel', () async {
    final pattern = PatternData(
      continuousPattern: const ContinuousPattern(amplitude: [], frequency: []),
      discretePattern: const [
        DiscretePoint(time: 0, amplitude: 1.0, frequency: 0.8),
      ],
    );

    await platform.patternParsePatternWithSound(
      pattern,
      const Sound(uri: 'beep', volume: 0.5, offset: 20),
    );

    expect(loggedCalls, hasLength(1));
    final call = loggedCalls.single;
    expect(call.method, 'PatternComposer_parsePatternWithSound');
    final args = call.arguments as Map;
    expect(args['sound'], {'uri': 'beep', 'volume': 0.5, 'offset': 20});
    expect(args['data'], isNotNull);
    expect(args.containsKey('composerId'), isFalse);
  });

  test('preloadPresets normalizes each preset name', () async {
    await platform.preloadPresets([
      'balloonPop',
      'systemImpactLight',
      'buzz',
      'AlreadyNormalized',
    ]);

    expect(loggedCalls, hasLength(1));
    expect(loggedCalls.single.method, 'Pulsar_preloadPresets');
    expect(loggedCalls.single.arguments, {
      'presetNames': [
        'BalloonPop',
        'SystemImpactLight',
        'Buzz',
        'AlreadyNormalized',
      ],
    });
  });
}
