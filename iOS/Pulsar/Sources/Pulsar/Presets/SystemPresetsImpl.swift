import UIKit
import Foundation

// UIKit feedback generators (UIImpactFeedbackGenerator, UINotificationFeedbackGenerator,
// UISelectionFeedbackGenerator) are `@MainActor`-isolated under Swift 6. Presets in
// this file are constructed lazily via `PresetsWrapper.getCacheablePreset(_:)`, which
// is reached only from the React Native / Flutter bridge entry points; both bridges
// dispatch onto the main thread, so we can safely call into `@MainActor` synchronously
// via `MainActor.assumeIsolated` to satisfy isolation requirements without cascading
// `@MainActor` through the public PresetsWrapper API.
//
// The helpers below return freshly constructed generators rather than mutating `self`
// inside the `@MainActor` closure. That keeps Swift 6's region-based isolation happy:
// the returned generator is transferred out of the MainActor region (no other live
// reference exists at the construction site) and then stored into a non-isolated
// property of the preset.

@inline(__always)
private func makeImpactGenerator(_ style: UIImpactFeedbackGenerator.FeedbackStyle) -> UIImpactFeedbackGenerator {
  MainActor.assumeIsolated {
    let g = UIImpactFeedbackGenerator(style: style)
    g.prepare()
    return g
  }
}

@inline(__always)
private func makeNotificationGenerator() -> UINotificationFeedbackGenerator {
  MainActor.assumeIsolated {
    let g = UINotificationFeedbackGenerator()
    g.prepare()
    return g
  }
}

@inline(__always)
private func makeSelectionGenerator() -> UISelectionFeedbackGenerator {
  MainActor.assumeIsolated {
    let g = UISelectionFeedbackGenerator()
    g.prepare()
    return g
  }
}

@objc public class SystemImpactLightPreset : Player, Preset {
  public static let name: String = "SystemImpactLight"
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!

  @objc public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.55, 0.4]
    ])
//CODEGEN_END_{system_preset}
    self.impactFeedbackGenerator = makeImpactGenerator(.light)
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [impactFeedbackGenerator = self.impactFeedbackGenerator] in
      await impactFeedbackGenerator?.impactOccurred()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactLightPreset(haptics)
  }
}

@objc public class SystemImpactMediumPreset : Player, Preset {
  public static let name: String = "SystemImpactMedium"
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.7, 0.3]
    ])
//CODEGEN_END_{system_preset}
    self.impactFeedbackGenerator = makeImpactGenerator(.medium)
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [impactFeedbackGenerator = self.impactFeedbackGenerator] in
      await impactFeedbackGenerator?.impactOccurred()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactMediumPreset(haptics)
  }
}

@objc public class SystemImpactHeavyPreset : Player, Preset {
  public static let name: String = "SystemImpactHeavy"
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 1, 0.45]
    ])
//CODEGEN_END_{system_preset}
    self.impactFeedbackGenerator = makeImpactGenerator(.heavy)
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [impactFeedbackGenerator = self.impactFeedbackGenerator] in
      await impactFeedbackGenerator?.impactOccurred()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactHeavyPreset(haptics)
  }
}

@objc public class SystemImpactSoftPreset : Player, Preset {
  public static let name: String = "SystemImpactSoft"
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.6, 0.1]
    ])
//CODEGEN_END_{system_preset}
    self.impactFeedbackGenerator = makeImpactGenerator(.soft)
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [impactFeedbackGenerator = self.impactFeedbackGenerator] in
      await impactFeedbackGenerator?.impactOccurred()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactSoftPreset(haptics)
  }
}

@objc public class SystemImpactRigidPreset : Player, Preset {
  public static let name: String = "SystemImpactRigid"
  private var impactFeedbackGenerator: UIImpactFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.8, 0.95]
    ])
//CODEGEN_END_{system_preset}
    self.impactFeedbackGenerator = makeImpactGenerator(.rigid)
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [impactFeedbackGenerator = self.impactFeedbackGenerator] in
      await impactFeedbackGenerator?.impactOccurred()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemImpactRigidPreset(haptics)
  }
}

@objc public class SystemNotificationSuccessPreset : Player, Preset {
  public static let name: String = "SystemNotificationSuccess"
  private var feedbackGenerator: UINotificationFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.6, 0.6],
      [150, 1, 1]
    ])
//CODEGEN_END_{system_preset}
    self.feedbackGenerator = makeNotificationGenerator()
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [feedbackGenerator = self.feedbackGenerator] in
      await feedbackGenerator?.notificationOccurred(.success)
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationSuccessPreset(haptics)
  }
}

@objc public class SystemNotificationWarningPreset : Player, Preset {
  public static let name: String = "SystemNotificationWarning"
  private var feedbackGenerator: UINotificationFeedbackGenerator!

  public init(_ haptics: Pulsar) {
  //CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.95, 1],
      [150, 0.6, 0.9]
    ])
  //CODEGEN_END_{system_preset}
    self.feedbackGenerator = makeNotificationGenerator()
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [feedbackGenerator = self.feedbackGenerator] in
      await feedbackGenerator?.notificationOccurred(.warning)
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationWarningPreset(haptics)
  }
}

@objc public class SystemNotificationErrorPreset : Player, Preset {
  public static let name: String = "SystemNotificationError"
  private var feedbackGenerator: UINotificationFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.7, 0.5],
      [100, 0.7, 0.5],
      [200, 0.7, 0.8],
      [250, 0.8, 0.4]
    ])
//CODEGEN_END_{system_preset}
    self.feedbackGenerator = makeNotificationGenerator()
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [feedbackGenerator = self.feedbackGenerator] in
      await feedbackGenerator?.notificationOccurred(.error)
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemNotificationErrorPreset(haptics)
  }
}

@objc public class SystemSelectionPreset : Player, Preset {
  public static let name: String = "SystemSelection"
  private var feedbackGenerator: UISelectionFeedbackGenerator!

  public init(_ haptics: Pulsar) {
//CODEGEN_BEGIN_{system_preset}
    super.init(haptics, audioOnly: true, rawDiscretePattern: [
      [0, 0.4, 0.7]
    ])
//CODEGEN_END_{system_preset}
    self.feedbackGenerator = makeSelectionGenerator()
  }

  @objc public override func play() {
    guard isEnabled else { return }
    super.play()
    Task { [feedbackGenerator = self.feedbackGenerator] in
      await feedbackGenerator?.selectionChanged()
    }
  }


  public static func getInstance(haptics: Pulsar) -> Preset {
    return SystemSelectionPreset(haptics)
  }
}
