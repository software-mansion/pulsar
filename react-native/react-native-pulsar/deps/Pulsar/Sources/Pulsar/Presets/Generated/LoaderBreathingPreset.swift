import UIKit
import Foundation

@objc public class LoaderBreathingPreset : Player, Preset {
  public static let name: String = "LoaderBreathing"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [1500, 0.4], [3000, 0.0], [4500, 0.4], [6000, 0.0]],
        [[0, 0.15], [6000, 0.15]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LoaderBreathingPreset(haptics)
  }
}
