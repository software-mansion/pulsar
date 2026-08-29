import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const TRACK_HEIGHT = 6;
const THUMB_SIZE = 18;
// The track is 6px tall — far too thin to grab. The gesture area is padded out to a
// comfortable target while the bar itself stays slim.
const TOUCH_HEIGHT = 32;

/**
 * The playback bar for a media-backed haptic, draggable to seek.
 *
 * Reports the scrub position continuously through `onScrub` (so the caller's timestamp
 * follows the finger) and commits once on release through `onSeek` — the seek itself
 * re-parses and replays the pattern, which is far too expensive to do per frame.
 */
export default function MediaScrubber({
  positionMs,
  durationMs,
  color = SKY,
  disabled = false,
  onSeek,
  onScrub,
}: {
  positionMs: number;
  durationMs: number;
  color?: string;
  disabled?: boolean;
  onSeek: (ms: number) => void;
  onScrub?: (ms: number | null) => void;
}) {
  const [width, setWidth] = useState(0);
  // Non-null only while a finger is down; it overrides the clock so the thumb tracks the
  // drag instead of being yanked back by the next frame of playback.
  const [scrubMs, setScrubMs] = useState<number | null>(null);

  const seekable = !disabled && durationMs > 0 && width > 0;
  const displayMs = scrubMs ?? positionMs;
  const fraction = durationMs > 0 ? Math.max(0, Math.min(1, displayMs / durationMs)) : 0;

  const msAt = (x: number) => Math.max(0, Math.min(1, x / width)) * durationMs;

  const scrub = (x: number) => {
    const ms = msAt(x);
    setScrubMs(ms);
    onScrub?.(ms);
  };

  const commit = (x: number) => {
    const ms = msAt(x);
    setScrubMs(null);
    onScrub?.(null);
    onSeek(ms);
  };

  // runOnJS: these handlers drive React state and the seek, matching how Button drives its
  // press. `event.x` is relative to this view, so the maths holds wherever it is laid out.
  const pan = Gesture.Pan()
    .enabled(seekable)
    .minDistance(0)
    .onBegin((event) => scrub(event.x))
    .onUpdate((event) => scrub(event.x))
    .onEnd((event) => commit(event.x))
    // A cancelled gesture must not leave the thumb stranded away from the real playhead.
    .onFinalize(() => {
      setScrubMs(null);
      onScrub?.(null);
    })
    .runOnJS(true);

  const tap = Gesture.Tap()
    .enabled(seekable)
    .onEnd((event) => commit(event.x))
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={styles.touchArea} onLayout={onLayout}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: color }]} />
        </View>
        {seekable && (
          <View
            style={[
              styles.thumb,
              // Inset by half the thumb at each end so it stays inside the track's bounds.
              { left: fraction * (width - THUMB_SIZE), borderColor: color },
            ]}
          />
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    height: TOUCH_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#D5E6F2',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: TRACK_HEIGHT / 2 },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: NAVY,
  },
});
