import UIKit
import Foundation

@objc public class PingPreset : Player, Preset {
  public static let name: String = "Ping"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.65], [35, 0.0]],
        [[0, 0.72], [35, 0.68]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.72]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PingPreset(haptics)
  }
}
