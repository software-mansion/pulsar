import UIKit
import Foundation

@objc public class CleanStrikePreset : Player, Preset {
  public static let name: String = "CleanStrike"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.75, 1.0]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return CleanStrikePreset(haptics)
  }
}
