import UIKit
import Foundation

@objc public class NudgePreset : Player, Preset {
  public static let name: String = "Nudge"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.6], [60, 0.0], [120, 0.4], [180, 0.0]],
        [[0, 0.5], [180, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.5],
        [120, 0.4, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return NudgePreset(haptics)
  }
}
