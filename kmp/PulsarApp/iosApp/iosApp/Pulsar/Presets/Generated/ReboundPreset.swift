import UIKit
import Foundation

@objc public class ReboundPreset : Player, Preset {
  public static let name: String = "Rebound"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0],
        [80, 1.0, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ReboundPreset(haptics)
  }
}
