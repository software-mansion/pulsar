import SwiftUI

@main
struct iOSApp: App {
    init() {
        PulsarBridgeBootstrap.register()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
