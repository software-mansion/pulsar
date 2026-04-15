import UIKit
import Foundation

@objc public class BlipPreset : Player, Preset {
  public static let name: String = "Blip"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.5], [100, 0.35], [200, 0.0]],
        [[0, 0.6], [200, 0.58]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.6]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BlipPreset(haptics)
  }
}
