import UIKit
import Foundation

@objc public class PlinkPreset : Player, Preset {
  public static let name: String = "Plink"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.55], [65, 0.0], [150, 0.55], [215, 0.0]],
        [[0, 0.52], [215, 0.52]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.52],
        [150, 0.55, 0.52]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PlinkPreset(haptics)
  }
}
