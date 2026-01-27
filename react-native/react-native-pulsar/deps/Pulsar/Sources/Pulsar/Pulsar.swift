import CoreHaptics
import UIKit

@objc public class Pulsar: NSObject {
  private var engine = HapticEngineWrapper()
  private var audioSimulator = AudioSimulator()
  private var presets: PresetsWrapper?
  private var realtimeComposer: RealtimeComposer!
  
  @objc public override init() {
    realtimeComposer = RealtimeComposer(engine: self.engine)
  }
  
  @objc public func getPresets() -> PresetsWrapper {
    if (presets == nil) {
      presets = PresetsWrapper(haptics: self)
    }
    return presets!
  }
  
  @objc public func preloadPresets(presetNames: Array<String>) {
    let presets = self.getPresets()
    for (presetName) in presetNames {
      presets.preloadPresetByName(presetName)
    }
  }
  
  @objc public func enableSound(state: Bool) {
    audioSimulator.enableSound(state)
  }
  
  @objc public func enableCache(state: Bool) {
    self.getPresets().enableCache(state: state)
  }
  
  @objc public func clearCache() {
    self.getPresets().resetCache()
  }
  
  @objc public func getPatternComposer() -> PatternComposer {
    return PatternComposer(engine: engine, audioSimulator: audioSimulator)
  }
  
  @objc public func getRealtimeComposer() -> RealtimeComposer {
    return realtimeComposer
  }
  
}
