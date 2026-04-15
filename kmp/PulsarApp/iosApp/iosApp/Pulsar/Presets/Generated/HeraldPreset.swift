import UIKit
import Foundation

@objc public class HeraldPreset : Player, Preset {
  public static let name: String = "Herald"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.497, 0.497],
        [89, 0.497, 0.497],
        [208, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return HeraldPreset(haptics)
  }
}
