import UIKit
import Foundation

@objc public class HailPreset : Player, Preset {
  public static let name: String = "Hail"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.3], [400, 0.3], [430, 0.0]],
        [[0, 0.7], [430, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.7],
        [40, 0.8, 0.75],
        [75, 0.4, 0.65],
        [100, 0.9, 0.8],
        [130, 0.5, 0.7],
        [165, 0.7, 0.75],
        [190, 1.0, 0.85],
        [225, 0.45, 0.65],
        [255, 0.8, 0.78],
        [285, 0.6, 0.7],
        [310, 0.9, 0.82],
        [345, 0.5, 0.68],
        [370, 0.7, 0.74]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return HailPreset(haptics)
  }
}
