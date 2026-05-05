import UIKit
import Foundation

@objc public class DronePreset : Player, Preset {
  public static let name: String = "Drone"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [20, 0.28], [180, 0.28], [280, 0.0], [500, 0.0], [520, 0.28], [680, 0.28], [780, 0.0], [1000, 0.0], [1020, 0.28], [1180, 0.28], [1280, 0.0], [1500, 0.0], [1520, 0.28], [1680, 0.28], [1780, 0.0]],
        [[0, 0.45], [1780, 0.45]],
      ],
      rawDiscretePattern: [
        [0, 0.3, 0.45],
        [500, 0.3, 0.45],
        [1000, 0.3, 0.45],
        [1500, 0.3, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DronePreset(haptics)
  }
}
