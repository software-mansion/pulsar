import UIKit
import Foundation

@objc public class FirmImpactPreset : Player, Preset {
  public static let name: String = "FirmImpact"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FirmImpactPreset(haptics)
  }
}
