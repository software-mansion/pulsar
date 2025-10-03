import { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Presets } from 'react-native-pulsar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { runOnUI } from 'react-native-worklets';

export default function App() {
  const [counter, setCounter] = useState(0);

  return (
    <View style={styles.container}>
      {counter == 0 ? <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>⬇</Animated.Text>: null}
      {counter == 0 ? <Button title="Download" onPress={() => {
        Presets.Tap();
        setCounter(1);
        setTimeout(() => {
          setCounter(2);
          Presets.Fail();
        }, 1300);
      }} /> : null}
      {counter == 1 ? <Button title="Downloading..." disabled onPress={() => {}} /> : null}
      {counter == 2 ? <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>🔄</Animated.Text>: null}
      {counter == 2 ? <Button title="Download failed, try again" onPress={() => {
        setCounter(1);
        setTimeout(() => {
          setCounter(3);
          Presets.Success();
        }, 1000);
      }} /> : null}
      {counter == 3 ? <Animated.Text entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.text}>✅</Animated.Text>: null}
      {counter == 3 ? <Button title="Downloaded successfully" onPress={() => {
        setCounter(0);
      }} /> : null}
      <Button title="test" onPress={() => {
        runOnUI(() => {
          'worklet';
          Presets.System.ImpactHeavy();
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
