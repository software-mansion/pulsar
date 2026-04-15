import UIKit
import Foundation

@objc public class FizzPreset : Player, Preset {
  public static let name: String = "Fizz"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.5], [60, 0.15], [120, 0.6], [178, 0.1], [230, 0.7], [290, 0.15], [330, 0.75], [390, 0.2], [420, 0.65], [500, 0.0]],
        [[0, 0.62], [420, 0.72], [500, 0.68]],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.65],
        [120, 0.6, 0.7],
        [230, 0.7, 0.73],
        [330, 0.75, 0.75],
        [420, 0.65, 0.7]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return FizzPreset(haptics)
  }
}
