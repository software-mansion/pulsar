import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const TRACK_HEIGHT = 6;
const THUMB_SIZE = 18;
const TOUCH_TARGET_HEIGHT = 32;

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
  const [draggedToMs, setDraggedToMs] = useState<number | null>(null);

  const seekable = !disabled && durationMs > 0 && width > 0;
  const shownMs = draggedToMs ?? positionMs;
  const fraction = durationMs > 0 ? Math.max(0, Math.min(1, shownMs / durationMs)) : 0;

  const msAtTouch = (x: number) => Math.max(0, Math.min(1, x / width)) * durationMs;

  const dragTo = (x: number) => {
    const ms = msAtTouch(x);
    setDraggedToMs(ms);
    onScrub?.(ms);
  };

  const releaseDrag = () => {
    setDraggedToMs(null);
    onScrub?.(null);
  };

  const seekTo = (x: number) => {
    const ms = msAtTouch(x);
    releaseDrag();
    onSeek(ms);
  };

  const pan = Gesture.Pan()
    .enabled(seekable)
    .minDistance(0)
    .onBegin((event) => dragTo(event.x))
    .onUpdate((event) => dragTo(event.x))
    .onEnd((event) => seekTo(event.x))
    .onFinalize(releaseDrag)
    .runOnJS(true);

  const tap = Gesture.Tap()
    .enabled(seekable)
    .onEnd((event) => seekTo(event.x))
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const thumbLeft = fraction * (width - THUMB_SIZE);

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={styles.touchArea} onLayout={onLayout}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: color }]} />
        </View>
        {seekable && <View style={[styles.thumb, { left: thumbLeft, borderColor: color }]} />}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    height: TOUCH_TARGET_HEIGHT,
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
