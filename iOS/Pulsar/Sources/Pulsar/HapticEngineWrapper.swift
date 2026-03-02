import Foundation
import CoreHaptics
import SwiftUI

public class HapticEngineWrapper {

  private var engine: CHHapticEngine?
  private var initialized: Bool = false
  private var isHapticsEnabled: Bool = true
  
  public init() {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      print("Error: Device doens't supports haptics")
      return
    }
    
    do {
      engine = try CHHapticEngine()
      startEngine()

      NotificationCenter.default.addObserver(
        self,
        selector: #selector(appDidBecomeInactive),
        name: UIApplication.didEnterBackgroundNotification,
        object: nil
      )
    } catch {
        print("Error starting engine: \(error.localizedDescription)")
    }
  }
  
  deinit {
    if !initialized { return }
    engine?.stop()
  }
  
  public func enableHaptics(_ state: Bool) {
    if (isHapticsEnabled != state) {
      isHapticsEnabled = state
      
      if (!isHapticsEnabled) {
        stopHaptics()
      } else {
        if !initialized {
          startEngine()
        }
      }
    }
  }
  
  public func stopHaptics() {
    if !initialized { return }
    engine?.stop()
    initialized = false
  }
  
  public func shutDownEngine() {
    stopHaptics()
    engine = nil
  }
  
  private func startEngine() {
    if initialized { return }
    do {
      if (engine == nil) {
        engine = try CHHapticEngine()
      }
      try engine?.start()
      initialized = true
    } catch {
        print("Error starting engine: \(error.localizedDescription)")
    }
  }
  
  @objc func appDidBecomeInactive() {
    initialized = false
  }
  
  public func getPlayer(pattern: CHHapticPattern?) -> CHHapticPatternPlayer? {
    startEngine()
    do {
      return try engine?.makePlayer(with: pattern ?? CHHapticPattern(events: [], parameters: []))
    } catch {
        print("Error making pattern: \(error.localizedDescription)")
    }
    return nil
  }
  
  public func getRealtimePlayer() -> CHHapticAdvancedPatternPlayer? {
    startEngine()
    let intensityParam = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1)
    let sharpnessParam = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0)
    
    let event = CHHapticEvent(
      eventType: .hapticContinuous,
      parameters: [intensityParam, sharpnessParam],
      relativeTime: 0,
      duration: 100
    )
    do {
      let pattern = try CHHapticPattern(events: [event], parameters: [])
      return try engine?.makeAdvancedPlayer(with: pattern)
    } catch {
      print("Error playing pattern: \(error.localizedDescription)")
    }
    return nil
  }
  
  func isHapticsSupported() -> Bool {
    return CHHapticEngine.capabilitiesForHardware().supportsHaptics
  }
  
}
