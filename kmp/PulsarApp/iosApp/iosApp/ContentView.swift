import UIKit
import SwiftUI
import ComposeApp

final class IOSSwiftMessageProvider: NSObject, IosSwiftMessageProvider {
    func makeMessage() -> String {
        "Hello from Swift on iOS."
    }
}

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController(swiftMessageProvider: IOSSwiftMessageProvider())
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea()
    }
}

