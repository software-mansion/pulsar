import UIKit
import Foundation

@objc public class LighthousePreset : Player, Preset {
  public static let name: String = "Lighthouse"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [15, 0.4], [150, 0.4], [250, 0.0], [400, 0.0], [415, 0.4], [550, 0.4], [650, 0.0], [800, 0.0], [815, 0.4], [950, 0.4], [1050, 0.0]],
        [[0, 0.5], [1050, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.45, 0.5],
        [400, 0.45, 0.5],
        [800, 0.45, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LighthousePreset(haptics)
  }
}
