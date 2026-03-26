import UIKit
import Foundation

@objc public class LopePreset : Player, Preset {
  public static let name: String = "Lope"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.68], [60, 0.15], [80, 0.43], [140, 0.12], [160, 0.68], [220, 0.15], [240, 0.43], [300, 0.12], [320, 0.73], [450, 0.0]],
        [[0, 0.72], [450, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.7, 0.72],
        [80, 0.45, 0.65],
        [160, 0.7, 0.72],
        [240, 0.45, 0.65],
        [320, 0.75, 0.75]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LopePreset(haptics)
  }
}
