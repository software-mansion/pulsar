import UIKit
import Foundation

@objc public class UnfurlPreset : Player, Preset {
  public static let name: String = "Unfurl"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.5], [68, 0.0], [93, 0.62], [158, 0.0], [183, 0.74], [248, 0.0], [273, 0.86], [338, 0.0], [363, 1.0], [850, 0.6], [1050, 0.2], [1180, 0.0]],
        [[0, 0.28], [90, 0.4], [180, 0.49], [270, 0.62], [360, 0.7], [1180, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.28],
        [90, 0.62, 0.4],
        [180, 0.74, 0.49],
        [270, 0.86, 0.62],
        [360, 1.0, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return UnfurlPreset(haptics)
  }
}
