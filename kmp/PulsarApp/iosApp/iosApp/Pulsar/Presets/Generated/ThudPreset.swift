import UIKit
import Foundation

@objc public class ThudPreset : Player, Preset {
  public static let name: String = "Thud"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.45], [80, 0.35], [160, 0.0]],
        [[0, 0.42], [160, 0.4]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.42]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ThudPreset(haptics)
  }
}
