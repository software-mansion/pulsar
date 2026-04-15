import UIKit
import Foundation

@objc public class FeatherPreset : Player, Preset {
  public static let name: String = "Feather"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.45], [70, 0.15], [180, 0.0]],
        [[0, 0.42], [180, 0.38]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FeatherPreset(haptics)
  }
}
