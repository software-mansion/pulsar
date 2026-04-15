import UIKit
import Foundation

@objc public class TriggerPreset : Player, Preset {
  public static let name: String = "Trigger"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 1.0], [55, 0.35], [80, 0.5], [140, 0.2], [200, 0.25], [280, 0.0]],
        [[0, 0.72], [80, 0.55], [280, 0.42]],
      ],
      rawDiscretePattern: [
        [0, 0.872, 0.7],
        [80, 0.5, 0.55],
        [200, 0.25, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TriggerPreset(haptics)
  }
}
