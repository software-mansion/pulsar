import UIKit
import Foundation

@objc public class FlinchPreset : Player, Preset {
  public static let name: String = "Flinch"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.95], [60, 0.3], [120, 0.8], [170, 0.4], [280, 0.0]],
        [[0, 0.73], [120, 0.68], [280, 0.55]],
      ],
      rawDiscretePattern: [
        [0, 0.9, 0.75],
        [120, 0.75, 0.7],
        [200, 0.4, 0.58]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FlinchPreset(haptics)
  }
}
