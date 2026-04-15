import UIKit
import Foundation

@objc public class DewdropPreset : Player, Preset {
  public static let name: String = "Dewdrop"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [8, 0.4], [65, 0.0], [130, 0.6], [210, 0.0]],
        [[0, 0.5], [130, 0.65], [210, 0.62]],
      ],
      rawDiscretePattern: [
        [0, 0.4, 0.52],
        [130, 0.6, 0.65]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DewdropPreset(haptics)
  }
}
