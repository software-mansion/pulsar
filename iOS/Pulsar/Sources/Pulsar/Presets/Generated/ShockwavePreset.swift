import UIKit
import Foundation

@objc public class ShockwavePreset : Player, Preset {
  public static let name: String = "Shockwave"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 1.0], [50, 0.7], [120, 0.45], [200, 0.3], [320, 0.15], [450, 0.08], [600, 0.03], [800, 0.0]],
        [[0, 0.4], [5, 0.3], [800, 0.2]],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.35],
        [200, 0.4, 0.3],
        [450, 0.15, 0.25]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ShockwavePreset(haptics)
  }
}
