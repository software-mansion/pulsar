import SwiftUI
import Pulsar

struct ThirdScreenView: View {
    private var pulsar = Pulsar()
    private var simulator = AudioSimulator()
    @State var tmp: PatternComposerImpl?

    var body: some View {
        VStack {
            Text("Third Screen")
                .font(.largeTitle)
                .padding()
            
            Button("Click") {
                pulsar.Presets().Success()
            }

            Spacer()

            Button("Play Example Pattern") {
                let amplitude: [PatternPoint] = [
                    PatternPoint(time: 0.0,   value: 0.538),
                    PatternPoint(time: 0.997, value: 1.0),
                    PatternPoint(time: 1.015, value: 0.0),
                ]
                let frequency: [PatternPoint] = [
                    PatternPoint(time: 0.0,   value: 0.675),
                    PatternPoint(time: 0.996, value: 0.478),
                ]
                let discretePattern: [DiscretePoint] = [
                    DiscretePoint(time: 0.1, amplitude: 0.8, frequency: 0.5),
                    DiscretePoint(time: 0.3, amplitude: 0.6, frequency: 0.7),
                    DiscretePoint(time: 0.6, amplitude: 0.9, frequency: 0.3),
                    DiscretePoint(time: 0.9, amplitude: 0.7, frequency: 0.8),
                ]
                let data = PatternData(continuesPattern: ContinuesPattern(amplitude: amplitude, frequency: frequency), discretePattern: discretePattern)

                tmp = pulsar.PatternComposer()
                tmp?.parsePattern(hapticsData: data)
                tmp?.play()
                simulator.play(buffer: simulator.parsePattern(from: data))
            }
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    ThirdScreenView()
}
