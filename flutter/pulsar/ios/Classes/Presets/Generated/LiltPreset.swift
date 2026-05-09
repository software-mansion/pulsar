import UIKit
import Foundation

@objc public class LiltPreset : Player, Preset {
  public static let name: String = "Lilt"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.45], [72, 0.0], [160, 0.65], [240, 0.12], [360, 0.0]],
        [[0, 0.5], [160, 0.65], [360, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.52],
        [160, 0.65, 0.65]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LiltPreset(haptics)
  }
}
