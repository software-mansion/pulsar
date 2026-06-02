part of 'package:pulsar_haptics/pulsar.dart';

/// Controls continuous, real-time haptic feedback.
///
/// Ideal for gesture-driven feedback (e.g. sliders, drag gestures).
/// ```dart
/// // Start the composer before sending updates
/// await pulsar.getRealtimeComposer().start();
/// // Update haptic as the user drags
/// await pulsar.getRealtimeComposer().set(0.8, 0.5);
/// // Stop when the gesture ends
/// await pulsar.getRealtimeComposer().stop();
/// ```
class PulsarRealtimeComposer {
  PulsarRealtimeComposer._({this.strategy});

  final RealtimeComposerStrategy? strategy;

  /// Start the realtime composer. Must be called before [set] has any effect.
  /// Calling [set] on a composer that is not started (or already stopped) is a no-op.
  Future<void> start() =>
      PulsarPlatform.instance.realtimeStart(strategy: strategy);

  /// Update continuous haptic parameters. The composer must be started via
  /// [start] first; otherwise this call has no effect — unless
  /// [startIfNeeded] is `true`, in which case the composer is started
  /// automatically before applying the new parameters.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  Future<void> set(
    double amplitude,
    double frequency, {
    bool startIfNeeded = false,
  }) => PulsarPlatform.instance.realtimeSet(
    amplitude,
    frequency,
    startIfNeeded: startIfNeeded,
    strategy: strategy,
  );

  /// Stop the continuous haptic.
  Future<void> stop() =>
      PulsarPlatform.instance.realtimeStop(strategy: strategy);

  /// Returns true if the realtime composer is currently active.
  Future<bool> isActive() =>
      PulsarPlatform.instance.realtimeIsActive(strategy: strategy);

  /// Fire a single discrete haptic event.
  /// [amplitude] and [frequency] are in the range 0.0–1.0.
  ///
  /// Defaults match iOS native (`amplitude = 1.0`, `frequency = 0.5`).
  Future<void> playDiscrete([double amplitude = 1.0, double frequency = 0.5]) =>
      PulsarPlatform.instance.realtimePlayDiscrete(
        amplitude,
        frequency,
        strategy: strategy,
      );
}
