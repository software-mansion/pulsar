import UIKit
import Foundation

@objc public class WobblePreset : Player, Preset {
  public static let name: String = "Wobble"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.65], [80, 0.5], [180, 0.0]],
        [[0, 0.82], [180, 0.75]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return WobblePreset(haptics)
  }
}
