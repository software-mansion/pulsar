import UIKit
import Foundation

@objc public class NotifyWarnMildPreset : Player, Preset {
  public static let name: String = "NotifyWarnMild"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.65], [75, 0.05], [200, 0.3], [290, 0.0]],
        [[0, 0.6], [200, 0.48], [290, 0.45]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.6],
        [200, 0.3, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return NotifyWarnMildPreset(haptics)
  }
}
