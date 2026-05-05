import UIKit
import Foundation

@objc public class BuildupPreset : Player, Preset {
  public static let name: String = "Buildup"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.994, 0.053],
        [51, 0.994, 0.122],
        [100, 0.991, 0.228],
        [156, 1.0, 0.394],
        [208, 0.991, 0.613],
        [260, 1.0, 0.803],
        [309, 1.0, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BuildupPreset(haptics)
  }
}
