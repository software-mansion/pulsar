import UIKit
import Foundation

@objc public class ImpactPreset : Player, Preset {
  public static let name: String = "Impact"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.85], [60, 0.35], [120, 0.15], [200, 0.0]],
        [[0, 0.6], [200, 0.35]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.6],
        [80, 0.5, 0.5],
        [150, 0.25, 0.4]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ImpactPreset(haptics)
  }
}
