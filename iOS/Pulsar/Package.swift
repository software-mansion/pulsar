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
    swiftLanguageModes: [.v6]
)
