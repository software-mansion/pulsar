import UIKit
import Foundation

@objc public class RapPreset : Player, Preset {
  public static let name: String = "Rap"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.5],
        [120, 0.4, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RapPreset(haptics)
  }
}
