import CoreHaptics
import UIKit

@objc public class Pulsar: NSObject {
  private var engine = HapticEngineWrapper()
  private var presets: PresetsWrapper?
  private var realtimeComposer: RealtimeComposerImpl!
  private var audioSimulator: AudioSimulator = AudioSimulator()
  
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
  
  @objc public func PatternComposer() -> PatternComposerImpl {
    return PatternComposerImpl(engine: engine)
  }
  
  @objc public func RealtimeComposer() -> RealtimeComposerImpl {
    return realtimeComposer
  }
  
  public func getAudioSimulator() -> AudioSimulator {
    return audioSimulator
  }
  
}
