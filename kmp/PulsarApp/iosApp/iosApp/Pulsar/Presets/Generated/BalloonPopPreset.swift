import UIKit
import Foundation

@objc public class BalloonPopPreset : Player, Preset {
  public static let name: String = "BalloonPop"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [50, 0.1], [200, 0.0], [300, 0.15], [500, 0.0], [600, 0.25], [800, 0.0], [900, 0.35], [1100, 0.0], [1200, 0.5], [1380, 0.0], [1400, 1.0], [1440, 0.6], [1550, 0.1], [1700, 0.0]],
        [[0, 0.2], [1380, 0.5], [1400, 1.0], [1700, 0.3]],
      ],
      rawDiscretePattern: [
        [0, 0.1, 0.3],
        [300, 0.2, 0.35],
        [600, 0.3, 0.4],
        [900, 0.45, 0.45],
        [1200, 0.6, 0.5],
        [1400, 1.0, 0.9]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BalloonPopPreset(haptics)
  }
}
