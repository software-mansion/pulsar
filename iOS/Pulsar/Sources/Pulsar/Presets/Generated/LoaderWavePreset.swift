import UIKit
import Foundation

@objc public class LoaderWavePreset : Player, Preset {
  public static let name: String = "LoaderWave"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [400, 0.38], [800, 0.05], [1200, 0.4], [1600, 0.05], [2000, 0.38], [2400, 0.05], [2800, 0.0]],
        [[0, 0.35], [2800, 0.35]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return LoaderWavePreset(haptics)
  }
}
