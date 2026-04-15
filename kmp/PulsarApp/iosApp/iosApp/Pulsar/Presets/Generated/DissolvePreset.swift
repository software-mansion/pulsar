import UIKit
import Foundation

@objc public class DissolvePreset : Player, Preset {
  public static let name: String = "Dissolve"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [50, 0.38], [300, 0.28], [600, 0.2], [900, 0.12], [1200, 0.0]],
        [[0, 0.38], [1200, 0.18]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.4],
        [400, 0.25, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DissolvePreset(haptics)
  }
}
