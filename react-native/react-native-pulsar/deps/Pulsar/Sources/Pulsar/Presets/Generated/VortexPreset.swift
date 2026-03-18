import UIKit
import Foundation

@objc public class VortexPreset : Player, Preset {
  public static let name: String = "Vortex"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.05], [200, 0.08], [400, 0.13], [600, 0.22], [800, 0.35], [950, 0.52], [1050, 0.72], [1150, 0.9], [1195, 0.0], [1200, 1.0], [1250, 0.3], [1400, 0.0]],
        [[0, 0.25], [600, 0.4], [1000, 0.62], [1150, 0.82], [1200, 0.9], [1400, 0.5]],
      ],
      rawDiscretePattern: [
        [1200, 1.0, 0.8]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return VortexPreset(haptics)
  }
}
