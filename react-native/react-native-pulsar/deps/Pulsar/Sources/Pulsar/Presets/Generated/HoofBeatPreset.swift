import UIKit
import Foundation

@objc public class HoofBeatPreset : Player, Preset {
  public static let name: String = "HoofBeat"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [10, 1.0, 0.106],
        [201, 1.0, 0.109]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return HoofBeatPreset(haptics)
  }
}
