import UIKit
import Foundation

@objc public class JoltPreset : Player, Preset {
  public static let name: String = "Jolt"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return JoltPreset(haptics)
  }
}
