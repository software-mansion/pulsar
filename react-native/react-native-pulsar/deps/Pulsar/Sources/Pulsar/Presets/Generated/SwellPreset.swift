import UIKit
import Foundation

@objc public class SwellPreset : Player, Preset {
  public static let name: String = "Swell"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.45], [75, 0.0], [350, 0.65], [425, 0.0]],
        [[0, 0.45], [350, 0.52], [425, 0.52]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.48],
        [350, 0.65, 0.52]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SwellPreset(haptics)
  }
}
