import { useEffect, useRef, useState } from "react";
import { Text, Button, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePatternComposer } from "react-native-pulsar";

export /*default*/ function TestingScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "disconnected" | "error">("idle");
  const [lastMessage, setLastMessage] = useState<string>("No messages yet");

  const hapticComposer = usePatternComposer();

  const connect = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus("connecting");
    const ws = new WebSocket("wss://haptic-playground.onrender.com");
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLastMessage(JSON.stringify(parsed, null, 2));
        if (parsed.discretePattern && parsed.continuousPattern) {
          hapticComposer.parse({
            discretePattern: parsed.discretePattern,
            continuousPattern: parsed.continuousPattern,
          });
          hapticComposer.play();
        }
      } catch {
        setLastMessage(String(event.data));
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      socketRef.current = null;
    };
  };

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <SafeAreaView>
      <View style={{ marginTop: 12 }}>
        <Button
          title={status === "connected" || status === "connecting" ? "Disconnect WebSocket" : "Connect WebSocket"}
          onPress={status === "connected" || status === "connecting" ? disconnect : connect}
        />
        <Button
          title={"Play Test Haptic"}
          onPress={() => {
            hapticComposer.parse({
              discretePattern: [
                // { time: 100, amplitude: 1, frequency: 1 },
                // { time: 200, amplitude: 1, frequency: 1 },
                // { time: 300, amplitude: 1, frequency: 1 },
                // { time: 400, amplitude: 1, frequency: 1 },
                // { time: 500, amplitude: 1, frequency: 1 },
                // { time: 1500, amplitude: 1, frequency: 1 },
              ],
              continuousPattern: {
                  // amplitude: [],
                  // frequency: [],
                  amplitude: [{ time: 0, value: 0 }, { time: 1000, value: 0.5 }, { time: 2000, value: 0 }],
                  frequency: [{ time: 0, value: 0 }, { time: 1000, value: 0.5 }, { time: 2000, value: 0 }],
              },
            });
            hapticComposer.play();
          }}
        />
      </View>

      <Text style={{ marginTop: 12 }}>Status: {status}</Text>
      <Text style={{ marginTop: 8 }}>Last message:</Text>
      <Text style={{ marginTop: 4 }}>{lastMessage}</Text>
    </SafeAreaView>
  );
}