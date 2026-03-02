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
    "SystemNotificationSuccess": SystemNotificationSuccessPreset.self,
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
  
  public func preloadPresetByNames(_ names: Array<String>) {
    for (name) in names {
      preloadPresetByName(name)
    }
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
  
  public func earthquake() {
    getCacheablePreset(EarthquakePreset.self).play()
  }

  public func success() {
    getCacheablePreset(SuccessPreset.self).play()
  }

  public func fail() {
    getCacheablePreset(FailPreset.self).play()
  }
  
  public func tap() {
    getCacheablePreset(TapPreset.self).play()
  }
  
  public func systemImpactLight() {
    getCacheablePreset(SystemImpactLightPreset.self).play()
  }
  
  public func systemImpactMedium() {
    getCacheablePreset(SystemImpactMediumPreset.self).play()
  }
  
  public func systemImpactHeavy() {
    getCacheablePreset(SystemImpactHeavyPreset.self).play()
  }
  
  public func systemImpactSoft() {
    getCacheablePreset(SystemImpactSoftPreset.self).play()
  }
  
  public func systemImpactRigid() {
    getCacheablePreset(SystemImpactRigidPreset.self).play()
  }
  
  public func systemNotificationSuccess() {
    getCacheablePreset(SystemNotificationSuccessPreset.self).play()
  }
  
  public func systemNotificationWarning() {
    getCacheablePreset(SystemNotificationWarningPreset.self).play()
  }
  
  public func systemNotificationError() {
    getCacheablePreset(SystemNotificationErrorPreset.self).play()
  }
  
  public func systemSelection() {
    getCacheablePreset(SystemSelectionPreset.self).play()
  }
}
