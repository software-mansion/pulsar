import UIKit
import Foundation

@objc public class SurgePreset : Player, Preset {
  public static let name: String = "Surge"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.45], [60, 0.1], [75, 0.58], [130, 0.12], [145, 0.7], [195, 0.15], [210, 0.8], [330, 0.0]],
        [[0, 0.82], [210, 0.93], [330, 0.9]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.82],
        [75, 0.62, 0.86],
        [145, 0.74, 0.9],
        [210, 0.8, 0.92]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SurgePreset(haptics)
  }
}
