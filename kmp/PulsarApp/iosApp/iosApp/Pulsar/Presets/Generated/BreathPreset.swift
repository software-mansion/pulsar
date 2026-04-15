import UIKit
import Foundation

@objc public class BreathPreset : Player, Preset {
  public static let name: String = "Breath"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [800, 0.5], [1600, 0.05], [2400, 0.5], [3200, 0.0]],
        [[0, 0.15], [800, 0.25], [1600, 0.1], [2400, 0.25], [3200, 0.15]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BreathPreset(haptics)
  }
}
