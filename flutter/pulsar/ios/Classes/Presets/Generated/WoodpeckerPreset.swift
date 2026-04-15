import UIKit
import Foundation

@objc public class WoodpeckerPreset : Player, Preset {
  public static let name: String = "Woodpecker"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.65], [430, 0.65], [460, 0.0]],
        [[0, 0.82], [460, 0.82]],
      ],
      rawDiscretePattern: [
        [0, 0.75, 0.82],
        [45, 0.75, 0.82],
        [90, 0.75, 0.82],
        [135, 0.75, 0.82],
        [180, 0.75, 0.82],
        [225, 0.75, 0.82],
        [270, 0.75, 0.82],
        [315, 0.75, 0.82],
        [360, 0.75, 0.82],
        [405, 0.75, 0.82]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return WoodpeckerPreset(haptics)
  }
}
