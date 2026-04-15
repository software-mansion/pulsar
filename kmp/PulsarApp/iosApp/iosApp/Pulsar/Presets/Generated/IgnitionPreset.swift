import UIKit
import Foundation

@objc public class IgnitionPreset : Player, Preset {
  public static let name: String = "Ignition"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 1.0, 0.203],
        [77, 0.697, 0.5],
        [173, 1.0, 0.703]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return IgnitionPreset(haptics)
  }
}
