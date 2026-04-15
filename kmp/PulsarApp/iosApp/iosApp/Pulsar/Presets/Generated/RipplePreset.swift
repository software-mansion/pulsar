import UIKit
import Foundation

@objc public class RipplePreset : Player, Preset {
  public static let name: String = "Ripple"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [70, 0.0], [145, 0.5], [200, 0.0], [265, 0.2], [310, 0.0], [365, 0.07], [420, 0.0]],
        [[0, 0.7], [140, 0.5], [260, 0.33], [420, 0.18]],
      ],
      rawDiscretePattern: [
        [0, 0.858, 0.72],
        [140, 0.52, 0.48],
        [260, 0.22, 0.32],
        [360, 0.08, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RipplePreset(haptics)
  }
}
