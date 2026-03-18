import UIKit
import Foundation

@objc public class SparkPreset : Player, Preset {
  public static let name: String = "Spark"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.22], [28, 0.0], [69, 0.52], [95, 0.0], [142, 1.0], [185, 0.0]],
        [[0, 0.5], [65, 0.75], [138, 1.0], [185, 1.0]],
      ],
      rawDiscretePattern: [
        [0, 0.22, 0.55],
        [65, 0.52, 0.78],
        [138, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SparkPreset(haptics)
  }
}
