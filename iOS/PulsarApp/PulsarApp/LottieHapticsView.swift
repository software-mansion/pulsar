import SwiftUI
import Pulsar
import PulsarLottie

/// Demonstrates `HapticLottieView` — a SwiftUI view that renders a Lottie
/// animation (bundled `verified.json`) and plays a Pulsar haptic pattern locked
/// to its timeline. In the default realtime mode the animation is the master
/// clock, so the haptics swell and resolve into a firm confirming tap as the
/// checkmark snaps in. Core Haptics is unavailable on the Simulator — run on a
/// real device to feel it.
struct LottieHapticsView: View {
    @State private var runId = 0

    // Pattern spanning the ~2.4s "verified" animation.
    private let verifiedPattern = PatternData(
        continuousPattern: ContinuousPattern(
            amplitude: [
                ValuePoint(time: 0, value: 0),
                ValuePoint(time: 300, value: 0.25),
                ValuePoint(time: 900, value: 0.45),
                ValuePoint(time: 1500, value: 0.65),
                ValuePoint(time: 1850, value: 0.9),
                ValuePoint(time: 2000, value: 0.15),
                ValuePoint(time: 2436, value: 0),
            ],
            frequency: [
                ValuePoint(time: 0, value: 0.35),
                ValuePoint(time: 900, value: 0.5),
                ValuePoint(time: 1850, value: 0.9),
                ValuePoint(time: 2436, value: 0.55),
            ]
        ),
        discretePattern: [
            DiscretePoint(time: 100, amplitude: 0.35, frequency: 0.55),
            DiscretePoint(time: 1500, amplitude: 0.6, frequency: 0.7),
            DiscretePoint(time: 1850, amplitude: 1, frequency: 0.9),
            DiscretePoint(time: 2050, amplitude: 0.45, frequency: 0.6),
        ]
    )

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    Text("Lottie + haptics")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.top)

                    Text("HapticLottieView renders a Lottie animation and plays a haptic pattern locked to its timeline.")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    HapticLottieView("verified", haptics: verifiedPattern, autoPlay: true)
                        .frame(width: 180, height: 180)
                        .id(runId)

                    Button(action: { runId += 1 }) {
                        Text("▶ Replay")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }

                    Text("The timeline drives the haptics, so replaying the animation keeps them in sync automatically.")
                        .font(.footnote)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
            }
            .navigationTitle("Lottie")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    LottieHapticsView()
}
