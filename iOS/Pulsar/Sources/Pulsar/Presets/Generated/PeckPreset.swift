import UIKit
import Foundation

@objc public class PeckPreset : Player, Preset {
  public static let name: String = "Peck"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.55], [28, 0.0]],
        [[0, 0.58], [28, 0.56]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.58]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PeckPreset(haptics)
  }
}
