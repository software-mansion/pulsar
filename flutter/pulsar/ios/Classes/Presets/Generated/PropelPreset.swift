import UIKit
import Foundation

@objc public class PropelPreset : Player, Preset {
  public static let name: String = "Propel"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.55], [70, 0.2], [120, 0.88], [200, 0.2], [300, 0.0]],
        [[0, 0.56], [120, 0.72], [300, 0.65]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.58],
        [120, 0.9, 0.72]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PropelPreset(haptics)
  }
}
