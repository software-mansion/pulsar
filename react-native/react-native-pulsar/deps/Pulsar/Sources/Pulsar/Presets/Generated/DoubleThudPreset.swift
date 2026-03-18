import UIKit
import Foundation

@objc public class DoubleThudPreset : Player, Preset {
  public static let name: String = "DoubleThud"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.509],
        [71, 1.0, 0.069]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DoubleThudPreset(haptics)
  }
}
