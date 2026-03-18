import UIKit
import Foundation

@objc public class ZipperPreset : Player, Preset {
  public static let name: String = "Zipper"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [6, 0.234], [432, 0.231], [460, 0.0]],
        [[0, 0.616], [358, 0.594], [460, 0.35]],
      ],
      rawDiscretePattern: [
        [0, 0.35, 0.8],
        [40, 0.35, 0.8],
        [80, 0.35, 0.8],
        [120, 0.35, 0.8],
        [160, 0.35, 0.8],
        [200, 0.35, 0.8],
        [240, 0.35, 0.8],
        [280, 0.35, 0.8],
        [320, 0.35, 0.8],
        [360, 0.35, 0.8],
        [400, 0.35, 0.8],
        [430, 0.6, 0.75]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ZipperPreset(haptics)
  }
}
