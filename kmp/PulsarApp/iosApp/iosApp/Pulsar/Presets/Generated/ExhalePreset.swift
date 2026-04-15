import UIKit
import Foundation

@objc public class ExhalePreset : Player, Preset {
  public static let name: String = "Exhale"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.6], [100, 0.4], [200, 0.25], [500, 0.2], [800, 0.15], [1200, 0.0]],
        [[0, 0.6], [200, 0.28], [1200, 0.15]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.6],
        [150, 0.35, 0.3],
        [500, 0.2, 0.15]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ExhalePreset(haptics)
  }
}
