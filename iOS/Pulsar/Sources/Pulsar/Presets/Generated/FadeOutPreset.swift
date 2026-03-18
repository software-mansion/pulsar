import UIKit
import Foundation

@objc public class FadeOutPreset : Player, Preset {
  public static let name: String = "FadeOut"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0],
        [86, 0.8, 0.8],
        [192, 0.603, 0.603],
        [298, 0.406, 0.406],
        [408, 0.291, 0.209],
        [506, 0.297, 0.075]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FadeOutPreset(haptics)
  }
}
