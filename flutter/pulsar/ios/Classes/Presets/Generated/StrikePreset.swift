import UIKit
import Foundation

@objc public class StrikePreset : Player, Preset {
  public static let name: String = "Strike"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.72], [40, 0.2], [80, 0.0]],
        [[0, 0.62], [80, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.75, 0.62]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return StrikePreset(haptics)
  }
}
