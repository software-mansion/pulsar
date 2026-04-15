import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'pulsar_platform_interface.dart';

/// An implementation of [PulsarPlatform] that uses method channels.
class MethodChannelPulsar extends PulsarPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('pulsar');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>(
      'getPlatformVersion',
    );
    return version;
  }
}
