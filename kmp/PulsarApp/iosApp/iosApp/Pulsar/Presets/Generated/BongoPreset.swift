import UIKit
import Foundation

@objc public class BongoPreset : Player, Preset {
  public static let name: String = "Bongo"

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
        [299, 0.4, 0.4],
        [380, 0.394, 0.394],
        [451, 0.394, 0.394]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return BongoPreset(haptics)
  }
}
