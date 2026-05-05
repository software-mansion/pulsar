import UIKit
import Foundation

@objc public class TickTockPreset : Player, Preset {
  public static let name: String = "TickTock"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [1, 0.8, 0.8],
        [400, 0.4, 0.4],
        [800, 0.8, 0.8],
        [1200, 0.4, 0.4]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TickTockPreset(haptics)
  }
}
