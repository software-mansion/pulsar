import UIKit
import Foundation

@objc public class CoilPreset : Player, Preset {
  public static let name: String = "Coil"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [50, 0.15], [200, 0.2], [400, 0.3], [570, 0.4], [590, 0.0], [600, 1.0], [650, 0.0]],
        [[0, 0.3], [570, 0.5], [600, 0.8], [650, 0.8]],
      ],
      rawDiscretePattern: [
        [0, 0.2, 0.4],
        [600, 1.0, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CoilPreset(haptics)
  }
}
