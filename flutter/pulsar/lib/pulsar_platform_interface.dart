import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'pulsar_method_channel.dart';

abstract class PulsarPlatform extends PlatformInterface {
  /// Constructs a PulsarPlatform.
  PulsarPlatform() : super(token: _token);

  static final Object _token = Object();

  static PulsarPlatform _instance = MethodChannelPulsar();

  /// The default instance of [PulsarPlatform] to use.
  ///
  /// Defaults to [MethodChannelPulsar].
  static PulsarPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [PulsarPlatform] when
  /// they register themselves.
  static set instance(PulsarPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
