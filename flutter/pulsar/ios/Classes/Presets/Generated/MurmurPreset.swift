import UIKit
import Foundation

@objc public class MurmurPreset : Player, Preset {
  public static let name: String = "Murmur"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.303],
        [80, 0.6, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return MurmurPreset(haptics)
  }
}
