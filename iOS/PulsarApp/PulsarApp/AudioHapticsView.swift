import SwiftUI
import Pulsar

/// Demonstrates audio-synced haptics: a short music clip bundled with the app
/// is played through the `PatternComposer` together with a haptic pattern whose
/// discrete beats land on the track's onsets and whose continuous envelope
/// traces its energy. On iOS the audio is registered as a Core Haptics audio
/// event, so audio and haptics share the engine clock (sample-accurate). Core
/// Haptics is unavailable on the Simulator — run on a real device to feel it.
struct AudioHapticsView: View {
    @State private var pulsar = Pulsar()
    @State private var composer: PatternComposer?
    @State private var status = ""

    // Pattern authored to sync with `sample-3s.mp3` (music onset analysis).
    private let audioPattern = PatternData(
        continuousPattern: ContinuousPattern(
            amplitude: [
                ValuePoint(time: 0, value: 1),
                ValuePoint(time: 209, value: 0.927),
                ValuePoint(time: 348, value: 0.843),
                ValuePoint(time: 580, value: 0.789),
                ValuePoint(time: 720, value: 0.791),
                ValuePoint(time: 859, value: 0.693),
                ValuePoint(time: 1022, value: 0.718),
                ValuePoint(time: 1161, value: 0.665),
                ValuePoint(time: 1324, value: 0.565),
                ValuePoint(time: 1463, value: 0.432),
                ValuePoint(time: 1649, value: 0.201),
                ValuePoint(time: 1788, value: 0.068),
                ValuePoint(time: 3181, value: 0.014),
            ],
            frequency: [
                ValuePoint(time: 0, value: 0.402),
                ValuePoint(time: 232, value: 0.061),
                ValuePoint(time: 604, value: 0.077),
                ValuePoint(time: 836, value: 0.23),
                ValuePoint(time: 1068, value: 0.293),
                ValuePoint(time: 1324, value: 0.346),
                ValuePoint(time: 1625, value: 0.437),
                ValuePoint(time: 1904, value: 0.513),
                ValuePoint(time: 2206, value: 0.63),
                ValuePoint(time: 2438, value: 0.822),
                ValuePoint(time: 2670, value: 0.975),
                ValuePoint(time: 2902, value: 0.947),
                ValuePoint(time: 3181, value: 0.861),
            ]
        ),
        discretePattern: [
            DiscretePoint(time: 70, amplitude: 0.299, frequency: 0.159),
            DiscretePoint(time: 232, amplitude: 0.401, frequency: 0.416),
            DiscretePoint(time: 441, amplitude: 0.627, frequency: 0.663),
            DiscretePoint(time: 627, amplitude: 0.31, frequency: 0.607),
            DiscretePoint(time: 836, amplitude: 0.792, frequency: 0.634),
            DiscretePoint(time: 1022, amplitude: 0.394, frequency: 0.379),
            DiscretePoint(time: 1231, amplitude: 0.806, frequency: 0.679),
            DiscretePoint(time: 1440, amplitude: 0.612, frequency: 0.525),
            DiscretePoint(time: 1649, amplitude: 0.232, frequency: 0.767),
            DiscretePoint(time: 2020, amplitude: 0.239, frequency: 0.625),
            DiscretePoint(time: 2438, amplitude: 0.385, frequency: 0.743),
            DiscretePoint(time: 2624, amplitude: 0.226, frequency: 0.468),
            DiscretePoint(time: 2833, amplitude: 0.446, frequency: 0.733),
        ]
    )

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Audio-synced haptics")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top)

                    Text("A 3-second music clip played through the pattern composer, with haptics authored to land on the beat.")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    VStack(spacing: 8) {
                        Text("sample-3s.mp3")
                            .font(.headline)
                        Text("13 discrete beats + a continuous energy envelope")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 10)

                    Button(action: play) {
                        Text("▶ Play with haptics")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }

                    Button(action: stop) {
                        Text("■ Stop")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray5))
                            .foregroundColor(.primary)
                            .cornerRadius(10)
                    }

                    if !status.isEmpty {
                        Text(status)
                            .font(.footnote)
                            .foregroundColor(.gray)
                    }

                    Text("The clip is attached via parsePatternWithSound(uri:), so audio and haptics share one clock — no manual scheduling. Requires a real device (no Core Haptics on the Simulator).")
                        .font(.footnote)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.top, 8)
                        .padding(.horizontal)
                }
                .padding()
            }
            .navigationTitle("Audio")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func play() {
        let composer = composer ?? pulsar.getPatternComposer()
        self.composer = composer
        // A bare/unqualified name defaults to `.wav`; pass the extension so the
        // bundled `sample-3s.mp3` resolves. A missing file degrades to
        // haptics-only.
        composer.parsePatternWithSound(hapticsData: audioPattern, uri: "sample-3s.mp3", volume: 1.0)
        composer.play()
        status = "Playing sample-3s.mp3 with synced haptics"
    }

    private func stop() {
        composer?.stop()
        status = "Stopped"
    }
}

#Preview {
    AudioHapticsView()
}
