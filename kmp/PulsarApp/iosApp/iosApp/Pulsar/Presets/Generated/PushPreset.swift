import UIKit
import Foundation

@objc public class PushPreset : Player, Preset {
  public static let name: String = "Push"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.48], [50, 0.15], [90, 0.0]],
        [[0, 0.52], [90, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.52]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PushPreset(haptics)
  }
}
