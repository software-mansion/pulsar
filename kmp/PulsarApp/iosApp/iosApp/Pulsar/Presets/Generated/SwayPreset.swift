import UIKit
import Foundation

@objc public class SwayPreset : Player, Preset {
  public static let name: String = "Sway"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [20, 0.45], [250, 0.35], [500, 0.0], [700, 0.0], [720, 0.45], [950, 0.35], [1200, 0.0], [1400, 0.0], [1420, 0.45], [1650, 0.35], [1900, 0.0]],
        [[0, 0.22], [1900, 0.22]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.25],
        [700, 0.5, 0.25],
        [1400, 0.5, 0.25]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return SwayPreset(haptics)
  }
}
