import UIKit
import Foundation

@objc public class AlarmPreset : Player, Preset {
  public static let name: String = "Alarm"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.9], [130, 0.0], [200, 0.9], [330, 0.0], [400, 0.9], [530, 0.0], [600, 0.9], [730, 0.0], [800, 0.9], [930, 0.0], [1000, 0.9], [1130, 0.0]],
        [[0, 0.82], [130, 0.82], [200, 0.48], [330, 0.48], [400, 0.82], [530, 0.82], [600, 0.48], [730, 0.48], [800, 0.82], [930, 0.82], [1000, 0.48], [1130, 0.48]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.8],
        [200, 0.9, 0.5],
        [400, 0.9, 0.8],
        [600, 0.9, 0.5],
        [800, 0.9, 0.8],
        [1000, 0.9, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return AlarmPreset(haptics)
  }
}
