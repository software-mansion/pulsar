import UIKit
import Foundation

@objc public class FlurryPreset : Player, Preset {
  public static let name: String = "Flurry"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.45], [40, 0.0], [60, 0.55], [95, 0.0], [115, 0.65], [148, 0.0], [165, 0.82], [240, 0.1], [300, 0.0]],
        [[0, 0.55], [165, 0.72], [300, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.55],
        [60, 0.6, 0.6],
        [115, 0.7, 0.65],
        [165, 0.85, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FlurryPreset(haptics)
  }
}
