import UIKit
import Foundation

@objc public class DogBarkPreset : Player, Preset {
  public static let name: String = "DogBark"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.9], [50, 0.65], [120, 0.15], [200, 0.0], [280, 0.85], [325, 0.6], [400, 0.12], [500, 0.0]],
        [[0, 0.2], [500, 0.2]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.22],
        [280, 0.85, 0.22]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DogBarkPreset(haptics)
  }
}
