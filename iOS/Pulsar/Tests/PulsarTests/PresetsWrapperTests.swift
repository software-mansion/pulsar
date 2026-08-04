import Testing
import Foundation
@testable import Pulsar

/// Name resolution and caching in `PresetsWrapper`. Resolving a (non-system) preset only
/// constructs it — it does not play — so this is safe on the simulator. `@MainActor` because
/// constructing a preset walks through the engine's lifecycle bootstrap.
@MainActor
@Suite struct PresetsWrapperTests {

    private func makeWrapper() -> PresetsWrapper {
        PresetsWrapper(haptics: Pulsar())
    }

    @Test func resolvesAKnownPresetByName() {
        let presets = makeWrapper()
        #expect(presets.getByName("Heartbeat") != nil)
    }

    @Test func nameLookupIsCaseInsensitive() {
        let presets = makeWrapper()
        #expect(presets.getByName("heartbeat") != nil)
        #expect(presets.getByName("HEARTBEAT") != nil)
        #expect(presets.getByName("HeArTbEaT") != nil)
    }

    @Test func unknownNameResolvesToNil() {
        let presets = makeWrapper()
        #expect(presets.getByName("definitely-not-a-preset") == nil)
    }

    @Test func cachingReturnsTheSameInstanceForTheSameName() throws {
        let presets = makeWrapper()
        let a = try #require(presets.getByName("Heartbeat"))
        let b = try #require(presets.getByName("heartbeat")) // same preset, different casing
        // Compute identity outside the macro to keep the comparison off the autoclosure path.
        let sameInstance = ObjectIdentifier(a) == ObjectIdentifier(b)
        #expect(sameInstance)
    }

    @Test func disablingTheCacheReturnsFreshInstances() throws {
        let presets = makeWrapper()
        presets.enableCache(state: false)
        #expect(presets.isCacheEnabled() == false)

        let a = try #require(presets.getByName("Heartbeat"))
        let b = try #require(presets.getByName("Heartbeat"))
        let sameInstance = ObjectIdentifier(a) == ObjectIdentifier(b)
        #expect(!sameInstance)
    }

    @Test func cacheIsEnabledByDefault() {
        #expect(makeWrapper().isCacheEnabled() == true)
    }

    @Test func preloadingWarmsTheCacheWithTheSameInstance() throws {
        let presets = makeWrapper()
        presets.preloadPresetByName("Heartbeat")
        let a = try #require(presets.getByName("Heartbeat"))
        let b = try #require(presets.getByName("Heartbeat"))
        let sameInstance = ObjectIdentifier(a) == ObjectIdentifier(b)
        #expect(sameInstance)
    }

    @Test func resetCacheDropsTheCachedInstance() throws {
        let presets = makeWrapper()
        let before = try #require(presets.getByName("Heartbeat"))
        presets.resetCache()
        let after = try #require(presets.getByName("Heartbeat"))
        // A fresh instance proves the cache was actually cleared.
        let sameInstance = ObjectIdentifier(before) == ObjectIdentifier(after)
        #expect(!sameInstance)
    }

    @Test func resolvesSystemPresetsByName() {
        // System presets build a UIFeedbackGenerator in init (main-thread precondition) — safe here
        // because the suite is @MainActor. Only constructs; does not play.
        let presets = makeWrapper()
        #expect(presets.getByName("SystemImpactHeavy") != nil)
        #expect(presets.getByName("SystemNotificationError") != nil)
        #expect(presets.getByName("SystemSelection") != nil)
    }

    /// Broad guard that the codegen name→class mapper and the public getters stay consistent:
    /// every one of these documented names must resolve. A curated cross-section (system +
    /// generated across categories) rather than all ~160, to keep the run fast.
    @Test func resolvesARepresentativeSetOfPresetNames() {
        let names = [
            "SystemImpactLight", "SystemImpactMedium", "SystemImpactHeavy",
            "SystemImpactSoft", "SystemImpactRigid",
            "SystemNotificationSuccess", "SystemNotificationWarning", "SystemNotificationError",
            "SystemSelection",
            "Heartbeat", "DogBark", "Buzz", "Pulse", "Hammer", "Explosion",
            "Rain", "Typewriter", "Metronome", "Zipper", "Wave",
        ]
        let presets = makeWrapper()
        for name in names {
            #expect(presets.getByName(name) != nil, "preset \(name) failed to resolve")
        }
    }
}
