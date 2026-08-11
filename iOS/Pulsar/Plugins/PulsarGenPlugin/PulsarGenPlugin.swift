import PackagePlugin
import Foundation

/// SwiftPM build-tool plugin: for every `*.pulsar` file in a target, generates a typed Swift
/// accessor (`<name>.pulsar.swift`) at build time via the self-contained `pulsar-gen-swift` tool.
/// Zero manual regeneration — dropping an updated `.pulsar` in and rebuilding refreshes the types.
@main
struct PulsarGenPlugin: BuildToolPlugin {
  func createBuildCommands(context: PluginContext, target: Target) async throws -> [Command] {
    guard let sourceTarget = target as? SourceModuleTarget else { return [] }
    let tool = try context.tool(named: "pulsar-gen-swift")

    return sourceTarget.sourceFiles(withSuffix: "pulsar").map { file in
      let base = file.path.stem // filename without extension
      let output = context.pluginWorkDirectory.appending("\(base).pulsar.swift")
      return .buildCommand(
        displayName: "pulsar-gen \(base).pulsar",
        executable: tool.path,
        arguments: [file.path.string, output.string],
        inputFiles: [file.path],
        outputFiles: [output]
      )
    }
  }
}
