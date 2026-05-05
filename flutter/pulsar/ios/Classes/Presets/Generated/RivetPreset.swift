import UIKit
import Foundation

@objc public class RivetPreset : Player, Preset {
  public static let name: String = "Rivet"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0],
        [75, 1.0, 1.0],
        [150, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return RivetPreset(haptics)
  }
}
