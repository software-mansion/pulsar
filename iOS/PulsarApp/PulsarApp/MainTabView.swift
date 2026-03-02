import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            PresetsListView()
                .tabItem {
                    Label("Presets", systemImage: "list.bullet")
                }
            
            RealtimeComposerView()
                .tabItem {
                    Label("Composer", systemImage: "waveform.circle.fill")
                }
            
            APITestingView()
                .tabItem {
                    Label("API Tests", systemImage: "hammer.fill")
                }
        }
    }
}

#Preview {
    MainTabView()
}
