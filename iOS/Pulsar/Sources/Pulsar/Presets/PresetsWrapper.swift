import AVFoundation
import UIKit
import Foundation
import AVFAudio

private extension Bundle {
  static var PulsarBundle: Bundle {
    #if SWIFT_PACKAGE
    return Bundle.module
    #else
    let bundle = Bundle(for: EarthquakePreset.self)
    
    if bundle.url(forResource: "pattern", withExtension: "wav") != nil {
      return bundle
    }
    
    if Bundle.main.url(forResource: "pattern", withExtension: "wav") != nil {
      return Bundle.main
    }
    
    if let bundlePath = Bundle.main.path(forResource: "Haptics", ofType: "bundle"),
       let resourceBundle = Bundle(path: bundlePath),
       resourceBundle.url(forResource: "pattern", withExtension: "wav") != nil {
      return resourceBundle
    }
    
    return bundle
    #endif
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class PresetsWrapper : NSObject {
  private var playSound: Bool = true
  private var useCache: Bool = true
  private var cache: [String: Preset] = [:]
  private var haptics: Pulsar?
  
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
  
  public func enableSound(state: Bool) {
    self.playSound = state
    for key in cache.keys {
      cache[key]?.enableSound(state: state)
    }
  }
  
  public func isSoundEnabled() -> Bool {
    return self.playSound
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

@available(iOS 13.0, *)
@objc public protocol Preset {
  func play()
  func enableSound(state: Bool)
  static func getInstance(haptics: Pulsar) -> Preset
  static var name: String { get }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class Player : NSObject {
  private var audioPlayer: AVAudioPlayer?
  private var haptics: Pulsar?
  private var playSound: Bool = true
  
  public init(haptics: Pulsar, presetName: String) {
    super.init()
    self.haptics = haptics
    #if DEBUG
    self.configureSoundPlayer(presetName: presetName)
    #endif
  }
  
  private func configureSoundPlayer(presetName: String) {
    let bundle = Bundle.PulsarBundle
    let path = bundle.url(forResource: presetName, withExtension: "wav")
    
    guard let audioPath = path else {
      if let resourceURLs = try? bundle.urls(forResourcesWithExtension: "wav", subdirectory: nil) {
        print("Available wav files: \(resourceURLs)")
      }
      return
    }
    do {
      audioPlayer = try AVAudioPlayer(contentsOf: audioPath)
      audioPlayer?.volume = 1.0
      audioPlayer?.numberOfLoops = 0
      audioPlayer?.prepareToPlay()
    } catch {
      print("Error initializing audio player: \(error.localizedDescription)")
    }
  }
  
  @objc public func play(linePattern: [[[Double]]], barPattern: [[Double]]) {
    if (playSound) {
      audioPlayer?.currentTime = 0
      audioPlayer?.play()
    }
    haptics?.playPattern(hapticsData: PlaygroundData(line: linePattern, bar: barPattern))
  }
  
  @objc public func enableSound(state: Bool) {
    self.playSound = state
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class EarthquakePreset : Player, Preset {
  public static let name: String = "Earthquake"
  private var linePattern = [
    [[0.0, 0.0], [1.0, 1.0]],
    [[0.0, 0.0], [1.0, 1.0]],
  ]
  private var barPattern = [[0.0, 1.0, 1.0]]
  
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: EarthquakePreset.name)
  }
  
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return EarthquakePreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SuccessPreset : Player, Preset {
  public static let name: String = "Success"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = [
    [0, 0.5, 0.5],
    [0.127, 0.5, 0.5],
    [0.31, 1, 1],
  ]
  
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SuccessPreset.name)
  }
  
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SuccessPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class FailPreset : Player, Preset {
  public static let name: String = "Fail"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = [
    [0, 0.5, 0.5],
    [0.127, 0.5, 0.5],
    [0.31, 1, 0.2],
  ]
  
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: FailPreset.name)
  }
  
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return FailPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class TapPreset : Player, Preset {
  public static let name: String = "Tap"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = [
    [0, 0.5, 0.5],
  ]
  
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: TapPreset.name)
  }
  
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
  }
  
  public static func getInstance(haptics: Pulsar) -> Preset {
    return TapPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemImpactLightPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemImpactLight"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemImpactLightPreset.name)
    self.impactFeedbackGenerator = UIImpactFeedbackGenerator(style: .light)
    self.impactFeedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.impactFeedbackGenerator.impactOccurred()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactLightPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemImpactMediumPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemImpactMedium"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemImpactMediumPreset.name)
    self.impactFeedbackGenerator = UIImpactFeedbackGenerator(style: .medium)
    self.impactFeedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.impactFeedbackGenerator.impactOccurred()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactMediumPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemImpactHeavyPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemImpactHeavy"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemImpactHeavyPreset.name)
    self.impactFeedbackGenerator = UIImpactFeedbackGenerator(style: .heavy)
    self.impactFeedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.impactFeedbackGenerator.impactOccurred()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactHeavyPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemImpactSoftPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemImpactSoft"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemImpactSoftPreset.name)
    self.impactFeedbackGenerator = UIImpactFeedbackGenerator(style: .soft)
    self.impactFeedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.impactFeedbackGenerator.impactOccurred()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactSoftPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemImpactRigidPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemImpactRigid"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemImpactRigidPreset.name)
    self.impactFeedbackGenerator = UIImpactFeedbackGenerator(style: .rigid)
    self.impactFeedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.impactFeedbackGenerator.impactOccurred()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactRigidPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemNotificationSuccessPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemNotificationSuccess"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var feedbackGenerator: UINotificationFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemNotificationSuccessPreset.name)
    self.feedbackGenerator = UINotificationFeedbackGenerator()
    self.feedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.feedbackGenerator.notificationOccurred(.success)
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationSuccessPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemNotificationWarningPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemNotificationWarning"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var feedbackGenerator: UINotificationFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemNotificationWarningPreset.name)
    self.feedbackGenerator = UINotificationFeedbackGenerator()
    self.feedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.feedbackGenerator.notificationOccurred(.warning)
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationWarningPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemNotificationErrorPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemNotificationError"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var feedbackGenerator: UINotificationFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemNotificationErrorPreset.name)
    self.feedbackGenerator = UINotificationFeedbackGenerator()
    self.feedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.feedbackGenerator.notificationOccurred(.error)
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationErrorPreset(haptics)
  }
}

@available(iOS 13.0, macOS 10.15, *)
@objc public class SystemSelectionPreset : Player, @preconcurrency Preset {
  public static let name: String = "SystemSelection"
  private var linePattern: [[[Double]]] = [[], []]
  private var barPattern: [[Double]] = []
  private var feedbackGenerator: UISelectionFeedbackGenerator!
  
  @MainActor
  public init(_ haptics: Pulsar) {
    super.init(haptics: haptics, presetName: SystemSelectionPreset.name)
    self.feedbackGenerator = UISelectionFeedbackGenerator()
    self.feedbackGenerator.prepare()
  }
  
  @MainActor
  @objc public func play() {
    super.play(linePattern: linePattern, barPattern: barPattern)
    self.feedbackGenerator.selectionChanged()
  }
  
  @MainActor
  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemSelectionPreset(haptics)
  }
}
