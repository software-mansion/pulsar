import UIKit
import Foundation

@objc public class ExplosionPreset : Player, Preset {
  public static let name: String = "Explosion"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 1.0], [80, 0.7], [200, 0.5], [400, 0.3], [700, 0.1], [1000, 0.0]],
        [[0, 0.2], [5, 0.15], [1000, 0.05]],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.3],
        [50, 0.8, 0.25],
        [120, 0.5, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ExplosionPreset(haptics)
  }
}
