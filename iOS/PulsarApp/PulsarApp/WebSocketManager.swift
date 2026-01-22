import Foundation
import Starscream
import Pulsar

class WebSocketManager: ObservableObject, WebSocketDelegate {
  
  var socket: WebSocket?
  var socketPlayground: WebSocket?
  @Published var message: String = ""
  @Published var statusInfo: String = "You are not connected 😕"
  let pulsar: Pulsar = Pulsar()
  var composer: PatternComposerImpl? = nil
  var channel: String = "1234"
  var isConnected: Bool = false
  var playAnimation: Bool = false
  
  func connect() {
    // var request = URLRequest(url: URL(string: "wss://haptics-server.onrender.com?channel=" + channel)!)
    var request = URLRequest(url: URL(string: "ws://192.168.92.124:8080?channel=" + channel)!)
    request.timeoutInterval = 5
    
    UserDefaults.standard.set(channel, forKey: "channel")
    
    statusInfo = "Connecting to server..."
    
    socket = WebSocket(request: request)
    socket?.delegate = self
    socket?.connect()
    
    DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
      if (self.isConnected == true ) { return }
      self.statusInfo = "Unable to server connect.\nPlease try again later."
    }
    
//    connectToPlayground()
    composer = pulsar.PatternComposer()
  }
  
  func connectToPlayground() {
    var request = URLRequest(url: URL(string: "ws://192.168.92.124:8080")!)
    request.timeoutInterval = 5
    socketPlayground = WebSocket(request: request)
    socketPlayground?.delegate = self
    socketPlayground?.connect()
  }

  func didReceive(event: Starscream.WebSocketEvent, client: any Starscream.WebSocketClient) {
    switch event {
    case .connected(_):
        print("WebSocket connected")
    case .disconnected(let reason, let code):
        print("WebSocket disconnected: \(reason) with code: \(code)")
        self.isConnected = false
        self.statusInfo = "You are not connected 😕"
    case .text(let jsonData):
        DispatchQueue.main.async {
          self.isConnected = true
          self.message = jsonData
          self.statusInfo = "You are connected! 🎉"
          print("Received text: \(jsonData)")
          let pattern = self.composer?.parseJSON(jsonData)
          if (pattern != nil) {
            self.composer?.playPattern(hapticsData: pattern!);
          }
        }
        
    case .error(let error):
        print("WebSocket error: \(String(describing: error))")
        statusInfo = "Unable to server connect.\nPlease try again later."
    default:
        break
    }
  }

  deinit {
    socket?.disconnect()
    socket?.delegate = nil
    
    socketPlayground?.disconnect()
    socketPlayground?.delegate = nil
  }
}
