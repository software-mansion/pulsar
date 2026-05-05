import Flutter
import UIKit

public class PulsarPlugin: NSObject, FlutterPlugin {
  private let pulsar = Pulsar()
  private lazy var realtimeComposer = pulsar.getRealtimeComposer()
  private var patternComposers: [Int: PatternComposer] = [:]
  private var nextPatternComposerId = 1

  public static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(name: "pulsar", binaryMessenger: registrar.messenger())
    let instance = PulsarPlugin()
    registrar.addMethodCallDelegate(instance, channel: channel)
  }

  public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    let args = call.arguments as? [String: Any]
    switch call.method {

    // MARK: — Pulsar
    case "Pulsar_play":
      guard let name = args?["name"] as? String else {
        result(FlutterError(code: "INVALID_ARGS", message: "name required", details: nil))
        return
      }
      pulsar.getPresets().getByName(name)?.play()
      result(nil)

    case "Pulsar_enableHaptics":
      guard let state = args?["state"] as? Bool else {
        result(FlutterError(code: "INVALID_ARGS", message: "state required", details: nil))
        return
      }
      pulsar.enableHaptics(state: state)
      result(nil)

    case "Pulsar_enableSound":
      guard let state = args?["state"] as? Bool else {
        result(FlutterError(code: "INVALID_ARGS", message: "state required", details: nil))
        return
      }
      pulsar.enableSound(state: state)
      result(nil)

    case "Pulsar_enableCache":
      guard let state = args?["state"] as? Bool else {
        result(FlutterError(code: "INVALID_ARGS", message: "state required", details: nil))
        return
      }
      pulsar.enableCache(state: state)
      result(nil)

    case "Pulsar_isCacheEnabled":
      result(pulsar.getPresets().isCacheEnabled())

    case "Pulsar_clearCache":
      pulsar.clearCache()
      result(nil)

    case "Pulsar_preloadPreset":
      guard let name = args?["presetName"] as? String else {
        result(FlutterError(code: "INVALID_ARGS", message: "presetName required", details: nil))
        return
      }
      pulsar.getPresets().preloadPresetByName(name)
      result(nil)

    case "Pulsar_presetExists":
      guard let name = args?["name"] as? String else {
        result(FlutterError(code: "INVALID_ARGS", message: "name required", details: nil))
        return
      }
      result(pulsar.getPresets().getByName(name) != nil)

    case "Pulsar_preloadPresets":
      guard let names = args?["presetNames"] as? [String] else {
        result(FlutterError(code: "INVALID_ARGS", message: "presetNames required", details: nil))
        return
      }
      pulsar.preloadPresets(presetNames: names)
      result(nil)

    case "Pulsar_stopHaptics":
      pulsar.stopHaptics()
      result(nil)

    case "Pulsar_shutDownEngine":
      pulsar.shutDownEngine()
      result(nil)

    case "Pulsar_isHapticsEnabled":
      result(pulsar.isHapticsEnabled)

    case "Pulsar_canPlayHaptics":
      result(pulsar.canPlayHaptics())

    case "Pulsar_hapticSupport":
      // iOS currently models support as binary for Flutter: standard support or none.
      let supported = pulsar.isHapticsSupported()
      result(supported ? 2 : 0)

    case "Pulsar_forceHapticsSupportLevel":
      // No-op on iOS — CoreHaptics support level is hardware-determined.
      result(nil)

    case "Pulsar_enableImpulseCompositionMode":
      // No-op on iOS.
      result(nil)

    case "Pulsar_setRealtimeComposerStrategy":
      // No-op on iOS.
      result(nil)

    // MARK: — RealtimeComposer
    case "RealtimeComposer_set":
      guard let amplitude = args?["amplitude"] as? Double,
            let frequency = args?["frequency"] as? Double else {
        result(FlutterError(code: "INVALID_ARGS", message: "amplitude and frequency required", details: nil))
        return
      }
      if let strategyError = applyRealtimeStrategy(args) {
        result(strategyError)
        return
      }
      realtimeComposer.set(amplitude: Float(amplitude), frequency: Float(frequency))
      result(nil)

    case "RealtimeComposer_stop":
      if let strategyError = applyRealtimeStrategy(args) {
        result(strategyError)
        return
      }
      realtimeComposer.stop()
      result(nil)

    case "RealtimeComposer_isActive":
      if let strategyError = applyRealtimeStrategy(args) {
        result(strategyError)
        return
      }
      result(realtimeComposer.isActive)

    case "RealtimeComposer_playDiscrete":
      guard let amplitude = args?["amplitude"] as? Double,
            let frequency = args?["frequency"] as? Double else {
        result(FlutterError(code: "INVALID_ARGS", message: "amplitude and frequency required", details: nil))
        return
      }
      if let strategyError = applyRealtimeStrategy(args) {
        result(strategyError)
        return
      }
      realtimeComposer.playDiscrete(amplitude: Float(amplitude), frequency: Float(frequency))
      result(nil)

    // MARK: — PatternComposer
    case "PatternComposer_parsePattern":
      guard let data = args?["data"] as? [String: Any],
            let patternData = parsePatternData(data) else {
        result(FlutterError(code: "INVALID_ARGS", message: "valid pattern data required", details: nil))
        return
      }
      let composerId = args?["composerId"] as? Int
      let resolvedComposerId = composerId ?? nextPatternComposerId
      if composerId == nil {
        nextPatternComposerId += 1
      }
      let patternComposer = patternComposers[resolvedComposerId] ?? {
        let composer = pulsar.getPatternComposer()
        patternComposers[resolvedComposerId] = composer
        return composer
      }()
      patternComposer.parsePattern(hapticsData: patternData)
      result(resolvedComposerId)

    case "PatternComposer_playPattern":
      guard let data = args?["data"] as? [String: Any],
            let patternData = parsePatternData(data) else {
        result(FlutterError(code: "INVALID_ARGS", message: "valid pattern data required", details: nil))
        return
      }
      let composerId = args?["composerId"] as? Int
      let resolvedComposerId = composerId ?? nextPatternComposerId
      if composerId == nil {
        nextPatternComposerId += 1
      }
      let patternComposer = patternComposers[resolvedComposerId] ?? {
        let composer = pulsar.getPatternComposer()
        patternComposers[resolvedComposerId] = composer
        return composer
      }()
      patternComposer.playPattern(hapticsData: patternData)
      result(resolvedComposerId)

    case "PatternComposer_play":
      guard let composerId = args?["composerId"] as? Int else {
        result(FlutterError(code: "INVALID_ARGS", message: "composerId required", details: nil))
        return
      }
      patternComposers[composerId]?.play()
      result(nil)

    case "PatternComposer_playAudioOnly":
      guard let composerId = args?["composerId"] as? Int else {
        result(FlutterError(code: "INVALID_ARGS", message: "composerId required", details: nil))
        return
      }
      patternComposers[composerId]?.playAudioOnly()
      result(nil)

    case "PatternComposer_stop":
      guard let composerId = args?["composerId"] as? Int else {
        result(FlutterError(code: "INVALID_ARGS", message: "composerId required", details: nil))
        return
      }
      patternComposers[composerId]?.stop()
      result(nil)

    case "PatternComposer_release":
      guard let composerId = args?["composerId"] as? Int else {
        result(FlutterError(code: "INVALID_ARGS", message: "composerId required", details: nil))
        return
      }
      patternComposers.removeValue(forKey: composerId)?.stop()
      result(nil)

    default:
      result(FlutterMethodNotImplemented)
    }
  }

  // MARK: — Helpers

  private func parsePatternData(_ data: [String: Any]) -> PatternData? {
    guard let continuous = data["continuousPattern"] as? [String: Any],
          let amplitudeRaw = continuous["amplitude"] as? [[String: Any]],
          let frequencyRaw = continuous["frequency"] as? [[String: Any]],
          let discreteRaw = data["discretePattern"] as? [[String: Any]] else {
      return nil
    }

    let amplitude = amplitudeRaw.compactMap { pt -> ValuePoint? in
      guard let time = pt["time"] as? Double, let value = pt["value"] as? Double else { return nil }
      return ValuePoint(time: time, value: Float(value))
    }
    let frequency = frequencyRaw.compactMap { pt -> ValuePoint? in
      guard let time = pt["time"] as? Double, let value = pt["value"] as? Double else { return nil }
      return ValuePoint(time: time, value: Float(value))
    }
    let discrete = discreteRaw.compactMap { pt -> DiscretePoint? in
      guard let time = pt["time"] as? Double,
            let amp = pt["amplitude"] as? Double,
            let freq = pt["frequency"] as? Double else { return nil }
      return DiscretePoint(time: time, amplitude: Float(amp), frequency: Float(freq))
    }

    return PatternData(
      continuousPattern: ContinuousPattern(amplitude: amplitude, frequency: frequency),
      discretePattern: discrete
    )
  }

  private func applyRealtimeStrategy(_ args: [String: Any]?) -> FlutterError? {
    guard let strategy = args?["strategy"] else {
      return nil
    }
    guard strategy is Int else {
      return FlutterError(code: "INVALID_ARGS", message: "invalid strategy", details: nil)
    }
    return nil
  }
}
