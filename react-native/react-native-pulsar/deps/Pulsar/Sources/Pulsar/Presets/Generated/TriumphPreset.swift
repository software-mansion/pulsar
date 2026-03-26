import UIKit
import Foundation

@objc public class TriumphPreset : Player, Preset {
  public static let name: String = "Triumph"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.4], [70, 0.0], [120, 0.55], [180, 0.0], [260, 0.7], [320, 0.0], [420, 0.85], [480, 0.0], [600, 1.0], [660, 0.0], [750, 1.0], [810, 0.0], [900, 1.0], [980, 0.4], [1100, 0.0]],
        [[0, 0.5], [600, 0.75], [1100, 0.85]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.55],
        [120, 0.55, 0.6],
        [260, 0.7, 0.65],
        [420, 0.85, 0.7],
        [600, 1.0, 0.8],
        [750, 1.0, 0.8],
        [900, 1.0, 0.8]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TriumphPreset(haptics)
  }
}
