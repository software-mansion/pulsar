import UIKit
import Foundation

@inline(__always)
private func makeMainActorPreparedGenerator<G: UIFeedbackGenerator>(
  _ build: @MainActor () -> G
) -> G {
  precondition(
    Thread.isMainThread,
    "Pulsar system presets must be constructed on the main thread (UIFeedbackGenerator is @MainActor-isolated)."
  )
  return MainActor.assumeIsolated {
    let generator = build()
    generator.prepare()
    return generator
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
    self.impactFeedbackGenerator = makeMainActorPreparedGenerator { UIImpactFeedbackGenerator(style: .light) }
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
    self.impactFeedbackGenerator = makeMainActorPreparedGenerator { UIImpactFeedbackGenerator(style: .medium) }
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
    self.impactFeedbackGenerator = makeMainActorPreparedGenerator { UIImpactFeedbackGenerator(style: .heavy) }
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
    self.impactFeedbackGenerator = makeMainActorPreparedGenerator { UIImpactFeedbackGenerator(style: .soft) }
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
    self.impactFeedbackGenerator = makeMainActorPreparedGenerator { UIImpactFeedbackGenerator(style: .rigid) }
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
    self.feedbackGenerator = makeMainActorPreparedGenerator { UINotificationFeedbackGenerator() }
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
    self.feedbackGenerator = makeMainActorPreparedGenerator { UINotificationFeedbackGenerator() }
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
    self.feedbackGenerator = makeMainActorPreparedGenerator { UINotificationFeedbackGenerator() }
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
    self.feedbackGenerator = makeMainActorPreparedGenerator { UISelectionFeedbackGenerator() }
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
