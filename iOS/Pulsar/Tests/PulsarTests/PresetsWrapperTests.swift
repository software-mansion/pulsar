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
}
