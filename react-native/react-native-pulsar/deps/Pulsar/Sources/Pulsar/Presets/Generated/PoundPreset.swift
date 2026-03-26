import UIKit
import Foundation

@objc public class PoundPreset : Player, Preset {
  public static let name: String = "Pound"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.95], [65, 0.0], [100, 0.95], [165, 0.0], [200, 0.95], [265, 0.0]],
        [[0, 0.72], [265, 0.72]],
      ],
      rawDiscretePattern: [
        [0, 0.95, 0.7],
        [100, 0.95, 0.7],
        [200, 0.95, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PoundPreset(haptics)
  }
}
