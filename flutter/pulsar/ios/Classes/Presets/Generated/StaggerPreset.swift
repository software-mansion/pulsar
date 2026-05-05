import UIKit
import Foundation

@objc public class StaggerPreset : Player, Preset {
  public static let name: String = "Stagger"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.68], [45, 0.15], [60, 0.38], [100, 0.15], [120, 0.52], [162, 0.12], [180, 0.33], [320, 0.0]],
        [[0, 0.55], [60, 0.65], [120, 0.5], [180, 0.6], [320, 0.55]],
      ],
      rawDiscretePattern: [
        [0, 0.7, 0.55],
        [60, 0.4, 0.65],
        [120, 0.55, 0.5],
        [180, 0.35, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return StaggerPreset(haptics)
  }
}
