import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class PresetsWrapper : NSObject {
  private var playSound: Bool = true
  private var useCache: Bool = true
  private var cache: [String: Preset] = [:]
  private var haptics: Pulsar!
  
  private var mapper: [String: Preset.Type] = [
    "Earthquake": EarthquakePreset.self,
    "Success": SuccessPreset.self,
    "Fail": FailPreset.self,
    "Tap": TapPreset.self,
    "SystemImpactLight": SystemImpactLightPreset.self,
    "SystemImpactMedium": SystemImpactMediumPreset.self,
    "SystemImpactHeavy": SystemImpactHeavyPreset.self,
    "SystemImpactSoft": SystemImpactSoftPreset.self,
    "SystemImpactRigid": SystemImpactRigidPreset.self,
    "SystemImpactSuccess": SystemNotificationSuccessPreset.self,
    "SystemNotificationWarning": SystemNotificationWarningPreset.self,
    "SystemNotificationError": SystemNotificationErrorPreset.self,
    "SystemSelection": SystemSelectionPreset.self,
  ]
  
  public init(haptics: Pulsar) {
    super.init()
    self.haptics = haptics
  }
  
  public func enableCache(state: Bool) {
    self.useCache = state
    if (!state) {
      resetCache()
    }
  }
  
  public func isCacheEnabled() -> Bool {
    return self.useCache
  }
  
  public func resetCache() {
    cache.removeAll()
  }
  
  public func preloadPresetByName(_ name: String) {
    self.useCache = true
    _ = getCacheablePreset(mapper[name]!)
  }
  
  @objc public func getByName(_ name: String) -> Preset? {
    guard mapper.keys.contains(name) else {
      return nil
    }
    return getCacheablePreset(mapper[name]!)
  }
  
  private func getCacheablePreset(_ type: Preset.Type) -> Preset {
    if (useCache) {
      if let cachedPreset = cache[type.name] {
        return cachedPreset
      } else {
        let preset = type.getInstance(haptics: haptics!)
        cache[type.name] = preset
        return preset
      }
    }
    return type.getInstance(haptics: haptics!)
  }
  
  @objc public func Earthquake() {
    getCacheablePreset(EarthquakePreset.self).play()
  }

  @objc public func Success() {
    getCacheablePreset(SuccessPreset.self).play()
  }

  @objc public func Fail() {
    getCacheablePreset(FailPreset.self).play()
  }
  
  @objc public func Tap() {
    getCacheablePreset(TapPreset.self).play()
  }
  
  @objc public func SystemImpactLight() {
    getCacheablePreset(SystemImpactLightPreset.self).play()
  }
  
  @objc public func SystemImpactMedium() {
    getCacheablePreset(SystemImpactMediumPreset.self).play()
  }
  
  @objc public func SystemImpactHeavy() {
    getCacheablePreset(SystemImpactHeavyPreset.self).play()
  }
  
  @objc public func SystemImpactSoft() {
    getCacheablePreset(SystemImpactSoftPreset.self).play()
  }
  
  @objc public func SystemImpactRigid() {
    getCacheablePreset(SystemImpactRigidPreset.self).play()
  }
  
  @objc public func SystemNotificationSuccess() {
    getCacheablePreset(SystemNotificationSuccessPreset.self).play()
  }
  
  @objc public func SystemNotificationWarning() {
    getCacheablePreset(SystemNotificationWarningPreset.self).play()
  }
  
  @objc public func SystemNotificationError() {
    getCacheablePreset(SystemNotificationErrorPreset.self).play()
  }
  
  @objc public func SystemSelection() {
    getCacheablePreset(SystemSelectionPreset.self).play()
  }
}
