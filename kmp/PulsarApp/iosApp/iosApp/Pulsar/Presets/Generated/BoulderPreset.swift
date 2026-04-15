import UIKit
import Foundation

@objc public class BoulderPreset : Player, Preset {
  public static let name: String = "Boulder"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BoulderPreset(haptics)
  }
}
