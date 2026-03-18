import UIKit
import Foundation

@objc public class DoublePulsePreset : Player, Preset {
  public static let name: String = "DoublePulse"

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
    return DoublePulsePreset(haptics)
  }
}
