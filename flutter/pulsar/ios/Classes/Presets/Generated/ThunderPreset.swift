import UIKit
import Foundation

@objc public class ThunderPreset : Player, Preset {
  public static let name: String = "Thunder"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [100, 0.05], [300, 0.1], [500, 0.2], [590, 0.3], [600, 1.0], [680, 0.7], [800, 0.5], [1000, 0.3], [1300, 0.15], [1700, 0.05], [2000, 0.0]],
        [[0, 0.1], [600, 0.08], [2000, 0.05]],
      ],
      rawDiscretePattern: [
        [600, 1.0, 0.15],
        [700, 0.8, 0.12],
        [900, 0.5, 0.1],
        [1200, 0.3, 0.08]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ThunderPreset(haptics)
  }
}
