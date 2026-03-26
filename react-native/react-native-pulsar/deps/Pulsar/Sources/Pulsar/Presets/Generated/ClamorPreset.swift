import UIKit
import Foundation

@objc public class ClamorPreset : Player, Preset {
  public static let name: String = "Clamor"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.78], [70, 0.0], [120, 0.78], [190, 0.0], [240, 0.78], [310, 0.0], [360, 0.78], [430, 0.0]],
        [[0, 0.68], [430, 0.68]],
      ],
      rawDiscretePattern: [
        [0, 0.8, 0.68],
        [120, 0.8, 0.68],
        [240, 0.8, 0.68],
        [360, 0.8, 0.68]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return ClamorPreset(haptics)
  }
}
