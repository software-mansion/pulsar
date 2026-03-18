import UIKit
import Foundation

@objc public class CrescendoPreset : Player, Preset {
  public static let name: String = "Crescendo"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.303, 0.303],
        [99, 0.397, 0.397],
        [202, 0.506, 0.506],
        [300, 0.609, 0.609],
        [399, 0.703, 0.703],
        [502, 0.809, 0.809],
        [601, 0.981, 0.981]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CrescendoPreset(haptics)
  }
}
