import UIKit
import Foundation

@objc public class PealPreset : Player, Preset {
  public static let name: String = "Peal"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.75], [80, 0.0], [180, 0.75], [258, 0.0], [360, 0.75], [438, 0.0]],
        [[0, 0.62], [438, 0.62]],
      ],
      rawDiscretePattern: [
        [0, 0.75, 0.62],
        [180, 0.75, 0.62],
        [360, 0.75, 0.62]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PealPreset(haptics)
  }
}
