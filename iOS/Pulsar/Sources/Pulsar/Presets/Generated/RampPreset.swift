import UIKit
import Foundation

@objc public class RampPreset : Player, Preset {
  public static let name: String = "Ramp"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.38], [80, 0.0], [120, 0.55], [190, 0.0], [240, 0.72], [310, 0.0], [380, 1.0], [520, 0.2], [650, 0.0]],
        [[0, 0.48], [380, 0.78], [650, 0.75]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.5],
        [120, 0.6, 0.6],
        [240, 0.8, 0.7],
        [380, 1.0, 0.8]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RampPreset(haptics)
  }
}
