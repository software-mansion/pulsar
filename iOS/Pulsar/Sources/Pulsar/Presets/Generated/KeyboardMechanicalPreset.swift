import UIKit
import Foundation

@objc public class KeyboardMechanicalPreset : Player, Preset {
  public static let name: String = "KeyboardMechanical"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [4, 0.52], [18, 0.2], [22, 0.7], [38, 0.15], [55, 0.0]],
        [[0, 0.68], [22, 0.76], [55, 0.7]],
      ],
      rawDiscretePattern: [
        [0, 0.55, 0.68],
        [22, 0.72, 0.74]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return KeyboardMechanicalPreset(haptics)
  }
}
