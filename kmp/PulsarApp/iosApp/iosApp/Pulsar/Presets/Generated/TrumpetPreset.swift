import UIKit
import Foundation

@objc public class TrumpetPreset : Player, Preset {
  public static let name: String = "Trumpet"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.3], [40, 0.0], [80, 0.4], [110, 0.0], [150, 0.5], [175, 0.0], [210, 0.6], [232, 0.0], [260, 0.7], [278, 0.0], [310, 1.0], [380, 0.6], [460, 0.0]],
        [[0, 0.4], [310, 0.7], [460, 0.9]],
      ],
      rawDiscretePattern: [
        [0, 0.3, 0.5],
        [80, 0.4, 0.55],
        [150, 0.5, 0.6],
        [210, 0.6, 0.65],
        [260, 0.7, 0.7],
        [310, 1.0, 0.85]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TrumpetPreset(haptics)
  }
}
