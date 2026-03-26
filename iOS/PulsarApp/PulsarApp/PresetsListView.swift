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
// CODEGEN_BEGIN_{example_app_preset_list}
        PresetItem(name: "Afterglow", displayName: "📳 Afterglow"),
        PresetItem(name: "Aftershock", displayName: "📳 Aftershock"),
        PresetItem(name: "Alarm", displayName: "📳 Alarm"),
        PresetItem(name: "Anvil", displayName: "📳 Anvil"),
        PresetItem(name: "Applause", displayName: "📳 Applause"),
        PresetItem(name: "Ascent", displayName: "📳 Ascent"),
        PresetItem(name: "BalloonPop", displayName: "📳 BalloonPop"),
        PresetItem(name: "Barrage", displayName: "📳 Barrage"),
        PresetItem(name: "BassDrop", displayName: "📳 BassDrop"),
        PresetItem(name: "Batter", displayName: "📳 Batter"),
        PresetItem(name: "BellToll", displayName: "📳 BellToll"),
        PresetItem(name: "Blip", displayName: "📳 Blip"),
        PresetItem(name: "Bloom", displayName: "📳 Bloom"),
        PresetItem(name: "Bongo", displayName: "📳 Bongo"),
        PresetItem(name: "Boulder", displayName: "📳 Boulder"),
        PresetItem(name: "BreakingWave", displayName: "📳 BreakingWave"),
        PresetItem(name: "Breath", displayName: "📳 Breath"),
        PresetItem(name: "Breathing", displayName: "📳 Breathing"),
        PresetItem(name: "Buildup", displayName: "📳 Buildup"),
        PresetItem(name: "Burst", displayName: "📳 Burst"),
        PresetItem(name: "Buzz", displayName: "📳 Buzz"),
        PresetItem(name: "Cadence", displayName: "📳 Cadence"),
        PresetItem(name: "CameraShutter", displayName: "📳 CameraShutter"),
        PresetItem(name: "Canter", displayName: "📳 Canter"),
        PresetItem(name: "Cascade", displayName: "📳 Cascade"),
        PresetItem(name: "Castanets", displayName: "📳 Castanets"),
        PresetItem(name: "CatPaw", displayName: "📳 CatPaw"),
        PresetItem(name: "Charge", displayName: "📳 Charge"),
        PresetItem(name: "Chime", displayName: "📳 Chime"),
        PresetItem(name: "Chip", displayName: "📳 Chip"),
        PresetItem(name: "Chirp", displayName: "📳 Chirp"),
        PresetItem(name: "Clamor", displayName: "📳 Clamor"),
        PresetItem(name: "Clasp", displayName: "📳 Clasp"),
        PresetItem(name: "Cleave", displayName: "📳 Cleave"),
        PresetItem(name: "Coil", displayName: "📳 Coil"),
        PresetItem(name: "CoinDrop", displayName: "📳 CoinDrop"),
        PresetItem(name: "CombinationLock", displayName: "📳 CombinationLock"),
        PresetItem(name: "Crescendo", displayName: "📳 Crescendo"),
        PresetItem(name: "Dewdrop", displayName: "📳 Dewdrop"),
        PresetItem(name: "Dirge", displayName: "📳 Dirge"),
        PresetItem(name: "Dissolve", displayName: "📳 Dissolve"),
        PresetItem(name: "DogBark", displayName: "📳 DogBark"),
        PresetItem(name: "Drone", displayName: "📳 Drone"),
        PresetItem(name: "EngineRev", displayName: "📳 EngineRev"),
        PresetItem(name: "Exhale", displayName: "📳 Exhale"),
        PresetItem(name: "Explosion", displayName: "📳 Explosion"),
        PresetItem(name: "FadeOut", displayName: "📳 FadeOut"),
        PresetItem(name: "Fanfare", displayName: "📳 Fanfare"),
        PresetItem(name: "Feather", displayName: "📳 Feather"),
        PresetItem(name: "Finale", displayName: "📳 Finale"),
        PresetItem(name: "FingerDrum", displayName: "📳 FingerDrum"),
        PresetItem(name: "Firecracker", displayName: "📳 Firecracker"),
        PresetItem(name: "Fizz", displayName: "📳 Fizz"),
        PresetItem(name: "Flare", displayName: "📳 Flare"),
        PresetItem(name: "Flick", displayName: "📳 Flick"),
        PresetItem(name: "Flinch", displayName: "📳 Flinch"),
        PresetItem(name: "Flourish", displayName: "📳 Flourish"),
        PresetItem(name: "Flurry", displayName: "📳 Flurry"),
        PresetItem(name: "Flush", displayName: "📳 Flush"),
        PresetItem(name: "Gallop", displayName: "📳 Gallop"),
        PresetItem(name: "Gavel", displayName: "📳 Gavel"),
        PresetItem(name: "Glitch", displayName: "📳 Glitch"),
        PresetItem(name: "GuitarStrum", displayName: "📳 GuitarStrum"),
        PresetItem(name: "Hail", displayName: "📳 Hail"),
        PresetItem(name: "Hammer", displayName: "📳 Hammer"),
        PresetItem(name: "Heartbeat", displayName: "📳 Heartbeat"),
        PresetItem(name: "Herald", displayName: "📳 Herald"),
        PresetItem(name: "HoofBeat", displayName: "📳 HoofBeat"),
        PresetItem(name: "Ignition", displayName: "📳 Ignition"),
        PresetItem(name: "Impact", displayName: "📳 Impact"),
        PresetItem(name: "Jolt", displayName: "📳 Jolt"),
        PresetItem(name: "KeyboardMechanical", displayName: "📳 KeyboardMechanical"),
        PresetItem(name: "KeyboardMembrane", displayName: "📳 KeyboardMembrane"),
        PresetItem(name: "Knell", displayName: "📳 Knell"),
        PresetItem(name: "Knock", displayName: "📳 Knock"),
        PresetItem(name: "Lament", displayName: "📳 Lament"),
        PresetItem(name: "Latch", displayName: "📳 Latch"),
        PresetItem(name: "Lighthouse", displayName: "📳 Lighthouse"),
        PresetItem(name: "Lilt", displayName: "📳 Lilt"),
        PresetItem(name: "Lock", displayName: "📳 Lock"),
        PresetItem(name: "Lope", displayName: "📳 Lope"),
        PresetItem(name: "March", displayName: "📳 March"),
        PresetItem(name: "Metronome", displayName: "📳 Metronome"),
        PresetItem(name: "Murmur", displayName: "📳 Murmur"),
        PresetItem(name: "Nudge", displayName: "📳 Nudge"),
        PresetItem(name: "PassingCar", displayName: "📳 PassingCar"),
        PresetItem(name: "Patter", displayName: "📳 Patter"),
        PresetItem(name: "Peal", displayName: "📳 Peal"),
        PresetItem(name: "Peck", displayName: "📳 Peck"),
        PresetItem(name: "Pendulum", displayName: "📳 Pendulum"),
        PresetItem(name: "Ping", displayName: "📳 Ping"),
        PresetItem(name: "Pip", displayName: "📳 Pip"),
        PresetItem(name: "Piston", displayName: "📳 Piston"),
        PresetItem(name: "Plink", displayName: "📳 Plink"),
        PresetItem(name: "Plummet", displayName: "📳 Plummet"),
        PresetItem(name: "Plunk", displayName: "📳 Plunk"),
        PresetItem(name: "Poke", displayName: "📳 Poke"),
        PresetItem(name: "Pound", displayName: "📳 Pound"),
        PresetItem(name: "PowerDown", displayName: "📳 PowerDown"),
        PresetItem(name: "Propel", displayName: "📳 Propel"),
        PresetItem(name: "Pulse", displayName: "📳 Pulse"),
        PresetItem(name: "Pummel", displayName: "📳 Pummel"),
        PresetItem(name: "Push", displayName: "📳 Push"),
        PresetItem(name: "Radar", displayName: "📳 Radar"),
        PresetItem(name: "Rain", displayName: "📳 Rain"),
        PresetItem(name: "Ramp", displayName: "📳 Ramp"),
        PresetItem(name: "Rap", displayName: "📳 Rap"),
        PresetItem(name: "Ratchet", displayName: "📳 Ratchet"),
        PresetItem(name: "Rebound", displayName: "📳 Rebound"),
        PresetItem(name: "Ripple", displayName: "📳 Ripple"),
        PresetItem(name: "Rivet", displayName: "📳 Rivet"),
        PresetItem(name: "Rustle", displayName: "📳 Rustle"),
        PresetItem(name: "Shockwave", displayName: "📳 Shockwave"),
        PresetItem(name: "Snap", displayName: "📳 Snap"),
        PresetItem(name: "Sonar", displayName: "📳 Sonar"),
        PresetItem(name: "Spark", displayName: "📳 Spark"),
        PresetItem(name: "Spin", displayName: "📳 Spin"),
        PresetItem(name: "Stagger", displayName: "📳 Stagger"),
        PresetItem(name: "Stamp", displayName: "📳 Stamp"),
        PresetItem(name: "Stampede", displayName: "📳 Stampede"),
        PresetItem(name: "Stomp", displayName: "📳 Stomp"),
        PresetItem(name: "StoneSkip", displayName: "📳 StoneSkip"),
        PresetItem(name: "Strike", displayName: "📳 Strike"),
        PresetItem(name: "Summon", displayName: "📳 Summon"),
        PresetItem(name: "Surge", displayName: "📳 Surge"),
        PresetItem(name: "Sway", displayName: "📳 Sway"),
        PresetItem(name: "Sweep", displayName: "📳 Sweep"),
        PresetItem(name: "Swell", displayName: "📳 Swell"),
        PresetItem(name: "Syncopate", displayName: "📳 Syncopate"),
        PresetItem(name: "Throb", displayName: "📳 Throb"),
        PresetItem(name: "Thud", displayName: "📳 Thud"),
        PresetItem(name: "Thump", displayName: "📳 Thump"),
        PresetItem(name: "Thunder", displayName: "📳 Thunder"),
        PresetItem(name: "ThunderRoll", displayName: "📳 ThunderRoll"),
        PresetItem(name: "TickTock", displayName: "📳 TickTock"),
        PresetItem(name: "TidalSurge", displayName: "📳 TidalSurge"),
        PresetItem(name: "TideSwell", displayName: "📳 TideSwell"),
        PresetItem(name: "Tremor", displayName: "📳 Tremor"),
        PresetItem(name: "Trigger", displayName: "📳 Trigger"),
        PresetItem(name: "Triumph", displayName: "📳 Triumph"),
        PresetItem(name: "Trumpet", displayName: "📳 Trumpet"),
        PresetItem(name: "Typewriter", displayName: "📳 Typewriter"),
        PresetItem(name: "Unfurl", displayName: "📳 Unfurl"),
        PresetItem(name: "Vortex", displayName: "📳 Vortex"),
        PresetItem(name: "Wane", displayName: "📳 Wane"),
        PresetItem(name: "WarDrum", displayName: "📳 WarDrum"),
        PresetItem(name: "Waterfall", displayName: "📳 Waterfall"),
        PresetItem(name: "Wave", displayName: "📳 Wave"),
        PresetItem(name: "Wisp", displayName: "📳 Wisp"),
        PresetItem(name: "Wobble", displayName: "📳 Wobble"),
        PresetItem(name: "Woodpecker", displayName: "📳 Woodpecker"),
        PresetItem(name: "Zipper", displayName: "📳 Zipper"),
// CODEGEN_END_{example_app_preset_list}
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
