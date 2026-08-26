import SwiftUI
import Pulsar

/// Plays presets from `hapticsBundle.pulsar`, which Xcode's synchronized group copies into the app
/// bundle. `HapticsBundle.swift` alongside it is committed `pulsar-gen --target swift` output.
struct BundlesView: View {
    private let pulsar = Pulsar()

    @State private var bundle: PulsarBundle<HapticsBundle.Presets>?
    @State private var loadError: String?

    var body: some View {
        NavigationStack {
            List {
                if let bundle {
                    Section("Play a preset") {
                        PresetRow(title: "Agent pattern", preset: bundle.agentpattern)
                        PresetRow(title: "Fanfare", preset: bundle.fanfare)
                        // Authored with a synced sound; Core Haptics plays it on the engine clock.
                        PresetRow(title: "Arcade bonus alert", preset: bundle.arcadeBonusAlert, note: "with audio")
                        PresetRow(title: "Lottie", preset: bundle.lottie, note: "with animation")
                    }

                    Section("Animation bytes") {
                        // Pulsar carries and times the Lottie; the app renders it.
                        if let animation = bundle.lottie.animation {
                            Text("\(animation.data.count) bytes at \(Int(animation.frameRate)) fps, \(animation.totalFrames) frames")
                                .font(.footnote)
                        } else {
                            Text("No animation carried for this preset.").font(.footnote)
                        }
                    }

                    Section("Bundle") {
                        LabeledContent("Id", value: bundle.id)
                        LabeledContent("Presets", value: HapticsBundle.descriptor.presetIds.joined(separator: ", "))
                    }
                } else {
                    Text(loadError ?? "Loading…").font(.footnote)
                }
            }
            .navigationTitle("Bundles")
            .onAppear(perform: load)
        }
    }

    private func load() {
        guard bundle == nil else { return }
        do {
            bundle = try pulsar.loadBundle(HapticsBundle.descriptor, strict: true)
        } catch {
            loadError = "Failed to load bundle: \(error)"
        }
    }
}

private struct PresetRow: View {
    let title: String
    let preset: PresetHandle
    var note: String?

    var body: some View {
        Button {
            preset.play()
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                    Text(note.map { "\(Int(preset.duration)) ms · \($0)" } ?? "\(Int(preset.duration)) ms")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "play.circle.fill")
            }
        }
    }
}

#Preview {
    BundlesView()
}
