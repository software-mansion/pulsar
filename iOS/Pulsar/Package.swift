// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Pulsar",
    platforms: [
        .iOS(.v13),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "Pulsar",
            targets: ["Pulsar"],
            ),
    ],
    targets: [
        .target(
            name: "Pulsar",
            resources: []),
        .testTarget(
            name: "PulsarTests",
            dependencies: ["Pulsar"]
        ),
    ],
    // Build under the Swift 6 language mode so the package and its consumers
    // get full strict-concurrency checking. The source has been audited and
    // the MainActor-isolated UIKit feedback generators are reached through
    // synchronous `MainActor.assumeIsolated` helpers (see
    // `Sources/Pulsar/Presets/SystemPresetsImpl.swift`). CoreHaptics callbacks
    // and the AVAudioEngine pipeline are serialized via a serial dispatch
    // queue + `@unchecked Sendable` wrapper classes; see the rationale
    // comments at the top of `HapticEngineWrapper.swift` and
    // `AudioSimulator.swift`.
    swiftLanguageModes: [.v6]
)
