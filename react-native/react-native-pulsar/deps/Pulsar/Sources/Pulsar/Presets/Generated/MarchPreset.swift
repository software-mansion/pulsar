import UIKit
import Foundation

@objc public class MarchPreset : Player, Preset {
  public static let name: String = "March"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.6], [150, 0.45], [250, 0.0], [300, 0.0], [315, 0.65], [450, 0.5], [550, 0.0], [600, 0.0], [615, 0.6], [750, 0.4], [900, 0.0]],
        [[0, 0.25], [900, 0.25]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.28],
        [300, 0.7, 0.28],
        [600, 0.65, 0.28]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return MarchPreset(haptics)
  }
}
