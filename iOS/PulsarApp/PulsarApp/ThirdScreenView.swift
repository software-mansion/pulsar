import SwiftUI
import Pulsar

struct ThirdScreenView: View {
    private var pulsar = Pulsar()
    
    var body: some View {
        VStack {
            Text("Third Screen")
                .font(.largeTitle)
                .padding()
            
            Button(action: handlePress) {
                Text("Press Me")
                    .font(.title2)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            
            Spacer()
        }
        .padding()
    }
    
    func handlePress() {
      pulsar.Presets().Earthquake()
    }
}

#Preview {
    ThirdScreenView()
}
