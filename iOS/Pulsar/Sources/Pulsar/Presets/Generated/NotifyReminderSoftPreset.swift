import UIKit
import Foundation

@objc public class NotifyReminderSoftPreset : Player, Preset {
  public static let name: String = "NotifyReminderSoft"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.45], [70, 0.15], [180, 0.0]],
        [[0, 0.42], [180, 0.38]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return NotifyReminderSoftPreset(haptics)
  }
}
