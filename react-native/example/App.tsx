import { View, StyleSheet, Button } from 'react-native';
import { Presets } from 'react-native-pulsar';
import { runOnUI } from 'react-native-worklets';
import { useRealtimeComposer } from 'react-native-pulsar';
import usePatternComposer from '../react-native-pulsar/src/usePatternComposer';

export default function App() {
  const realtimeComposer = useRealtimeComposer();
  const patternComposer = usePatternComposer({discretePattern: [], continuousPattern: {amplitude: [], frequency: []}})

  return (
    <View style={styles.container}>
      <Button title="test" onPress={() => {
        runOnUI(() => {
          'worklet';
          Presets.Earthquake();
          realtimeComposer.update(50, 50);
          realtimeComposer.stop();
          patternComposer.play();
        })();
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 100,
    position: 'absolute',
    top: 270,
  },
  button: {
    fontSize: 20,
  },
});
