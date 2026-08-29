import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HapticLottieView, type HapticLottieRef } from 'react-native-pulsar-lottie';
import type { Pattern } from 'react-native-pulsar';

import BasicLayout from '@/components/BasicLayout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formatMs } from '@/components/media/MediaProgress';
import MediaScrubber from '@/components/media/MediaScrubber';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import { usePlaybackClock } from '@/src/haptics/usePlaybackClock';

const verifiedAnimation = require('@/assets/animations/verified.json');
const durationMs = ((verifiedAnimation.op - verifiedAnimation.ip) / verifiedAnimation.fr) * 1000;

const verifiedPattern: Pattern = {
  discretePattern: [
    { time: 100, amplitude: 0.35, frequency: 0.55 },
    { time: 1500, amplitude: 0.6, frequency: 0.7 },
    { time: 1850, amplitude: 1, frequency: 0.9 },
    { time: 2050, amplitude: 0.45, frequency: 0.6 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0 },
      { time: 300, value: 0.25 },
      { time: 900, value: 0.45 },
      { time: 1500, value: 0.65 },
      { time: 1850, value: 0.9 },
      { time: 2000, value: 0.15 },
      { time: 2436, value: 0 },
    ],
    frequency: [
      { time: 0, value: 0.35 },
      { time: 900, value: 0.5 },
      { time: 1850, value: 0.9 },
      { time: 2436, value: 0.55 },
    ],
  },
};

export default function LottieDemo() {
  const animation = useRef<HapticLottieRef>(null);
  const clock = usePlaybackClock(durationMs);
  const [draggedToMs, setDraggedToMs] = useState<number | null>(null);

  const playFrom = (fromMs: number) => {
    animation.current?.setTimestamp(fromMs);
    animation.current?.resume();
    clock.start(fromMs);
  };

  const stop = () => {
    animation.current?.pause();
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
    animation.current?.setTimestamp(toMs);
    clock.jumpTo(toMs);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <BasicLayout>
        <ThemedText type="title" style={Margins.marginTop4X}>
          Lottie + haptics
        </ThemedText>
        <ThemedText style={Margins.marginTop2X}>
          A drop-in replacement for LottieView that plays a haptic pattern in lockstep with the
          animation timeline. Drag the progress bar to move both together. Best felt on a real
          device.
        </ThemedText>

        <Card style={Margins.marginTop4X}>
          <View style={styles.canvas}>
            <HapticLottieView
              ref={animation}
              source={verifiedAnimation}
              haptics={verifiedPattern}
              hapticMode="realtime"
              autoPlay={false}
              loop={false}
              style={styles.lottie}
            />
          </View>

          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            Verified
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
  canvas: {
    height: 200,
    borderRadius: 4,
    backgroundColor: '#E1F3FA',
    borderWidth: 2,
    borderColor: '#B5E1F1',
    overflow: 'hidden',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 180,
    height: 180,
  },
  meta: {
    fontSize: 14,
    color: '#496695',
  },
});
