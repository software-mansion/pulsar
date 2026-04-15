import UIKit
import Foundation

@objc public class ChirpPreset : Player, Preset {
  public static let name: String = "Chirp"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [10, 0.35], [80, 0.0], [150, 0.45], [230, 0.0], [280, 0.55], [360, 0.0]],
        [[0, 0.6], [360, 0.72]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.65],
        [150, 0.5, 0.68],
        [280, 0.6, 0.72]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ChirpPreset(haptics)
  }
}
