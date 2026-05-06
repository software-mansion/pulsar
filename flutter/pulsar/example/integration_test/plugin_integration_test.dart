import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:pulsar_haptics/pulsar.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('plugin exposes live haptics state APIs', (
    WidgetTester tester,
  ) async {
    final pulsar = Pulsar();

    final support = await pulsar.hapticSupport();
    final isEnabled = await pulsar.isHapticsEnabled();
    final canPlay = await pulsar.canPlayHaptics();

    expect(HapticSupport.values, contains(support));
    expect(isEnabled, isA<bool>());
    expect(canPlay, isA<bool>());
  });
}
