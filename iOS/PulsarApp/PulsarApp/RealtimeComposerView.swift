import SwiftUI
import CoreHaptics
import Pulsar

struct MultiTouchPad: UIViewRepresentable {
    var onTouchDown: (CGPoint) -> Void
    var onDragChanged: (CGPoint) -> Void
    var onDragEnded: () -> Void

    func makeUIView(context: Context) -> MultiTouchView {
        let view = MultiTouchView()
        view.onTouchDown = onTouchDown
        view.onDragChanged = onDragChanged
        view.onDragEnded = onDragEnded
        return view
    }

    func updateUIView(_ uiView: MultiTouchView, context: Context) {
        uiView.onTouchDown = onTouchDown
        uiView.onDragChanged = onDragChanged
        uiView.onDragEnded = onDragEnded
    }
    
    class MultiTouchView: UIView {
        var onTouchDown: ((CGPoint) -> Void)?
        var onDragChanged: ((CGPoint) -> Void)?
        var onDragEnded: (() -> Void)?
        
        private var draggingTouch: UITouch?

        override init(frame: CGRect) {
            super.init(frame: frame)
            self.isMultipleTouchEnabled = true
            self.backgroundColor = .clear
        }
        
        required init?(coder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }
        
        override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
            for touch in touches {
                let location = touch.location(in: self)
                
                onTouchDown?(location)
                
                if draggingTouch == nil {
                    draggingTouch = touch
                    onDragChanged?(location)
                }
            }
        }
        
        override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
            if let dragTouch = draggingTouch, touches.contains(dragTouch) {
                let location = dragTouch.location(in: self)
                onDragChanged?(location)
            }
        }
        
        override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
            handleTouchEnd(touches)
        }
        
        override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
            handleTouchEnd(touches)
        }
        
        private func handleTouchEnd(_ touches: Set<UITouch>) {
            if let dragTouch = draggingTouch, touches.contains(dragTouch) {
                draggingTouch = nil
                onDragEnded?()
            }
        }
    }
}

struct RealtimeComposerView: View {
    @State private var pulsar = Pulsar()
    @State private var composer: RealtimeComposer?
    @State private var pointerLocation: CGPoint = .zero
    @State private var isDragging = false
    @State private var tapLocation: CGPoint = .zero
    @State private var showTapDot: Bool = false
    
    var body: some View {
        VStack {
            Text("Realtime Haptics Composer")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding()
            
            Text(isDragging ? "Dragging..." : "Tap or Drag (Multi-touch Ready)")
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.bottom, 20)
            
            ZStack {
                RoundedRectangle(cornerRadius: 20)
                    .fill(
                        LinearGradient(
                            colors: isDragging ?
                            [Color.blue.opacity(0.3), Color.purple.opacity(0.3)] :
                                [Color.gray.opacity(0.2), Color.gray.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(isDragging ? Color.blue : Color.gray, lineWidth: 3)
                    )
                
                Circle()
                    .fill(Color.red.opacity(0.7))
                    .frame(width: 20, height: 20)
                    .position(x: pointerLocation.x, y: pointerLocation.y)
                    .opacity(isDragging ? 1 : 0)
                
                Circle()
                    .fill(Color.orange.opacity(0.9))
                    .frame(width: 16, height: 16)
                    .position(x: tapLocation.x, y: tapLocation.y)
                    .opacity(showTapDot ? 1 : 0)
                
                MultiTouchPad(
                    onTouchDown: { location in
                        handleTap(at: location)
                    },
                    onDragChanged: { location in
                        handleDrag(at: location)
                    },
                    onDragEnded: {
                        handleDragEnd()
                    }
                )
            }
            .frame(width: 300, height: 300)
            
            VStack(alignment: .leading, spacing: 10) {
                Text("Intensity: \(String(format: "%.2f", getIntensity()))")
                Text("Sharpness: \(String(format: "%.2f", getSharpness()))")
            }
            .font(.system(.body, design: .monospaced))
            .padding()
            
            Spacer()
        }
        .padding()
        .onAppear {
             composer = pulsar.getRealtimeComposer()
        }
    }
    
    func getIntensity(at location: CGPoint? = nil) -> Float {
        let point = location ?? pointerLocation
        return Float(min(max((300.0 - point.y) / 300.0, 0), 1))
    }
    
    func getSharpness(at location: CGPoint? = nil) -> Float {
        let point = location ?? pointerLocation
        return Float(min(max(point.x / 300.0, 0), 1))
    }
    
    func handleTap(at location: CGPoint) {
        // Show tap dot without affecting drag pointer
        tapLocation = location
        showTapDot = true
        composer?.playDiscrete(amplitude: getIntensity(at: location), frequency: getSharpness(at: location))
        
        // Auto-hide tap dot after 100ms
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            showTapDot = false
        }
    }
    
    func handleDrag(at location: CGPoint) {
        pointerLocation = location
        
        if !isDragging {
            isDragging = true
        }
        composer?.set(amplitude: getIntensity(), frequency: getSharpness())
    }
    
    func handleDragEnd() {
        isDragging = false
        composer?.stop()
    }
}

#Preview {
    RealtimeComposerView()
}
