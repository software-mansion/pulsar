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

            AudioHapticsView()
                .tabItem {
                    Label("Audio", systemImage: "speaker.wave.2.fill")
                }

            LottieHapticsView()
                .tabItem {
                    Label("Lottie", systemImage: "sparkles")
                }

            BundlesView()
                .tabItem {
                    Label("Bundles", systemImage: "shippingbox.fill")
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
