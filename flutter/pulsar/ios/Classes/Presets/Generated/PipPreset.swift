import UIKit
import Foundation

@objc public class PipPreset : Player, Preset {
  public static let name: String = "Pip"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.32], [40, 0.0], [60, 0.22], [100, 0.0]],
        [[0, 0.65], [100, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.35, 0.65],
        [60, 0.25, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PipPreset(haptics)
  }
}
