import UIKit
import Foundation

@objc public class MaxImpactPreset : Player, Preset {
  public static let name: String = "MaxImpact"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return MaxImpactPreset(haptics)
  }
}
