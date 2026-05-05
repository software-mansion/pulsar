import UIKit
import Foundation

@objc public class FanfarePreset : Player, Preset {
  public static let name: String = "Fanfare"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.6], [80, 0.0], [130, 0.7], [200, 0.0], [250, 0.8], [315, 0.0], [360, 1.0], [460, 0.5], [580, 0.0]],
        [[0, 0.38], [130, 0.52], [250, 0.62], [360, 0.78], [580, 0.82]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.4],
        [130, 0.7, 0.55],
        [250, 0.8, 0.65],
        [360, 1.0, 0.8]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FanfarePreset(haptics)
  }
}
