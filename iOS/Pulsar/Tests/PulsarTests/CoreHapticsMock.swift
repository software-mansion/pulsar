import Foundation
import CoreHaptics
import ObjectiveC

/// A swizzled stand-in for CoreHaptics so the engine wrapper's *interaction* with CHHapticEngine
/// can be verified on the simulator (where the real engine can't initialize). The mock lets
/// `CHHapticEngine()` "succeed", makes `capabilitiesForHardware().supportsHaptics` report true, and
/// returns fake players that record every start/stop/sendParameters call.
///
/// Swizzling is process-global, so `install()`/`uninstall()` save and restore the original IMPs and
/// the mock suite runs serialized and in isolation from the real-behavior suites.
final class HapticMockRecorder {
    // Test-only global state; access is serialized (mock suite is @Suite(.serialized), main thread).
    nonisolated(unsafe) static let shared = HapticMockRecorder()

    var enginesCreated = 0
    var startCalls = 0
    var playersCreated = 0
    var advancedPlayersCreated = 0
    var playerStarts = 0
    var playerStops = 0
    var sentParameters: [(intensity: Float, sharpness: Float)] = []

    func reset() {
        enginesCreated = 0
        startCalls = 0
        playersCreated = 0
        advancedPlayersCreated = 0
        playerStarts = 0
        playerStops = 0
        sentParameters.removeAll()
    }
}

/// Fake `CHHapticPatternPlayer` — records start/stop.
final class MockPatternPlayer: NSObject {
    @objc func start(atTime time: TimeInterval) throws { HapticMockRecorder.shared.playerStarts += 1 }
    @objc func stop(atTime time: TimeInterval) throws { HapticMockRecorder.shared.playerStops += 1 }
    @objc var isMuted: Bool = false
}

/// Fake `CHHapticAdvancedPatternPlayer` — also records the dynamic parameters the realtime path sends.
final class MockAdvancedPlayer: NSObject {
    @objc func start(atTime time: TimeInterval) throws { HapticMockRecorder.shared.playerStarts += 1 }
    @objc func stop(atTime time: TimeInterval) throws { HapticMockRecorder.shared.playerStops += 1 }
    @objc var isMuted: Bool = false

    @objc func sendParameters(_ parameters: [CHHapticDynamicParameter], atTime time: TimeInterval) throws {
        var intensity: Float = .nan
        var sharpness: Float = .nan
        for p in parameters {
            if p.parameterID == .hapticIntensityControl { intensity = p.value }
            if p.parameterID == .hapticSharpnessControl { sharpness = p.value }
        }
        HapticMockRecorder.shared.sentParameters.append((intensity, sharpness))
    }
}

enum CoreHapticsMock {
    nonisolated(unsafe) private static var saved: [(AnyClass, Selector, IMP)] = []
    nonisolated(unsafe) private static var installed = false

    static func install() {
        guard !installed else { return }
        installed = true
        HapticMockRecorder.shared.reset()

        let engine: AnyClass = CHHapticEngine.self

        // capabilitiesForHardware().supportsHaptics -> true
        let cap = CHHapticEngine.capabilitiesForHardware() as AnyObject
        if let capCls: AnyClass = object_getClass(cap) {
            let supports: @convention(block) (AnyObject) -> Bool = { _ in true }
            swizzle(capCls, NSSelectorFromString("supportsHaptics"), supports)
        }

        // -initAndReturnError:  -> return self as a shell engine
        let initBlock: @convention(block) (AnyObject, UnsafeMutableRawPointer?) -> AnyObject? = { obj, _ in
            HapticMockRecorder.shared.enginesCreated += 1
            return obj
        }
        swizzle(engine, NSSelectorFromString("initAndReturnError:"), initBlock)

        // -startAndReturnError: -> YES
        let startBlock: @convention(block) (AnyObject, UnsafeMutableRawPointer?) -> Bool = { _, _ in
            HapticMockRecorder.shared.startCalls += 1
            return true
        }
        swizzle(engine, NSSelectorFromString("startAndReturnError:"), startBlock)

        // -stopWithCompletionHandler: -> no-op
        let stopBlock: @convention(block) (AnyObject, AnyObject?) -> Void = { _, _ in }
        swizzle(engine, NSSelectorFromString("stopWithCompletionHandler:"), stopBlock)

        // -createPlayerWithPattern:error: -> fake pattern player
        let playerBlock: @convention(block) (AnyObject, AnyObject?, UnsafeMutableRawPointer?) -> AnyObject? = { _, _, _ in
            HapticMockRecorder.shared.playersCreated += 1
            return MockPatternPlayer()
        }
        swizzle(engine, NSSelectorFromString("createPlayerWithPattern:error:"), playerBlock)

        // -createAdvancedPlayerWithPattern:error: -> fake advanced player
        let advancedBlock: @convention(block) (AnyObject, AnyObject?, UnsafeMutableRawPointer?) -> AnyObject? = { _, _, _ in
            HapticMockRecorder.shared.advancedPlayersCreated += 1
            return MockAdvancedPlayer()
        }
        swizzle(engine, NSSelectorFromString("createAdvancedPlayerWithPattern:error:"), advancedBlock)
    }

    static func uninstall() {
        for (cls, sel, imp) in saved.reversed() {
            if let m = class_getInstanceMethod(cls, sel) {
                method_setImplementation(m, imp)
            }
        }
        saved.removeAll()
        installed = false
    }

    private static func swizzle(_ cls: AnyClass, _ sel: Selector, _ block: Any) {
        guard let m = class_getInstanceMethod(cls, sel) else { return }
        let newImp = imp_implementationWithBlock(block)
        let old = method_setImplementation(m, newImp)
        saved.append((cls, sel, old))
    }
}
