import UIKit
import Foundation

@objc public class GlitchPreset : Player, Preset {
  public static let name: String = "Glitch"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.9], [20, 0.1], [55, 1.0], [65, 0.0], [100, 0.85], [118, 0.0], [160, 0.95], [175, 0.15], [220, 0.0]],
        [[0, 0.9], [20, 0.2], [55, 1.0], [65, 0.1], [100, 0.88], [118, 0.15], [160, 0.92], [220, 0.3]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.9],
        [30, 0.2, 0.3],
        [55, 1.0, 0.95],
        [70, 0.1, 0.2],
        [100, 0.85, 0.85],
        [130, 0.05, 0.1],
        [160, 0.95, 0.9],
        [185, 0.3, 0.4]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return GlitchPreset(haptics)
  }
}
