import UIKit
import Foundation

@objc public class PlummetPreset : Player, Preset {
  public static let name: String = "Plummet"

  @objc public init(_ haptics: Pulsar) {
    super.init(
      haptics,
      rawContinuousPattern: [
        [[0, 0.0], [300, 0.02], [600, 0.06], [800, 0.15], [880, 0.3], [895, 0.5], [900, 0.0], [905, 1.0], [960, 0.4], [1050, 0.0]],
        [[0, 0.3], [895, 0.4], [905, 0.3], [1050, 0.25]],
      ],
      rawDiscretePattern: [
        [900, 1.0, 0.4]
      ]
    )
  }

  public static func getInstance(haptics: Pulsar) -> Preset {
    return PlummetPreset(haptics)
  }
}
