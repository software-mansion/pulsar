import UIKit
import Foundation

@objc public class ApplausePreset : Player, Preset {
  public static let name: String = "Applause"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.2], [1482, 0.266], [1564, 0.0]],
        [[0, 0.5], [990, 0.72], [1250, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.2, 0.5],
        [150, 0.25, 0.52],
        [290, 0.3, 0.54],
        [420, 0.4, 0.56],
        [540, 0.5, 0.58],
        [650, 0.484, 0.6],
        [750, 0.509, 0.62],
        [868, 0.503, 0.65],
        [968, 0.45, 0.716],
        [1063, 0.434, 0.725],
        [1159, 0.488, 0.759],
        [1256, 0.506, 1.0],
        [1349, 0.528, 1.0],
        [1432, 0.519, 1.0],
        [1530, 0.528, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ApplausePreset(haptics)
  }
}
