import UIKit
import Foundation

@objc public class PummelPreset : Player, Preset {
  public static let name: String = "Pummel"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.9], [45, 0.6], [70, 0.78], [100, 0.55], [130, 0.92], [165, 0.65], [190, 0.82], [230, 0.7], [250, 1.0], [320, 0.4], [450, 0.0]],
        [[0, 0.85], [450, 0.82]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.85],
        [70, 0.75, 0.82],
        [130, 0.95, 0.87],
        [190, 0.8, 0.83],
        [250, 1.0, 0.88]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PummelPreset(haptics)
  }
}
