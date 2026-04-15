import UIKit
import Foundation

@objc public class CanterPreset : Player, Preset {
  public static let name: String = "Canter"

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
        [173, 0.703, 0.244]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CanterPreset(haptics)
  }
}
