import UIKit
import Foundation

@objc public class TypewriterPreset : Player, Preset {
  public static let name: String = "Typewriter"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.85], [40, 0.3], [55, 0.38], [90, 0.12], [110, 0.15], [160, 0.04], [200, 0.0]],
        [[0, 0.42], [55, 0.38], [200, 0.34]],
      ],
      rawDiscretePattern: [
        [0, 0.88, 0.42],
        [55, 0.35, 0.38],
        [110, 0.12, 0.35]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TypewriterPreset(haptics)
  }
}
