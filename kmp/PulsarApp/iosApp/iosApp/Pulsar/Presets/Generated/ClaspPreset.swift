import UIKit
import Foundation

@objc public class ClaspPreset : Player, Preset {
  public static let name: String = "Clasp"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.65], [45, 0.0], [80, 0.9], [130, 0.3], [220, 0.0]],
        [[0, 0.72], [80, 0.78], [220, 0.75]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.72],
        [80, 0.9, 0.78]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ClaspPreset(haptics)
  }
}
