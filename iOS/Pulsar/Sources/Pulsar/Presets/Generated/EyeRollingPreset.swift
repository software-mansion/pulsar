import UIKit
import Foundation

@objc public class EyeRollingPreset : Player, Preset {
  public static let name: String = "EyeRolling"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [20, 0.42], [180, 0.22], [450, 0.0]],
        [[0, 0.5], [180, 0.4], [450, 0.35]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.5],
        [180, 0.25, 0.4]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return EyeRollingPreset(haptics)
  }
}
