import SwiftUI
import Pulsar

struct APITestingView: View {
    @State private var pulsar = Pulsar()
    @State private var patternComposer: PatternComposer?
    
    // State variables for toggles
    @State private var hapticsEnabled = true
    @State private var soundEnabled = true
    @State private var cacheEnabled = true
    
    // State variables for status messages
    @State private var hapticsSupportStatus = "Unknown"
    @State private var cacheClearedStatus = ""
    @State private var presetsPreloadedStatus = ""
    @State private var stopHapticsStatus = ""
    @State private var shutdownStatus = ""
    @State private var patternParsedStatus = ""
    @State private var patternPlayingStatus = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Pulsar API Testing")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top)
                    
                    Text("Test all public APIs")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .padding(.bottom, 10)
                    
                    // Pulsar Core APIs Section
                    SectionHeaderView(title: "Core APIs")
                    
                    // Toggle APIs
                    VStack(spacing: 15) {
                        APIToggleRow(
                            title: "Enable Haptics",
                            isOn: $hapticsEnabled,
                            onToggle: { enabled in
                                pulsar.enableHaptics(state: enabled)
                            }
                        )
                        
                        APIToggleRow(
                            title: "Enable Sound",
                            isOn: $soundEnabled,
                            onToggle: { enabled in
                                pulsar.enableSound(state: enabled)
                            }
                        )
                        
                        APIToggleRow(
                            title: "Enable Cache",
                            isOn: $cacheEnabled,
                            onToggle: { enabled in
                                pulsar.enableCache(state: enabled)
                            }
                        )
                    }
                    
                    // Action APIs
                    VStack(spacing: 15) {
                        APIButtonRow(
                            title: "Clear Cache",
                            statusMessage: cacheClearedStatus,
                            action: {
                                pulsar.clearCache()
                                cacheClearedStatus = "Cache cleared"
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    cacheClearedStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Preload Presets",
                            statusMessage: presetsPreloadedStatus,
                            action: {
                                pulsar.preloadPresets(presetNames: ["Success", "Fail", "Tap"])
                                presetsPreloadedStatus = "Preloaded: Success, Fail, Tap"
                                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                    presetsPreloadedStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Stop Haptics",
                            statusMessage: stopHapticsStatus,
                            action: {
                                pulsar.stopHaptics()
                                stopHapticsStatus = "Haptics stopped"
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    stopHapticsStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Shutdown Engine",
                            statusMessage: shutdownStatus,
                            action: {
                                pulsar.shutDownEngine()
                                shutdownStatus = "Engine shut down"
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    shutdownStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Check Haptic Support",
                            statusMessage: hapticsSupportStatus,
                            action: {
                                let supported = pulsar.isHapticsSupported()
                                hapticsSupportStatus = supported ? "✅ Supported" : "❌ Not Supported"
                            }
                        )
                    }
                    
                    // Pattern Composer APIs Section
                    SectionHeaderView(title: "Pattern Composer APIs")
                    
                    VStack(spacing: 15) {
                        APIButtonRow(
                            title: "Parse Pattern",
                            statusMessage: patternParsedStatus,
                            action: {
                                let amplitude: [ValuePoint] = [
                                    ValuePoint(time: 0.0, value: 0.5),
                                    ValuePoint(time: 0.5, value: 1.0),
                                    ValuePoint(time: 1.0, value: 0.0),
                                ]
                                let frequency: [ValuePoint] = [
                                    ValuePoint(time: 0.0, value: 0.6),
                                    ValuePoint(time: 1.0, value: 0.4),
                                ]
                                let discretePattern: [DiscretePoint] = [
                                    DiscretePoint(time: 0.2, amplitude: 0.8, frequency: 0.5),
                                    DiscretePoint(time: 0.6, amplitude: 0.9, frequency: 0.7),
                                ]
                                let data = PatternData(
                                    continuousPattern: ContinuousPattern(amplitude: amplitude, frequency: frequency),
                                    discretePattern: discretePattern
                                )
                                
                                if patternComposer == nil {
                                    patternComposer = pulsar.getPatternComposer()
                                }
                                patternComposer?.parsePattern(hapticsData: data)
                                patternParsedStatus = "Pattern parsed successfully"
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    patternParsedStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Play Pattern",
                            statusMessage: patternPlayingStatus,
                            action: {
                                if patternComposer == nil {
                                    // Create a default pattern first
                                    patternComposer = pulsar.getPatternComposer()
                                    let amplitude: [ValuePoint] = [
                                        ValuePoint(time: 0.0, value: 0.5),
                                        ValuePoint(time: 500, value: 1.0),
                                        ValuePoint(time: 1000, value: 0.0),
                                    ]
                                    let frequency: [ValuePoint] = [
                                        ValuePoint(time: 0, value: 0.6),
                                        ValuePoint(time: 1000, value: 0.4),
                                    ]
                                    let discretePattern: [DiscretePoint] = [
                                        DiscretePoint(time: 200, amplitude: 0.8, frequency: 0.5),
                                    ]
                                    let data = PatternData(
                                        continuousPattern: ContinuousPattern(amplitude: amplitude, frequency: frequency),
                                        discretePattern: discretePattern
                                    )
                                    patternComposer?.parsePattern(hapticsData: data)
                                }
                                
                                patternComposer?.play()
                                patternPlayingStatus = "🎵 Playing pattern..."
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                    patternPlayingStatus = ""
                                }
                            }
                        )
                        
                        APIButtonRow(
                            title: "Stop Pattern",
                            statusMessage: "",
                            action: {
                                patternComposer?.stop()
                            }
                        )
                    }
                    
                    Spacer()
                        .frame(height: 30)
                }
                .padding()
            }
        }
    }
}

struct SectionHeaderView: View {
    let title: String
    
    var body: some View {
        Text(title)
            .font(.title2)
            .fontWeight(.bold)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 10)
    }
}

struct APIToggleRow: View {
    let title: String
    @Binding var isOn: Bool
    let onToggle: (Bool) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Toggle("", isOn: $isOn)
                    .labelsHidden()
                    .onChange(of: isOn) { oldValue, newValue in
                        onToggle(newValue)
                    }
            }
            
            Text(isOn ? "Enabled" : "Disabled")
                .font(.caption)
                .foregroundColor(isOn ? .green : .gray)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .gray.opacity(0.2), radius: 4, x: 0, y: 2)
        )
    }
}

struct APIButtonRow: View {
    let title: String
    let statusMessage: String
    let action: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button(action: action) {
                HStack {
                    Text(title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.blue)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemBackground))
                        .shadow(color: .gray.opacity(0.2), radius: 4, x: 0, y: 2)
                )
            }
            
            if !statusMessage.isEmpty {
                Text(statusMessage)
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.horizontal)
                    .transition(.opacity)
            }
        }
    }
}

#Preview {
    APITestingView()
}
