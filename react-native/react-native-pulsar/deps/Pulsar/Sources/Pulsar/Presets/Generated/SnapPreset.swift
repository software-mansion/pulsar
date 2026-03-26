import UIKit
import Foundation

@objc public class SnapPreset : Player, Preset {
  public static let name: String = "Snap"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.7], [30, 0.15], [40, 0.3], [90, 0.0]],
        [[0, 0.55], [40, 0.47], [90, 0.45]],
      ],
      rawDiscretePattern: [
        [0, 0.7, 0.55],
        [40, 0.3, 0.48]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SnapPreset(haptics)
  }
}
