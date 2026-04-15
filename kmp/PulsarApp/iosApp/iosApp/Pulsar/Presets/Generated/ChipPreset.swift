import UIKit
import Foundation

@objc public class ChipPreset : Player, Preset {
  public static let name: String = "Chip"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.75, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ChipPreset(haptics)
  }
}
