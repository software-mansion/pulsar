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
        PresetItem(name: "AimingFire", displayName: "📳 AimingFire"),
        PresetItem(name: "AimingLock", displayName: "📳 AimingLock"),
        PresetItem(name: "Alarm", displayName: "📳 Alarm"),
        PresetItem(name: "AngerFrustration", displayName: "📳 AngerFrustration"),
        PresetItem(name: "Applause", displayName: "📳 Applause"),
        PresetItem(name: "Attention", displayName: "📳 Attention"),
        PresetItem(name: "BalloonPop", displayName: "📳 BalloonPop"),
        PresetItem(name: "BangDoor", displayName: "📳 BangDoor"),
        PresetItem(name: "Barrage", displayName: "📳 Barrage"),
        PresetItem(name: "BoredomFlat", displayName: "📳 BoredomFlat"),
        PresetItem(name: "Breath", displayName: "📳 Breath"),
        PresetItem(name: "BtnChip", displayName: "📳 BtnChip"),
        PresetItem(name: "BtnDestructive", displayName: "📳 BtnDestructive"),
        PresetItem(name: "BtnGhost", displayName: "📳 BtnGhost"),
        PresetItem(name: "BtnIcon", displayName: "📳 BtnIcon"),
        PresetItem(name: "BtnMenu", displayName: "📳 BtnMenu"),
        PresetItem(name: "BtnPrimary", displayName: "📳 BtnPrimary"),
        PresetItem(name: "BtnSecondary", displayName: "📳 BtnSecondary"),
        PresetItem(name: "BtnSubmit", displayName: "📳 BtnSubmit"),
        PresetItem(name: "BtnToggleOff", displayName: "📳 BtnToggleOff"),
        PresetItem(name: "Buildup", displayName: "📳 Buildup"),
        PresetItem(name: "CameraShutter", displayName: "📳 CameraShutter"),
        PresetItem(name: "Cascade", displayName: "📳 Cascade"),
        PresetItem(name: "CleanStrike", displayName: "📳 CleanStrike"),
        PresetItem(name: "CoinDrop", displayName: "📳 CoinDrop"),
        PresetItem(name: "CombinationLock", displayName: "📳 CombinationLock"),
        PresetItem(name: "Confirm", displayName: "📳 Confirm"),
        PresetItem(name: "Cowboy", displayName: "📳 Cowboy"),
        PresetItem(name: "Crescendo", displayName: "📳 Crescendo"),
        PresetItem(name: "CrossedEyes", displayName: "📳 CrossedEyes"),
        PresetItem(name: "Cursing", displayName: "📳 Cursing"),
        PresetItem(name: "DeepRumble", displayName: "📳 DeepRumble"),
        PresetItem(name: "DeepThud", displayName: "📳 DeepThud"),
        PresetItem(name: "DogBark", displayName: "📳 DogBark"),
        PresetItem(name: "DoubleBeat", displayName: "📳 DoubleBeat"),
        PresetItem(name: "DoubleBlast", displayName: "📳 DoubleBlast"),
        PresetItem(name: "DoubleBurst", displayName: "📳 DoubleBurst"),
        PresetItem(name: "DoubleClick", displayName: "📳 DoubleClick"),
        PresetItem(name: "DoubleGentleTap", displayName: "📳 DoubleGentleTap"),
        PresetItem(name: "DoublePat", displayName: "📳 DoublePat"),
        PresetItem(name: "DoublePulse", displayName: "📳 DoublePulse"),
        PresetItem(name: "DoublePunch", displayName: "📳 DoublePunch"),
        PresetItem(name: "DoubleStrike", displayName: "📳 DoubleStrike"),
        PresetItem(name: "DoubleTap", displayName: "📳 DoubleTap"),
        PresetItem(name: "DoubleThud", displayName: "📳 DoubleThud"),
        PresetItem(name: "DoubleTriplet", displayName: "📳 DoubleTriplet"),
        PresetItem(name: "EngineRev", displayName: "📳 EngineRev"),
        PresetItem(name: "ErrorBuzz", displayName: "📳 ErrorBuzz"),
        PresetItem(name: "ErrorSoft", displayName: "📳 ErrorSoft"),
        PresetItem(name: "ExplodingHead", displayName: "📳 ExplodingHead"),
        PresetItem(name: "Explosion", displayName: "📳 Explosion"),
        PresetItem(name: "EyeRolling", displayName: "📳 EyeRolling"),
        PresetItem(name: "FadeOut", displayName: "📳 FadeOut"),
        PresetItem(name: "FanfareShort", displayName: "📳 FanfareShort"),
        PresetItem(name: "FirmImpact", displayName: "📳 FirmImpact"),
        PresetItem(name: "GameCombo", displayName: "📳 GameCombo"),
        PresetItem(name: "GameHit", displayName: "📳 GameHit"),
        PresetItem(name: "GameLevelUp", displayName: "📳 GameLevelUp"),
        PresetItem(name: "GamePickup", displayName: "📳 GamePickup"),
        PresetItem(name: "Glitch", displayName: "📳 Glitch"),
        PresetItem(name: "GravityFreefall", displayName: "📳 GravityFreefall"),
        PresetItem(name: "GrinningSquinting", displayName: "📳 GrinningSquinting"),
        PresetItem(name: "GuitarStrum", displayName: "📳 GuitarStrum"),
        PresetItem(name: "Hail", displayName: "📳 Hail"),
        PresetItem(name: "HappinessJoyful", displayName: "📳 HappinessJoyful"),
        PresetItem(name: "HappinessLight", displayName: "📳 HappinessLight"),
        PresetItem(name: "Heartbeat", displayName: "📳 Heartbeat"),
        PresetItem(name: "HeavyImpact", displayName: "📳 HeavyImpact"),
        PresetItem(name: "KeyboardMechanical", displayName: "📳 KeyboardMechanical"),
        PresetItem(name: "KeyboardMembrane", displayName: "📳 KeyboardMembrane"),
        PresetItem(name: "KeyboardTypewriterOld", displayName: "📳 KeyboardTypewriterOld"),
        PresetItem(name: "KnockDoor", displayName: "📳 KnockDoor"),
        PresetItem(name: "LevelUp", displayName: "📳 LevelUp"),
        PresetItem(name: "LoaderBreathing", displayName: "📳 LoaderBreathing"),
        PresetItem(name: "LoaderPulse", displayName: "📳 LoaderPulse"),
        PresetItem(name: "LoaderRadar", displayName: "📳 LoaderRadar"),
        PresetItem(name: "LoaderSpin", displayName: "📳 LoaderSpin"),
        PresetItem(name: "LoaderWave", displayName: "📳 LoaderWave"),
        PresetItem(name: "Lock", displayName: "📳 Lock"),
        PresetItem(name: "LongPress", displayName: "📳 LongPress"),
        PresetItem(name: "MarioGameOver", displayName: "📳 MarioGameOver"),
        PresetItem(name: "MaxImpact", displayName: "📳 MaxImpact"),
        PresetItem(name: "MutedImpact", displayName: "📳 MutedImpact"),
        PresetItem(name: "NeutralClear", displayName: "📳 NeutralClear"),
        PresetItem(name: "NeutralSteady", displayName: "📳 NeutralSteady"),
        PresetItem(name: "NewMessage", displayName: "📳 NewMessage"),
        PresetItem(name: "Notification", displayName: "📳 Notification"),
        PresetItem(name: "NotificationKnock", displayName: "📳 NotificationKnock"),
        PresetItem(name: "NotificationUrgent", displayName: "📳 NotificationUrgent"),
        PresetItem(name: "NotifyInfoStandard", displayName: "📳 NotifyInfoStandard"),
        PresetItem(name: "NotifyReminderFinal", displayName: "📳 NotifyReminderFinal"),
        PresetItem(name: "NotifyReminderNudge", displayName: "📳 NotifyReminderNudge"),
        PresetItem(name: "NotifyReminderSoft", displayName: "📳 NotifyReminderSoft"),
        PresetItem(name: "NotifySocialMention", displayName: "📳 NotifySocialMention"),
        PresetItem(name: "NotifySocialMessage", displayName: "📳 NotifySocialMessage"),
        PresetItem(name: "NotifySuccessSubtle", displayName: "📳 NotifySuccessSubtle"),
        PresetItem(name: "NotifyTimerDone", displayName: "📳 NotifyTimerDone"),
        PresetItem(name: "NotifyWarnMild", displayName: "📳 NotifyWarnMild"),
        PresetItem(name: "NotifyWarnModerate", displayName: "📳 NotifyWarnModerate"),
        PresetItem(name: "PassingCar", displayName: "📳 PassingCar"),
        PresetItem(name: "Pendulum", displayName: "📳 Pendulum"),
        PresetItem(name: "PowerDown", displayName: "📳 PowerDown"),
        PresetItem(name: "QuadBeat", displayName: "📳 QuadBeat"),
        PresetItem(name: "QuadRamp", displayName: "📳 QuadRamp"),
        PresetItem(name: "QuadThud", displayName: "📳 QuadThud"),
        PresetItem(name: "Rain", displayName: "📳 Rain"),
        PresetItem(name: "ReadySteadyGo", displayName: "📳 ReadySteadyGo"),
        PresetItem(name: "ReliefSigh", displayName: "📳 ReliefSigh"),
        PresetItem(name: "ReliefSoft", displayName: "📳 ReliefSoft"),
        PresetItem(name: "Ripple", displayName: "📳 Ripple"),
        PresetItem(name: "SadnessMelancholic", displayName: "📳 SadnessMelancholic"),
        PresetItem(name: "Searching", displayName: "📳 Searching"),
        PresetItem(name: "SearchSuccess", displayName: "📳 SearchSuccess"),
        PresetItem(name: "SelectionCrisp", displayName: "📳 SelectionCrisp"),
        PresetItem(name: "SelectionSnap", displayName: "📳 SelectionSnap"),
        PresetItem(name: "Shockwave", displayName: "📳 Shockwave"),
        PresetItem(name: "Sneezing", displayName: "📳 Sneezing"),
        PresetItem(name: "Spark", displayName: "📳 Spark"),
        PresetItem(name: "SuccessFlourish", displayName: "📳 SuccessFlourish"),
        PresetItem(name: "SuccessGentle", displayName: "📳 SuccessGentle"),
        PresetItem(name: "SupportSteady", displayName: "📳 SupportSteady"),
        PresetItem(name: "SupportStrong", displayName: "📳 SupportStrong"),
        PresetItem(name: "SurpriseGasp", displayName: "📳 SurpriseGasp"),
        PresetItem(name: "Tada", displayName: "📳 Tada"),
        PresetItem(name: "Thunder", displayName: "📳 Thunder"),
        PresetItem(name: "ThunderRoll", displayName: "📳 ThunderRoll"),
        PresetItem(name: "TickTock", displayName: "📳 TickTock"),
        PresetItem(name: "TideSwell", displayName: "📳 TideSwell"),
        PresetItem(name: "TripleBeat", displayName: "📳 TripleBeat"),
        PresetItem(name: "TripleClick", displayName: "📳 TripleClick"),
        PresetItem(name: "TripleDecay", displayName: "📳 TripleDecay"),
        PresetItem(name: "TripleDrum", displayName: "📳 TripleDrum"),
        PresetItem(name: "TripleEscalation", displayName: "📳 TripleEscalation"),
        PresetItem(name: "TripleFade", displayName: "📳 TripleFade"),
        PresetItem(name: "TripleGentleTap", displayName: "📳 TripleGentleTap"),
        PresetItem(name: "TripleKnock", displayName: "📳 TripleKnock"),
        PresetItem(name: "TriplePat", displayName: "📳 TriplePat"),
        PresetItem(name: "TriplePulse", displayName: "📳 TriplePulse"),
        PresetItem(name: "TripleStrike", displayName: "📳 TripleStrike"),
        PresetItem(name: "TripleSurge", displayName: "📳 TripleSurge"),
        PresetItem(name: "TripleTap", displayName: "📳 TripleTap"),
        PresetItem(name: "TripleThud", displayName: "📳 TripleThud"),
        PresetItem(name: "Victory", displayName: "📳 Victory"),
        PresetItem(name: "Vomiting", displayName: "📳 Vomiting"),
        PresetItem(name: "Vortex", displayName: "📳 Vortex"),
        PresetItem(name: "WarningPulse", displayName: "📳 WarningPulse"),
        PresetItem(name: "WarningSoft", displayName: "📳 WarningSoft"),
        PresetItem(name: "WarningUrgent", displayName: "📳 WarningUrgent"),
        PresetItem(name: "Waterfall", displayName: "📳 Waterfall"),
        PresetItem(name: "Woodpecker", displayName: "📳 Woodpecker"),
        PresetItem(name: "ZeldaChest", displayName: "📳 ZeldaChest"),
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
