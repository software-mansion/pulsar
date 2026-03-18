import UIKit
import Foundation

@objc public class DoubleClickPreset : Player, Preset {
  public static let name: String = "DoubleClick"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 1.0, 0.897],
        [199, 1.0, 0.9]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DoubleClickPreset(haptics)
  }
}
