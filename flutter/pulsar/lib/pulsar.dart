
import 'pulsar_platform_interface.dart';

class Pulsar {
  Future<String?> getPlatformVersion() {
    return PulsarPlatform.instance.getPlatformVersion();
  }
}
