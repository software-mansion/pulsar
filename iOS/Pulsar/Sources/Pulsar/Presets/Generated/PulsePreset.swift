import UIKit
import Foundation

@objc public class PulsePreset : Player, Preset {
  public static let name: String = "Pulse"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [300, 0.3], [700, 0.3], [1000, 0.0], [1300, 0.3], [1700, 0.3], [2000, 0.0]],
        [[0, 0.4], [2000, 0.4]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PulsePreset(haptics)
  }
}
