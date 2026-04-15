import UIKit
import Foundation

@objc public class EngineRevPreset : Player, Preset {
  public static let name: String = "EngineRev"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.15], [700, 0.75], [710, 0.2], [720, 0.25], [1400, 0.95], [1600, 0.5], [1800, 0.0]],
        [[0, 0.08], [700, 0.45], [720, 0.12], [1400, 0.55], [1800, 0.3]],
      ],
      rawDiscretePattern: [
        [700, 0.8, 0.4],
        [1400, 1.0, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return EngineRevPreset(haptics)
  }
}
