import UIKit
import Foundation

@objc public class StompPreset : Player, Preset {
  public static let name: String = "Stomp"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.3],
        [75, 1.0, 0.3],
        [150, 1.0, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return StompPreset(haptics)
  }
}
