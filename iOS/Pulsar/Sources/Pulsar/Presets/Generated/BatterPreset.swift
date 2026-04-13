import UIKit
import Foundation

@objc public class BatterPreset : Player, Preset {
  public static let name: String = "Batter"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.9], [45, 0.35], [60, 0.8], [102, 0.32], [120, 0.93], [158, 0.35], [175, 0.83], [208, 0.38], [225, 1.0], [380, 0.0]],
        [[0, 0.35], [225, 0.38], [380, 0.32]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.35],
        [60, 0.82, 0.32],
        [120, 0.95, 0.36],
        [175, 0.85, 0.33],
        [225, 1.0, 0.38]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BatterPreset(haptics)
  }
}
