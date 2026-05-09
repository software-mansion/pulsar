import UIKit
import Foundation

@objc public class PokePreset : Player, Preset {
  public static let name: String = "Poke"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.6], [62, 0.0], [100, 0.6], [162, 0.0], [200, 0.7], [280, 0.0]],
        [[0, 0.6], [200, 0.65], [280, 0.63]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.6],
        [100, 0.6, 0.6],
        [200, 0.7, 0.65]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PokePreset(haptics)
  }
}
