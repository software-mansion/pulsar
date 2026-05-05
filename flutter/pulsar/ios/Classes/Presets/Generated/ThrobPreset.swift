import UIKit
import Foundation

@objc public class ThrobPreset : Player, Preset {
  public static let name: String = "Throb"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.8], [80, 0.0], [150, 0.45], [230, 0.0]],
        [[0, 0.65], [230, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.8, 0.65],
        [150, 0.45, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ThrobPreset(haptics)
  }
}
