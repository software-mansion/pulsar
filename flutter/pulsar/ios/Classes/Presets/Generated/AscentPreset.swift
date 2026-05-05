import UIKit
import Foundation

@objc public class AscentPreset : Player, Preset {
  public static let name: String = "Ascent"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [5, 0.55], [155, 0.0], [205, 0.65], [335, 0.0], [385, 0.75], [495, 0.0], [545, 0.85], [635, 0.0], [685, 0.92], [755, 0.0], [805, 0.97], [860, 0.0], [905, 1.0], [1700, 0.65], [2100, 0.25], [2400, 0.0]],
        [[0, 0.3], [200, 0.37], [380, 0.42], [540, 0.55], [680, 0.65], [800, 0.73], [900, 0.87], [2400, 0.87]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.3],
        [200, 0.65, 0.37],
        [380, 0.75, 0.42],
        [540, 0.85, 0.55],
        [680, 0.92, 0.65],
        [800, 0.97, 0.73],
        [900, 1.0, 0.87]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return AscentPreset(haptics)
  }
}
