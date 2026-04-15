import UIKit
import Foundation

@objc public class RatchetPreset : Player, Preset {
  public static let name: String = "Ratchet"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.9],
        [201, 1.0, 0.906],
        [398, 0.997, 0.906]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RatchetPreset(haptics)
  }
}
