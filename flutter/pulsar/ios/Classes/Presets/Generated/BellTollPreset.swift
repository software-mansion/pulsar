import UIKit
import Foundation

@objc public class BellTollPreset : Player, Preset {
  public static let name: String = "BellToll"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.903],
        [201, 1.0, 0.513],
        [399, 0.997, 0.147]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BellTollPreset(haptics)
  }
}
