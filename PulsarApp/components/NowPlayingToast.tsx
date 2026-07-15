import { StyleSheet, View } from 'react-native';

import PatternIsPlaying from '@/components/home/PatternIsPlaying';
import { useConnections } from '@/contexts/ConnectionsContext';

// Floating "preset received" banner - pinned near the bottom so it stays visible
// on any screen while a producer (e.g. the Figma plugin) plays presets on the
// phone. Reads the shared `lastReceived` state, so it works regardless of which
// tab is showing. Non-interactive (pointerEvents="none") so it never eats taps.
export default function NowPlayingToast() {
  const { lastReceived } = useConnections();
  if (!lastReceived) return null;
  return (
    <View style={styles.toast} pointerEvents="none">
      <PatternIsPlaying found={lastReceived.found} name={lastReceived.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 20,
  },
});
