import UIKit
import Foundation

@objc public class LamentPreset : Player, Preset {
  public static let name: String = "Lament"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.85], [190, 0.3], [295, 0.0], [355, 0.7], [535, 0.25], [645, 0.0], [705, 0.55], [880, 0.18], [995, 0.0], [1055, 0.75], [1620, 0.35], [2150, 0.1], [2450, 0.0]],
        [[0, 0.55], [350, 0.42], [700, 0.37], [1050, 0.3], [2450, 0.26]],
      ],
      rawDiscretePattern: [
        [0, 0.85, 0.55],
        [350, 0.7, 0.42],
        [700, 0.55, 0.37],
        [1050, 0.75, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LamentPreset(haptics)
  }
}
