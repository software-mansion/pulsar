import UIKit
import Foundation

@objc public class ChargePreset : Player, Preset {
  public static let name: String = "Charge"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.62], [100, 0.35], [200, 0.0], [900, 0.0], [905, 0.85], [980, 0.5], [1100, 0.35], [1250, 0.0], [1600, 0.0], [1603, 1.0], [1770, 1.0], [1873, 0.334], [2046, 0.0]],
        [[0, 0.62], [200, 0.6], [900, 0.68], [1250, 0.65], [1600, 0.82], [1680, 0.7], [1860, 0.6]],
      ],
      rawDiscretePattern: [
        [0, 0.65, 0.62],
        [900, 0.85, 0.68],
        [1600, 1.0, 0.82]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ChargePreset(haptics)
  }
}
