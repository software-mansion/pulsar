import UIKit
import Foundation

@objc public class CatPawPreset : Player, Preset {
  public static let name: String = "CatPaw"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.6, 0.3],
        [75, 0.6, 0.08]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CatPawPreset(haptics)
  }
}
