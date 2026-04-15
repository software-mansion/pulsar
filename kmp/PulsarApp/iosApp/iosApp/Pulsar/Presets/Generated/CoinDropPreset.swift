import UIKit
import Foundation

@objc public class CoinDropPreset : Player, Preset {
  public static let name: String = "CoinDrop"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.5], [35, 0.0], [120, 0.7], [145, 0.0], [210, 0.4], [230, 0.0], [300, 0.8], [325, 0.0], [380, 0.35], [397, 0.0], [460, 0.6], [480, 0.0], [520, 0.9], [550, 0.0], [590, 0.45], [608, 0.0], [650, 0.7], [675, 0.0]],
        [[0, 0.8], [675, 0.9]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.8],
        [120, 0.7, 0.85],
        [210, 0.4, 0.75],
        [300, 0.8, 0.9],
        [380, 0.35, 0.7],
        [460, 0.6, 0.8],
        [520, 0.9, 0.9],
        [590, 0.45, 0.75],
        [650, 0.7, 0.85]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CoinDropPreset(haptics)
  }
}
