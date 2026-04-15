import UIKit
import Foundation

@objc public class PatterPreset : Player, Preset {
  public static let name: String = "Patter"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.603, 0.2],
        [82, 0.606, 0.197],
        [179, 0.609, 0.594]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PatterPreset(haptics)
  }
}
