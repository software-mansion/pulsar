import UIKit
import Foundation

@objc public class TripleDrumPreset : Player, Preset {
  public static let name: String = "TripleDrum"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.106],
        [201, 1.0, 0.109],
        [398, 0.997, 0.103]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TripleDrumPreset(haptics)
  }
}
