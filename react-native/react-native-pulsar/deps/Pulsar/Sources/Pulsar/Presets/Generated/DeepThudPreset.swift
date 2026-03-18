import UIKit
import Foundation

@objc public class DeepThudPreset : Player, Preset {
  public static let name: String = "DeepThud"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DeepThudPreset(haptics)
  }
}
