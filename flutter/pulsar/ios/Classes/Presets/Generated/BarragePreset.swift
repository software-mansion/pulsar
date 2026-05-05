import UIKit
import Foundation

@objc public class BarragePreset : Player, Preset {
  public static let name: String = "Barrage"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.994, 0.994],
        [51, 0.994, 0.994],
        [100, 0.991, 0.991],
        [156, 1.0, 1.0],
        [208, 0.991, 0.991],
        [260, 1.0, 1.0],
        [309, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BarragePreset(haptics)
  }
}
