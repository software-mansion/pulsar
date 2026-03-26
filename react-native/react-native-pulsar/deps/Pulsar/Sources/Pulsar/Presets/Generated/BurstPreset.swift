import UIKit
import Foundation

@objc public class BurstPreset : Player, Preset {
  public static let name: String = "Burst"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.18], [80, 0.4], [100, 0.85], [130, 0.3], [300, 0.0]],
        [[0, 0.55], [80, 0.65], [100, 0.72], [300, 0.4]],
      ],
      rawDiscretePattern: [
        [0, 0.2, 0.55],
        [100, 0.45, 0.65],
        [180, 0.9, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BurstPreset(haptics)
  }
}
