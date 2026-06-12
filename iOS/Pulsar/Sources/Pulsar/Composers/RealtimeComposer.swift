import Foundation
import CoreHaptics

public class RealtimeComposer: NSObject {
  private var engine: HapticEngineWrapper!
  private var isPlaying = false

  /// Auto-stop the continuous player if no `set` arrives within this window.
  /// Realtime playback is continuous and only ends on an explicit `stop()`, so a
  /// driver that goes silent while playing (e.g. a sensor/gesture loop that is
  /// torn down without a final stop) would otherwise vibrate indefinitely. The
  /// keepalive bounds that worst case to a short, fixed tail.
  private static let keepaliveMs = 400
  private var keepaliveWorkItem: DispatchWorkItem?

  public init(engine: HapticEngineWrapper) {
    self.engine = engine
  }

  deinit {
    stop()
  }

  @objc public func set(amplitude: Float, frequency: Float) {
    guard engine.isHapticsEnabled else { return }
    if !isPlaying {
      ensureStarted()
    }
    guard isPlaying, let player = engine?.getRealtimePlayer() else { return }

    let parameters = [
      CHHapticDynamicParameter(parameterID: .hapticIntensityControl, value: min(max(amplitude, 0), 1), relativeTime: 0),
      CHHapticDynamicParameter(parameterID: .hapticSharpnessControl, value: min(max(frequency, 0), 1), relativeTime: 0)
    ]
    do {
      try player.sendParameters(parameters, atTime: 0)
      refreshKeepalive()
    } catch {
      print("Failed to update haptic parameters: \(error)")
    }
  }

  @objc public func stop() {
    cancelKeepalive()
    guard isPlaying else { return }
    do {
      try engine?.getRealtimePlayer()?.stop(atTime: 0)
    } catch {
      print("Error stopping realtime player: \(error.localizedDescription)")
    }
    isPlaying = false
  }

  @objc public var isActive: Bool {
    return isPlaying
  }

  @objc public func playDiscrete(amplitude: Float = 1.0, frequency: Float = 0.5) {
    guard engine.isHapticsEnabled else { return }
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }

    let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: amplitude)
    let sharpnessParam = CHHapticEventParameter(parameterID: .hapticSharpness, value: frequency)
    let event = CHHapticEvent(eventType: .hapticTransient, parameters: [intensityParam, sharpnessParam], relativeTime: 0)

    do {
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      if let id = engine?.createPlayer(pattern: pattern) {
        engine?.playPlayer(id: id, pattern: pattern)
      }
    } catch {
      print("Failed to play transient haptic: \(error)")
    }
  }

  /// Starts the continuous realtime player on demand. Driven only by `set`;
  /// there is no public start lifecycle — sending parameters arms playback.
  private func ensureStarted() {
    guard engine.isHapticsEnabled else { return }
    guard !isPlaying else { return }
    guard let player = engine?.getRealtimePlayer() else { return }
    isPlaying = true
    do {
      try player.start(atTime: 0)
      refreshKeepalive()
    } catch {
      isPlaying = false
      print("Error starting realtime player: \(error.localizedDescription)")
    }
  }

  private func refreshKeepalive() {
    cancelKeepalive()
    let workItem = DispatchWorkItem { [weak self] in
      self?.stop()
    }
    keepaliveWorkItem = workItem
    DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Self.keepaliveMs), execute: workItem)
  }

  private func cancelKeepalive() {
    keepaliveWorkItem?.cancel()
    keepaliveWorkItem = nil
  }
}
