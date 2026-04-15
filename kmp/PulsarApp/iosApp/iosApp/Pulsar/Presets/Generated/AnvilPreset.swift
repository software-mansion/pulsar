import UIKit
import Foundation

@objc public class AnvilPreset : Player, Preset {
  public static let name: String = "Anvil"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 1.0], [60, 0.6], [150, 0.3], [300, 0.1], [500, 0.0]],
        [[0, 0.12], [5, 0.1], [500, 0.08]],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.15],
        [80, 0.5, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return AnvilPreset(haptics)
  }
}
