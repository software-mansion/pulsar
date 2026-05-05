import UIKit
import Foundation

@objc public class PowerDownPreset : Player, Preset {
  public static let name: String = "PowerDown"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.8], [200, 0.7], [450, 0.55], [750, 0.4], [1050, 0.25], [1350, 0.12], [1600, 0.03], [1800, 0.0]],
        [[0, 0.6], [1800, 0.03]],
      ],
      rawDiscretePattern: [
        [0, 0.8, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PowerDownPreset(haptics)
  }
}
