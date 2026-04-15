import UIKit
import Foundation

@objc public class BreakingWavePreset : Player, Preset {
  public static let name: String = "BreakingWave"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.497, 0.497],
        [89, 0.497, 0.497],
        [202, 1.0, 0.1]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BreakingWavePreset(haptics)
  }
}
