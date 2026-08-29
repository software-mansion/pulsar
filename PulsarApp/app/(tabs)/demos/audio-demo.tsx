import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { usePatternComposer, type Pattern } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formatMs } from '@/components/media/MediaProgress';
import MediaScrubber from '@/components/media/MediaScrubber';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { patternDurationMs, patternStartingAt } from '@/src/haptics/patternSeek';
import { usePlaybackClock } from '@/src/haptics/usePlaybackClock';

const hapticTrack = require('@/assets/audio/sample-3s.haptics.json') as Pattern;

const audioPattern: Pattern = {
  ...hapticTrack,
  sound: {
    uri: require('@/assets/audio/sample-3s.mp3'),
    volume: 1.0,
  },
};

const durationMs = patternDurationMs(audioPattern);

export default function AudioDemo() {
  const composer = usePatternComposer();
  const clock = usePlaybackClock(durationMs);
  const [draggedToMs, setDraggedToMs] = useState<number | null>(null);

  const playFrom = (fromMs: number) => {
    composer.stop();
    composer.parse(patternStartingAt(audioPattern, fromMs));
    composer.play();
    clock.start(fromMs);
  };

  const stop = () => {
    composer.stop();
    clock.stop();
  };

  const togglePlay = () => {
    if (clock.isRunning) {
      stop();
      return;
    }
    const hasRunToTheEnd = clock.positionMs >= durationMs;
    playFrom(hasRunToTheEnd ? 0 : clock.positionMs);
  };

  const seek = (toMs: number) => {
    if (clock.isRunning) {
      playFrom(toMs);
      return;
    }
    composer.stop();
    clock.jumpTo(toMs);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Audio-synced haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          A short music clip attached to the pattern&apos;s{' '}
          <ThemedText type="defaultSemiBold">sound</ThemedText> field, so audio and haptics share
          one clock. Drag the progress bar to play from anywhere. Best felt on a real device.
        </ThemedText>

        <Card style={Margins.marginTop4X}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            sample-3s.mp3
          </ThemedText>
          <View style={Margins.marginTop1X}>
            <MediaScrubber
              positionMs={clock.positionMs}
              durationMs={durationMs}
              onScrub={setDraggedToMs}
              onSeek={seek}
            />
          </View>
          <ThemedText style={styles.meta}>
            {formatMs(draggedToMs ?? clock.positionMs)} / {formatMs(durationMs)}
          </ThemedText>

          <Button
            label={clock.isRunning ? 'Stop' : 'Play'}
            showIcon={clock.isRunning ? 'stop' : 'play'}
            style={Margins.marginTop3X}
            disableHaptics
            onClick={togglePlay}
          />
        </Card>
      </BasicLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  meta: {
    fontSize: 14,
    color: '#496695',
  },
});
