import UIKit
import Foundation

@objc public class BtnChipPreset : Player, Preset {
  public static let name: String = "BtnChip"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.4], [45, 0.05], [80, 0.0]],
        [[0, 0.5], [80, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.42, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BtnChipPreset(haptics)
  }
}
