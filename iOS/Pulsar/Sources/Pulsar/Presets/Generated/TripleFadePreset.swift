import UIKit
import Foundation

@objc public class TripleFadePreset : Player, Preset {
  public static let name: String = "TripleFade"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 0.3],
        [75, 0.703, 0.203],
        [150, 0.5, 0.1]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TripleFadePreset(haptics)
  }
}
