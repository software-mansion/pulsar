import UIKit
import Foundation

@objc public class StoneSkipPreset : Player, Preset {
  public static let name: String = "StoneSkip"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.706, 0.706],
        [77, 0.697, 0.5],
        [181, 0.703, 0.244]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return StoneSkipPreset(haptics)
  }
}
