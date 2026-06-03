// swift-tools-version: 6.1

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
    // Pin to Swift 5 language mode. Several call sites (e.g. SystemPresetsImpl
    // constructing UIImpactFeedbackGenerator) invoke main-actor-isolated APIs
    // from synchronous nonisolated contexts and don't yet build cleanly under
    // Swift 6's strict concurrency checking.
    swiftLanguageModes: [.v5]
)
