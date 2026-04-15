import 'package:flutter_test/flutter_test.dart';
import 'package:pulsar/pulsar.dart';
import 'package:pulsar/pulsar_platform_interface.dart';
import 'package:pulsar/pulsar_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockPulsarPlatform
    with MockPlatformInterfaceMixin
    implements PulsarPlatform {
  @override
  Future<String?> getPlatformVersion() => Future.value('42');
}

void main() {
  final PulsarPlatform initialPlatform = PulsarPlatform.instance;

  test('$MethodChannelPulsar is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelPulsar>());
  });

  test('getPlatformVersion', () async {
    Pulsar pulsarPlugin = Pulsar();
    MockPulsarPlatform fakePlatform = MockPulsarPlatform();
    PulsarPlatform.instance = fakePlatform;

    expect(await pulsarPlugin.getPlatformVersion(), '42');
  });
}
