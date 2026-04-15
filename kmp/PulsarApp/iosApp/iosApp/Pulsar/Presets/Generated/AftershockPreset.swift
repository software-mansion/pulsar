import UIKit
import Foundation

@objc public class AftershockPreset : Player, Preset {
  public static let name: String = "Aftershock"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.8, 0.8],
        [299, 0.5, 0.247],
        [399, 0.494, 0.266],
        [500, 0.497, 0.263]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return AftershockPreset(haptics)
  }
}
