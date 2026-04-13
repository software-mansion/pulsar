import UIKit
import Foundation

@objc public class FlourishPreset : Player, Preset {
  public static let name: String = "Flourish"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [50, 0.2], [200, 0.65], [380, 0.95], [480, 0.5], [650, 0.0]],
        [[0, 0.43], [380, 0.78], [650, 0.65]],
      ],
      rawDiscretePattern: [
        [0, 0.25, 0.45],
        [200, 0.7, 0.65],
        [380, 0.95, 0.78],
        [500, 0.6, 0.62],
        [584, 0.628, 0.628],
        [682, 0.6, 0.6],
        [754, 0.456, 0.456],
        [827, 0.303, 0.303],
        [917, 0.2, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FlourishPreset(haptics)
  }
}
