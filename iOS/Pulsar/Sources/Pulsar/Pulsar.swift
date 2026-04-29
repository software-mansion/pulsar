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
  
  @objc public func getPatternComposer() -> PatternComposer {
    return PatternComposer(engine: engine, audioSimulator: audioSimulator)
  }
  
  @objc public func getRealtimeComposer() -> RealtimeComposer {
    return realtimeComposer
  }
  
  @objc public func preloadPresets(presetNames: Array<String>) {
    getPresets().preloadPresetByNames(presetNames)
  }
  
  @objc public var isHapticsEnabled: Bool {
    return engine.isHapticsEnabled
  }

  @objc public func enableHaptics(state: Bool) {
    engine.enableHaptics(state)
  }
  
  @objc public func enableSound(state: Bool) {
    audioSimulator.enableSound(state)
  }
  
  @objc public func enableCache(state: Bool) {
    getPresets().enableCache(state: state)
  }
  
  @objc public func clearCache() {
    getPresets().resetCache()
  }
  
  @objc public func stopHaptics() {
    engine.stopHaptics()
  }
  
  @objc public func shutDownEngine() {
    engine.shutDownEngine()
  }
  
  @objc public func isHapticsSupported() -> Bool {
    return engine.isHapticsSupported()
  }

  @objc public func canPlayHaptics() -> Bool {
    return engine.canPlayHaptics()
  }
  
}
