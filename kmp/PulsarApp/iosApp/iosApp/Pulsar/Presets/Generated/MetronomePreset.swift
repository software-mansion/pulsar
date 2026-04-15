import UIKit
import Foundation

@objc public class MetronomePreset : Player, Preset {
  public static let name: String = "Metronome"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.45], [80, 0.0], [200, 0.0], [208, 0.45], [280, 0.0]],
        [[0, 0.5], [280, 0.5]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.5],
        [200, 0.5, 0.5]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return MetronomePreset(haptics)
  }
}
