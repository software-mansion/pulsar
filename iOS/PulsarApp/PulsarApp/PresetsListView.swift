import SwiftUI
import Pulsar

struct PresetItem: Identifiable {
    let id = UUID()
    let name: String
    let displayName: String
}

struct PresetsListView: View {
    @State private var pulsar = Pulsar()
    @State private var playingPreset: String? = nil
    
    // Define all available presets - easy to extend by adding to this array
    private let presets: [PresetItem] = [
        PresetItem(name: "Earthquake", displayName: "🌍 Earthquake"),
        PresetItem(name: "Success", displayName: "✅ Success"),
        PresetItem(name: "Fail", displayName: "❌ Fail"),
        PresetItem(name: "Tap", displayName: "👆 Tap"),
        PresetItem(name: "SystemImpactLight", displayName: "💫 System Impact Light"),
        PresetItem(name: "SystemImpactMedium", displayName: "⚡ System Impact Medium"),
        PresetItem(name: "SystemImpactHeavy", displayName: "💥 System Impact Heavy"),
        PresetItem(name: "SystemImpactSoft", displayName: "🌸 System Impact Soft"),
        PresetItem(name: "SystemImpactRigid", displayName: "🔨 System Impact Rigid"),
        PresetItem(name: "SystemNotificationSuccess", displayName: "🔔 Notification Success"),
        PresetItem(name: "SystemNotificationWarning", displayName: "⚠️ Notification Warning"),
        PresetItem(name: "SystemNotificationError", displayName: "🚨 Notification Error"),
        PresetItem(name: "SystemSelection", displayName: "🎯 System Selection"),
    ]
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Haptic Presets Library")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding()
                
                Text("Tap any preset to play")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .padding(.bottom, 10)
                
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(presets) { preset in
                            PresetRowView(
                                preset: preset,
                                isPlaying: playingPreset == preset.name,
                                onPlay: {
                                    playPreset(name: preset.name)
                                }
                            )
                        }
                    }
                    .padding(.horizontal)
                }
                
                Spacer()
            }
        }
    }
    
    private func playPreset(name: String) {
        playingPreset = name
        
        if let preset = pulsar.getPresets().getByName(name) {
            preset.play()
        }
        
        // Reset playing state after a short delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            playingPreset = nil
        }
    }
}

struct PresetRowView: View {
    let preset: PresetItem
    let isPlaying: Bool
    let onPlay: () -> Void
    
    var body: some View {
        HStack {
            Text(preset.displayName)
                .font(.system(size: 18, weight: .medium))
                .frame(maxWidth: .infinity, alignment: .leading)
            
            Button(action: onPlay) {
                HStack {
                    Image(systemName: isPlaying ? "waveform.circle.fill" : "play.circle.fill")
                        .font(.system(size: 24))
                    Text(isPlaying ? "Playing..." : "Play")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(
                    LinearGradient(
                        colors: isPlaying ?
                            [Color.green, Color.blue] :
                            [Color.blue, Color.purple],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(25)
            }
            .disabled(isPlaying)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color(.systemBackground))
                .shadow(color: isPlaying ? .blue.opacity(0.3) : .gray.opacity(0.2), radius: 5, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 15)
                .stroke(isPlaying ? Color.blue : Color.clear, lineWidth: 2)
        )
    }
}

#Preview {
    PresetsListView()
}
