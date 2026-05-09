import UIKit
import Foundation

@objc public class SonarPreset : Player, Preset {
  public static let name: String = "Sonar"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.35], [130, 0.04], [500, 0.0], [600, 0.35], [730, 0.04], [1100, 0.0], [1200, 0.35], [1330, 0.04], [1550, 0.0], [1620, 0.0], [1663, 0.855], [1700, 0.0], [1800, 0.65], [1855, 0.0], [1920, 0.4], [2000, 0.0]],
        [[0, 0.72], [1550, 0.72], [1655, 0.8], [2000, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.35, 0.7],
        [600, 0.35, 0.7],
        [1200, 0.35, 0.7],
        [1800, 0.65, 0.65],
        [1920, 0.4, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SonarPreset(haptics)
  }
}
