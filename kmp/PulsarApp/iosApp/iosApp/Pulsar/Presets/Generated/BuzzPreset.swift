import UIKit
import Foundation

@objc public class BuzzPreset : Player, Preset {
  public static let name: String = "Buzz"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.9], [100, 0.85], [150, 0.65], [250, 0.3], [350, 0.0]],
        [[0, 0.85], [350, 0.8]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.85]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BuzzPreset(haptics)
  }
}
