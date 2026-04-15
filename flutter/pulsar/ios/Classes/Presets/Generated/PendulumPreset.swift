import UIKit
import Foundation

@objc public class PendulumPreset : Player, Preset {
  public static let name: String = "Pendulum"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.7], [300, 0.08], [600, 0.5], [900, 0.05], [1200, 0.3], [1500, 0.03], [1800, 0.15], [2100, 0.01], [2400, 0.0]],
        [[0, 0.42], [2400, 0.38]],
      ],
      rawDiscretePattern: [
        [300, 0.12, 0.35],
        [900, 0.08, 0.35],
        [1500, 0.05, 0.35],
        [2100, 0.02, 0.35]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PendulumPreset(haptics)
  }
}
