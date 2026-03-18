import UIKit
import Foundation

@objc public class ConfirmPreset : Player, Preset {
  public static let name: String = "Confirm"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.55], [55, 0.0], [150, 0.55], [205, 0.0]],
        [[0, 0.5], [205, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.5],
        [150, 0.55, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ConfirmPreset(haptics)
  }
}
