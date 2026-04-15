import UIKit
import Foundation

@objc public class SummonPreset : Player, Preset {
  public static let name: String = "Summon"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.8], [180, 0.0], [300, 0.7], [370, 0.0], [430, 0.7], [500, 0.0]],
        [[0, 0.52], [180, 0.52], [300, 0.62], [500, 0.62]],
      ],
      rawDiscretePattern: [
        [0, 0.8, 0.55],
        [300, 0.7, 0.6],
        [430, 0.7, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SummonPreset(haptics)
  }
}
