import UIKit
import Foundation

@objc public class ThunderRollPreset : Player, Preset {
  public static let name: String = "ThunderRoll"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.994, 0.053],
        [51, 0.994, 0.122],
        [100, 0.991, 0.228],
        [156, 1.0, 0.394],
        [208, 0.991, 0.613],
        [260, 1.0, 0.803],
        [309, 1.0, 1.0],
        [368, 1.0, 1.0],
        [420, 0.8, 0.8],
        [482, 0.606, 0.606],
        [544, 0.394, 0.394],
        [605, 0.194, 0.194],
        [670, 0.091, 0.091]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ThunderRollPreset(haptics)
  }
}
