// swift-tools-version: 5.9

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
    // Swift 6's strict concurrency checking. Using `swiftLanguageVersions:`
    // (the tools-5.x API) so SPM consumers pinned to tools-5.x can still depend
    // on this package — required by `flutter/pulsar/ios/pulsar_haptics/Package
    // .swift`, which is tools-5.9.
    swiftLanguageVersions: [.v5]
)
