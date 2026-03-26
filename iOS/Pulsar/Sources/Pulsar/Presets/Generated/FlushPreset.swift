import UIKit
import Foundation

@objc public class FlushPreset : Player, Preset {
  public static let name: String = "Flush"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [30, 0.22], [80, 0.45], [100, 0.78], [140, 0.52], [200, 0.2], [380, 0.0]],
        [[0, 0.3], [100, 0.35], [150, 0.28], [380, 0.22]],
      ],
      rawDiscretePattern: [
        [0, 0.25, 0.3],
        [100, 0.5, 0.35],
        [150, 0.8, 0.3],
        [200, 0.55, 0.25]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FlushPreset(haptics)
  }
}
