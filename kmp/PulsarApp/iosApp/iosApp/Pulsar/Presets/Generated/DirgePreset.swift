import UIKit
import Foundation

@objc public class DirgePreset : Player, Preset {
  public static let name: String = "Dirge"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [30, 0.4], [300, 0.2], [700, 0.0], [900, 0.0], [930, 0.38], [1200, 0.18], [1700, 0.0], [1900, 0.0], [1930, 0.32], [2200, 0.12], [2600, 0.0]],
        [[0, 0.14], [2600, 0.11]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.15],
        [900, 0.4, 0.13],
        [1900, 0.35, 0.12]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DirgePreset(haptics)
  }
}
