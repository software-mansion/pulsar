import UIKit
import Foundation

@objc public class LatchPreset : Player, Preset {
  public static let name: String = "Latch"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.72], [60, 0.15], [100, 0.38], [170, 0.08], [230, 0.0]],
        [[0, 0.68], [100, 0.45], [230, 0.42]],
      ],
      rawDiscretePattern: [
        [0, 0.75, 0.68],
        [100, 0.4, 0.45]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LatchPreset(haptics)
  }
}
