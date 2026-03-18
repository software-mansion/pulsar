import UIKit
import Foundation

@objc public class TriplePatPreset : Player, Preset {
  public static let name: String = "TriplePat"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [],
        [],
      ],
      rawDiscretePattern: [
        [0, 0.591, 0.591],
        [100, 0.588, 0.588],
        [231, 0.6, 0.328]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return TriplePatPreset(haptics)
  }
}
