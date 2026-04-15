import UIKit
import Foundation

@objc public class HeartbeatPreset : Player, Preset {
  public static let name: String = "Heartbeat"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.8], [80, 0.0], [120, 0.5], [200, 0.0], [800, 0.0], [810, 0.8], [880, 0.0], [920, 0.5], [1000, 0.0]],
        [[0, 0.2], [1000, 0.2]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.2],
        [120, 0.6, 0.2],
        [800, 0.9, 0.2],
        [920, 0.6, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return HeartbeatPreset(haptics)
  }
}
