import UIKit
import Foundation

@objc public class CleavePreset : Player, Preset {
  public static let name: String = "Cleave"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.85], [65, 0.0], [100, 0.7], [165, 0.2], [250, 0.0]],
        [[0, 0.8], [250, 0.76]],
      ],
      rawDiscretePattern: [
        [0, 0.85, 0.8],
        [100, 0.7, 0.78]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CleavePreset(haptics)
  }
}
