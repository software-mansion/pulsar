import SwiftUI
import Pulsar

struct ThirdScreenView: View {
    private var pulsar = Pulsar()
    private var simulator = AudioSimulator()

    
    var body: some View {
        VStack {
            Text("Third Screen")
                .font(.largeTitle)
                .padding()
            
            Button("Click") {
                pulsar.Presets().Earthquake()
            }

            Spacer()

            Button("Play Example Pattern") {
                let amplitude: [ChartPoint] = [
                    ChartPoint(x: 0.0,   y: 0.538),
                    ChartPoint(x: 0.997, y: 1.0),
                    ChartPoint(x: 1.015, y: 0.0),
                ]
                let frequency: [ChartPoint] = [
                    ChartPoint(x: 0.0,   y: 0.675),
                    ChartPoint(x: 0.996, y: 0.478),
                ]
                let barPoints: [BarChartPoint] = [
                    BarChartPoint(x: 0.1, y1: 0.8, y2: 0.5),
                    BarChartPoint(x: 0.3, y1: 0.6, y2: 0.7),
                    BarChartPoint(x: 0.6, y1: 0.9, y2: 0.3),
                    BarChartPoint(x: 0.9, y1: 0.7, y2: 0.8),
                ]
                let data = PlaygroundData(linePoints: [amplitude, frequency], barPoints: barPoints)

                simulator.parsePattern(from: data)
                simulator.play()
            }
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    ThirdScreenView()
}
