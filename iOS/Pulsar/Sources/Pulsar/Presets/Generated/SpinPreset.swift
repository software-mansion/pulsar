import UIKit
import Foundation

@objc public class SpinPreset : Player, Preset {
  public static let name: String = "Spin"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.38], [60, 0.0], [250, 0.38], [308, 0.0], [500, 0.38], [558, 0.0], [750, 0.38], [808, 0.0], [1000, 0.38], [1058, 0.0], [1250, 0.38], [1308, 0.0], [1500, 0.38], [1558, 0.0], [1750, 0.38], [1808, 0.0]],
        [[0, 0.55], [1808, 0.55]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.55],
        [250, 0.4, 0.55],
        [500, 0.4, 0.55],
        [750, 0.4, 0.55],
        [1000, 0.4, 0.55],
        [1250, 0.4, 0.55],
        [1500, 0.4, 0.55],
        [1750, 0.4, 0.55]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SpinPreset(haptics)
  }
}
