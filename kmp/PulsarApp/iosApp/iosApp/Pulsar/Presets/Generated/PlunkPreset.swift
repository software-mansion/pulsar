import UIKit
import Foundation

@objc public class PlunkPreset : Player, Preset {
  public static let name: String = "Plunk"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.5, 0.2]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PlunkPreset(haptics)
  }
}
