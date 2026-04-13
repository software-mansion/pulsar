import UIKit
import Foundation

@objc public class TidalSurgePreset : Player, Preset {
  public static let name: String = "TidalSurge"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.594, 0.594],
        [73, 0.588, 0.588],
        [151, 0.588, 0.588],
        [299, 1.0, 0.3],
        [380, 1.0, 0.303],
        [455, 1.0, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TidalSurgePreset(haptics)
  }
}
