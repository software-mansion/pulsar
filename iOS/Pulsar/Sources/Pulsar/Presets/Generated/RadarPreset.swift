import UIKit
import Foundation

@objc public class RadarPreset : Player, Preset {
  public static let name: String = "Radar"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.55], [50, 0.2], [120, 0.0], [800, 0.0], [806, 0.55], [850, 0.2], [920, 0.0], [1600, 0.0], [1606, 0.55], [1650, 0.2], [1720, 0.0], [2400, 0.0], [2406, 0.55], [2450, 0.2], [2520, 0.0]],
        [[0, 0.55], [2520, 0.55]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.55],
        [800, 0.55, 0.55],
        [1600, 0.55, 0.55],
        [2400, 0.55, 0.55]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RadarPreset(haptics)
  }
}
