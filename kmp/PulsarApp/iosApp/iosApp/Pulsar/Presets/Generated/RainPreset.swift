import UIKit
import Foundation

@objc public class RainPreset : Player, Preset {
  public static let name: String = "Rain"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [50, 0.08], [200, 0.05], [400, 0.08], [600, 0.05], [850, 0.08], [950, 0.0]],
        [[0, 0.6], [950, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.2, 0.6],
        [80, 0.15, 0.5],
        [150, 0.3, 0.7],
        [210, 0.1, 0.5],
        [310, 0.25, 0.6],
        [380, 0.2, 0.55],
        [460, 0.35, 0.65],
        [520, 0.1, 0.5],
        [610, 0.2, 0.6],
        [700, 0.15, 0.55],
        [760, 0.3, 0.7],
        [850, 0.2, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RainPreset(haptics)
  }
}
