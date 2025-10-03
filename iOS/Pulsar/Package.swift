// swift-tools-version: 6.1
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

// Conditional resources based on environment
// let includeDevResources = ProcessInfo.processInfo.environment["Pulsar_DEV"] != nil
let includeDevResources = true

let package = Package(
    name: "Pulsar",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "Pulsar",
            targets: ["Pulsar"],
            ),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "Pulsar",
            resources: [.process("Resources")]),
        .testTarget(
            name: "PulsarTests",
            dependencies: ["Pulsar"]
        ),
    ]
)
