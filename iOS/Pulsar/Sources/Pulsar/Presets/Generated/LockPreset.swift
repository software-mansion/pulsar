import UIKit
import Foundation

@objc public class LockPreset : Player, Preset {
  public static let name: String = "Lock"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.25], [100, 0.15], [140, 0.0], [150, 0.9], [175, 0.2], [220, 0.0]],
        [[0, 0.4], [140, 0.5], [150, 0.75], [220, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.3, 0.5],
        [150, 0.9, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LockPreset(haptics)
  }
}
