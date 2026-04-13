import UIKit
import Foundation

@objc public class WaterfallPreset : Player, Preset {
  public static let name: String = "Waterfall"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.994, 0.994],
        [51, 0.994, 0.806],
        [100, 0.991, 0.597],
        [156, 1.0, 0.394],
        [208, 0.991, 0.203],
        [260, 1.0, 0.094],
        [309, 1.0, 0.072]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return WaterfallPreset(haptics)
  }
}
