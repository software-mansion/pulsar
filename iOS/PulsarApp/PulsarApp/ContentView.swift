import SwiftUI
import Pulsar
import Starscream

import CoreHaptics

struct ContentView: View {

  @State private var engine: CHHapticEngine?
  @State private var player: CHHapticAdvancedPatternPlayer?
  @State private var intensity: Float = 0.5
  @StateObject private var webSocketManager = WebSocketManager()
  @State private var animateGradient = false
  
  @State var happytic = Pulsar();
  
  func connect() {
    DispatchQueue.main.async {
      UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to:nil, from:nil, for:nil)
    }
    webSocketManager.connect()
  }

  var body: some View {
    VStack {
      Text("Haptic playground")
        .font(.title)
      HStack {
        TextField("Channel number...", text: $webSocketManager.channel, )
          .padding(5)
          .border(Color.gray)
          .cornerRadius(5)
          .overlay(
            RoundedRectangle(cornerRadius: 5)
            .stroke(.black, lineWidth: 1)
          )
          .font(.system(size: 20))
          .onAppear() {
            webSocketManager.channel = UserDefaults.standard.string(forKey: "channel") ?? ""
          }
        Button("Connect", systemImage: "paperplane.fill", action: connect)
          .buttonStyle(.borderedProminent)
          .foregroundColor(.black)
          .tint(Color(hex: "F9CF93"))
      }
      HStack {
        Circle()
          .fill(webSocketManager.isConnected ? Color.green : Color.red)
          .frame(width: 20, height: 20)
        Text(webSocketManager.statusInfo)
          .frame(maxWidth: .infinity, alignment: .leading)
        
      }
      .padding(.top)
      .padding(.bottom)
      Text("Server message:")
        .frame(maxWidth: .infinity, alignment: .leading)
      Text(webSocketManager.message)
        .padding()
        .background(Color.gray.opacity(0.2))
        .cornerRadius(10)
        .frame(maxWidth: .infinity, alignment: .leading)
      
//      Button(action: {
//        happytic.Presets().Earthquake()
//      }) {
//        Text("Click")
//          .font(.title)
//      }
      Spacer()
    }
    .padding()
    .background(
      MeshGradient(
        width: 2,
        height: 2,
        points: [
          animateGradient ? [-0.2, 0] : [0, 0], [1, 0],
          [0, 1], animateGradient ? [1, 1.2] :[1, 1]
        ],
        colors:
          animateGradient ? [
            Color(hex: "F9CF93").opacity(1), Color(hex: "F9E4C8").opacity(0.7),
            Color(hex: "FAEEE0").opacity(0.5), Color(hex: "DBD0C0").opacity(1)
          ]
          : [
            Color(hex: "F9CF93").opacity(0.6), Color(hex: "F9E4C8").opacity(1),
            Color(hex: "FAEEE0").opacity(1), Color(hex: "DBD0C0").opacity(0.8)
          ]
      )
//      .animation(
//        .easeInOut(duration: 5)
//          .repeatForever(autoreverses: true),
//        value: animateGradient
//      )
      .onAppear() {
        animateGradient = true
      }
      .edgesIgnoringSafeArea(.all)
    )
  }
}

extension Color {
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let a, r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
      (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
      (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8: // ARGB (32-bit)
      (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
      (a, r, g, b) = (1, 1, 1, 0)
    }

    self.init(
      .sRGB,
      red: Double(r) / 255,
      green: Double(g) / 255,
      blue:  Double(b) / 255,
      opacity: Double(a) / 255
    )
  }
}

#Preview {
    ContentView()
}
