import UIKit
import Foundation

@objc public class CombinationLockPreset : Player, Preset {
  public static let name: String = "CombinationLock"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.62], [25, 0.0], [180, 0.6], [201, 0.0], [360, 0.63], [381, 0.0], [540, 0.6], [561, 0.0], [720, 0.62], [741, 0.0], [900, 0.9], [935, 0.2], [980, 0.0]],
        [[0, 0.75], [900, 0.75], [980, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.62, 0.75],
        [180, 0.6, 0.75],
        [360, 0.63, 0.75],
        [540, 0.6, 0.75],
        [720, 0.62, 0.75],
        [900, 0.9, 0.72]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CombinationLockPreset(haptics)
  }
}
