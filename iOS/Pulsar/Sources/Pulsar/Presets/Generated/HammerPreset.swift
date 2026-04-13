import UIKit
import Foundation

@objc public class HammerPreset : Player, Preset {
  public static let name: String = "Hammer"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.75], [90, 0.05], [180, 0.0], [220, 0.8], [310, 0.05], [380, 0.0], [420, 0.88], [508, 0.05], [550, 0.0], [590, 0.92], [678, 0.05], [710, 0.0], [740, 1.0], [816, 0.05], [840, 0.0], [870, 1.0], [950, 0.05], [1050, 0.0]],
        [[0, 0.28], [1050, 0.28]],
      ],
      rawDiscretePattern: [
        [0, 0.75, 0.3],
        [220, 0.8, 0.32],
        [420, 0.88, 0.3],
        [590, 0.92, 0.32],
        [740, 1.0, 0.3],
        [870, 1.0, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return HammerPreset(haptics)
  }
}
