import UIKit
import Foundation

@objc public class GavelPreset : Player, Preset {
  public static let name: String = "Gavel"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.106],
        [201, 1.0, 0.609]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return GavelPreset(haptics)
  }
}
