import UIKit
import Foundation

@objc public class WanePreset : Player, Preset {
  public static let name: String = "Wane"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [20, 0.42], [180, 0.22], [450, 0.0]],
        [[0, 0.5], [180, 0.4], [450, 0.35]],
      ],
      rawDiscretePattern: [

      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return WanePreset(haptics)
  }
}
