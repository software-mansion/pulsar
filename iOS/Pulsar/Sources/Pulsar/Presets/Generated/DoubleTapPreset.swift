import UIKit
import Foundation

@objc public class DoubleTapPreset : Player, Preset {
  public static let name: String = "DoubleTap"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 1.0, 1.0],
        [80, 1.0, 0.3]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return DoubleTapPreset(haptics)
  }
}
