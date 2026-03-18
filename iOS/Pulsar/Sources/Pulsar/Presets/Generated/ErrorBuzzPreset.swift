import UIKit
import Foundation

@objc public class ErrorBuzzPreset : Player, Preset {
  public static let name: String = "ErrorBuzz"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.9], [100, 0.85], [150, 0.65], [250, 0.3], [350, 0.0]],
        [[0, 0.85], [350, 0.8]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.85],
        [120, 0.7, 0.82]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ErrorBuzzPreset(haptics)
  }
}
