import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pulsarapp/main.dart';

void main() {
  testWidgets('smoke button updates the status text', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const MyApp(pulsar: _FakePulsarFacade('Test Platform 1.0')),
    );

    expect(find.text('Idle. Tap the button to call Pulsar.'), findsOneWidget);
    expect(find.textContaining('Pulsar connected:'), findsNothing);

    await tester.tap(find.byKey(const Key('pulsar-smoke-button')));
    await tester.pump();
    await tester.pump();

    expect(find.text('Pulsar connected: Test Platform 1.0'), findsOneWidget);
  });
}

class _FakePulsarFacade extends PulsarFacade {
  const _FakePulsarFacade(this.version);

  final String version;

  @override
  Future<String?> getPlatformVersion() async => version;
}
