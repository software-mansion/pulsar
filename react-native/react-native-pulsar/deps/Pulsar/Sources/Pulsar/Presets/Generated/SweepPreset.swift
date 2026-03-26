import UIKit
import Foundation

@objc public class SweepPreset : Player, Preset {
  public static let name: String = "Sweep"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.4], [120, 0.05], [400, 0.02], [590, 0.0], [600, 0.4], [720, 0.05], [1000, 0.02], [1190, 0.0], [1200, 0.4], [1320, 0.05], [1600, 0.02], [1790, 0.0], [1800, 0.4], [1920, 0.05], [2100, 0.0]],
        [[0, 0.72], [2100, 0.72]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.7],
        [600, 0.4, 0.7],
        [1200, 0.4, 0.7],
        [1800, 0.4, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SweepPreset(haptics)
  }
}
