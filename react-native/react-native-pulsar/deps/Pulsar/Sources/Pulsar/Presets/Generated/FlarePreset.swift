import UIKit
import Foundation

@objc public class FlarePreset : Player, Preset {
  public static let name: String = "Flare"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [20, 0.18], [60, 0.52], [90, 0.95], [100, 1.0], [120, 0.75], [140, 0.65], [200, 0.35], [380, 0.0]],
        [[0, 0.7], [60, 0.82], [100, 0.92], [200, 0.75], [380, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.2, 0.7],
        [60, 0.55, 0.8],
        [100, 1.0, 0.9],
        [140, 0.7, 0.85],
        [200, 0.4, 0.75]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FlarePreset(haptics)
  }
}
