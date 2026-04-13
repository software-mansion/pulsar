import UIKit
import Foundation

@objc public class ChimePreset : Player, Preset {
  public static let name: String = "Chime"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.5], [70, 0.08], [150, 0.0], [180, 0.7], [260, 0.12], [380, 0.0]],
        [[0, 0.48], [150, 0.48], [180, 0.65], [380, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.5],
        [180, 0.7, 0.65]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ChimePreset(haptics)
  }
}
