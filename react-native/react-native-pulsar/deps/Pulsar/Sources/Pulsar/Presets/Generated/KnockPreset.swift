import UIKit
import Foundation

@objc public class KnockPreset : Player, Preset {
  public static let name: String = "Knock"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.65], [70, 0.08], [200, 0.0], [280, 0.65], [348, 0.08], [480, 0.0], [560, 0.65], [628, 0.08], [760, 0.0]],
        [[0, 0.32], [760, 0.32]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.35],
        [280, 0.65, 0.35],
        [560, 0.65, 0.35]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return KnockPreset(haptics)
  }
}
