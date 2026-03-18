import UIKit
import Foundation

@objc public class QuadThudPreset : Player, Preset {
  public static let name: String = "QuadThud"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.306],
        [155, 1.0, 0.163],
        [601, 0.997, 0.303],
        [750, 1.0, 0.153]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return QuadThudPreset(haptics)
  }
}
