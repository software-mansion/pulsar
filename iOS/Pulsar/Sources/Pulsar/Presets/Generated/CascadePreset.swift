import UIKit
import Foundation

@objc public class CascadePreset : Player, Preset {
  public static let name: String = "Cascade"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.994, 0.994],
        [99, 0.997, 0.997],
        [199, 0.997, 0.997],
        [551, 0.8, 0.8],
        [649, 0.803, 0.803],
        [751, 0.797, 0.797],
        [1118, 0.5, 0.5],
        [1219, 0.491, 0.491],
        [1318, 0.494, 0.494],
        [1660, 0.497, 0.213],
        [1762, 0.506, 0.209],
        [1863, 0.488, 0.213]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CascadePreset(haptics)
  }
}
