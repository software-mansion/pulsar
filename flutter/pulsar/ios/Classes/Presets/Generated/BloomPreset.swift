import UIKit
import Foundation

@objc public class BloomPreset : Player, Preset {
  public static let name: String = "Bloom"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.28], [80, 0.15], [120, 0.5], [200, 0.15], [300, 0.0]],
        [[0, 0.48], [200, 0.62], [300, 0.58]],
      ],
      rawDiscretePattern: [
        [0, 0.3, 0.5],
        [120, 0.55, 0.62]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BloomPreset(haptics)
  }
}
