part of 'package:pulsar_haptics/pulsar.dart';

/// Lightweight handle to a named preset, returned by [PulsarPresets.getByName].
///
/// Each call to [play] re-resolves the preset by name on the native side, so
/// the handle is safe to store but does not hold a native object reference.
class PulsarPreset {
  PulsarPreset._(this.name);

  /// The preset name used to resolve and play this preset on the native side.
  final String name;

  /// Trigger this preset's haptic feedback.
  Future<void> play() => PulsarPlatform.instance.play(name);

  /// Trigger this preset's haptic feedback without awaiting the platform call.
  void playSync() => unawaited(play());
}
