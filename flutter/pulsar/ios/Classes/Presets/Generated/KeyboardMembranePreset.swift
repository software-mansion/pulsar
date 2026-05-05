import UIKit
import Foundation

@objc public class KeyboardMembranePreset : Player, Preset {
  public static let name: String = "KeyboardMembrane"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [12, 0.33], [50, 0.18], [100, 0.06], [140, 0.0]],
        [[0, 0.38], [140, 0.35]],
      ],
      rawDiscretePattern: [
        [0, 0.35, 0.38]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return KeyboardMembranePreset(haptics)
  }
}
