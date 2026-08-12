import { ScrollView, StyleSheet, View } from 'react-native';
import { Pattern, usePatternComposer } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import HapticDemoButton from '@/components/demo/HapticDemoButton';

// The haptic track was generated from `sample-3s.mp3` by onset/energy analysis,
// so its discrete beats land on the music and its continuous envelope follows
// the track's loudness. The JSON is already a `Pattern`; attaching the clip via
// the `sound` field plays audio and haptics on one shared clock.
//
// Note: `require()` resolves a bundled asset to a remote Metro URL in dev but a
// local file in release. iOS synced playback needs a local file, so verify the
// sync on a release build / real device.
const hapticTrack = require('@/assets/audio/sample-3s.haptics.json') as Pattern;

const audioPattern: Pattern = {
  ...hapticTrack,
  sound: {
    uri: require('@/assets/audio/sample-3s.mp3'),
    volume: 1.0,
  },
};

export default function AudioDemo() {
  const composer = usePatternComposer(audioPattern);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Audio-synced haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          A short music clip played through the pattern composer, with haptics
          that fall on the beat. Best felt on a real device.
        </ThemedText>

        <View style={styles.controls}>
          <HapticDemoButton
            label="▶ Play"
            onPress={() => composer.play()}
            style={styles.button}
          />
          <HapticDemoButton
            label="■ Stop"
            onPress={() => composer.stop()}
            style={styles.button}
          />
        </View>

        <ThemedText style={Margins.marginTop4X}>
          The clip is attached through the pattern&apos;s{' '}
          <ThemedText type="defaultSemiBold">sound</ThemedText> field, so audio
          and haptics share one clock — no manual scheduling.
        </ThemedText>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  controls: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 16,
  },
  button: {
    flex: 1,
  },
});
