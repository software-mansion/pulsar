import UIKit
import Foundation

@objc public class FinalePreset : Player, Preset {
  public static let name: String = "Finale"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.7], [75, 0.0], [200, 0.7], [275, 0.0], [400, 0.9], [520, 0.3], [680, 0.0]],
        [[0, 0.55], [400, 0.65], [680, 0.6]],
      ],
      rawDiscretePattern: [
        [400, 0.9, 0.65]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FinalePreset(haptics)
  }
}
