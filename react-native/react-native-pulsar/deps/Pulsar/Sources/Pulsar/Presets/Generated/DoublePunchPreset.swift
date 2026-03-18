import UIKit
import Foundation

@objc public class DoublePunchPreset : Player, Preset {
  public static let name: String = "DoublePunch"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.397],
        [73, 1.0, 0.397]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DoublePunchPreset(haptics)
  }
}
