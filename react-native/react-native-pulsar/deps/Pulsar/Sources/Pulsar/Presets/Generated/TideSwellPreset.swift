import UIKit
import Foundation

@objc public class TideSwellPreset : Player, Preset {
  public static let name: String = "TideSwell"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.775, 0.053],
        [51, 0.722, 0.122],
        [100, 0.7, 0.228],
        [156, 0.653, 0.394],
        [208, 0.638, 0.613],
        [260, 0.622, 0.803],
        [309, 0.606, 1.0],
        [368, 0.6, 1.0],
        [420, 0.606, 0.8],
        [482, 0.609, 0.606],
        [549, 0.647, 0.394],
        [605, 0.684, 0.181],
        [670, 0.728, 0.075],
        [727, 0.775, 0.034]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TideSwellPreset(haptics)
  }
}
