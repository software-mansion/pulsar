import UIKit
import Foundation

@objc public class GuitarStrumPreset : Player, Preset {
  public static let name: String = "GuitarStrum"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.9], [60, 0.65], [200, 0.45], [450, 0.28], [750, 0.14], [1100, 0.05], [1400, 0.0]],
        [[0, 0.58], [5, 0.55], [1400, 0.52]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.55]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return GuitarStrumPreset(haptics)
  }
}
