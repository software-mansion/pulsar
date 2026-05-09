import UIKit
import Foundation

@objc public class CameraShutterPreset : Player, Preset {
  public static let name: String = "CameraShutter"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.6], [30, 0.05], [60, 0.8], [100, 0.1], [150, 0.0]],
        [[0, 0.78], [30, 0.6], [60, 0.72], [150, 0.65]],
      ],
      rawDiscretePattern: [
        [0, 0.6, 0.75],
        [60, 0.8, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CameraShutterPreset(haptics)
  }
}
