import CoreHaptics
import UIKit

@objc public class Pulsar: NSObject {
  private var engine = HapticEngineWrapper()
  private var audioSimulator = AudioSimulator()
  private var presets: PresetsWrapper?
  private var realtimeComposer: RealtimeComposerImpl!
  
  @objc public override init() {
    realtimeComposer = RealtimeComposerImpl(engine: self.engine)
  }
  
  @objc public func Presets() -> PresetsWrapper {
    if (presets == nil) {
      presets = PresetsWrapper(haptics: self)
    }
    return presets!
  }
  
  @objc public func preloadPresets(presetNames: Array<String>) {
    let presets = self.Presets()
    for (presetName) in presetNames {
      presets.preloadPresetByName(presetName)
    }
  }
  
  @objc public func enableSound(state: Bool) {
    audioSimulator.enableSound(state)
  }
  
  @objc public func enableCache(state: Bool) {
    self.Presets().enableCache(state: state)
  }
  
  @objc public func clearChace() {
    self.Presets().resetCache()
  }
  
  @objc public func PatternComposer() -> PatternComposerImpl {
    return PatternComposerImpl(engine: engine, audioSimulator: audioSimulator)
  }
  
  @objc public func RealtimeComposer() -> RealtimeComposerImpl {
    return realtimeComposer
  }
  
}
