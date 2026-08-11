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
        .plugin(
            name: "PulsarGenPlugin",
            targets: ["PulsarGenPlugin"]
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
        // Host tool + build-tool plugin that generate typed accessors for .pulsar bundles.
        .executableTarget(
            name: "pulsar-gen-swift"
        ),
        .plugin(
            name: "PulsarGenPlugin",
            capability: .buildTool(),
            dependencies: ["pulsar-gen-swift"]
        ),
    ],
    swiftLanguageModes: [.v6]
)
