import UIKit
import Foundation

@objc public class CadencePreset : Player, Preset {
  public static let name: String = "Cadence"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.809, 0.897],
        [199, 1.0, 0.413]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CadencePreset(haptics)
  }
}
