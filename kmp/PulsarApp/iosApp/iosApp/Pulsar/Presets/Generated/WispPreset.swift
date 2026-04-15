import UIKit
import Foundation

@objc public class WispPreset : Player, Preset {
  public static let name: String = "Wisp"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.22], [60, 0.0]],
        [[0, 0.48], [60, 0.48]],
      ],
      rawDiscretePattern: [
        [0, 0.25, 0.48]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return WispPreset(haptics)
  }
}
