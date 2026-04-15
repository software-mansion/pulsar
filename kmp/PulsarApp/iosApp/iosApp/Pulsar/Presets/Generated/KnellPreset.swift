import UIKit
import Foundation

@objc public class KnellPreset : Player, Preset {
  public static let name: String = "Knell"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.9], [200, 0.5], [300, 0.1], [350, 0.5], [430, 0.1], [550, 0.0]],
        [[0, 0.58], [300, 0.52], [550, 0.48]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.58],
        [350, 0.5, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return KnellPreset(haptics)
  }
}
