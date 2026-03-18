import UIKit
import Foundation

@objc public class DeepRumblePreset : Player, Preset {
  public static let name: String = "DeepRumble"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DeepRumblePreset(haptics)
  }
}
