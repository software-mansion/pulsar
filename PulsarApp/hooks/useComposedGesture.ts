import { Gesture, type SimultaneousGesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { Position, Composer, PositionTransform, RecordEventFn } from './gestureTypes';

export const useComposedGesture = (
  containerSize: SharedValue<{ width: number; height: number }>,
  composer: Composer,
  recordEvent: RecordEventFn,
  tapIndicatorPosition: SharedValue<Position>,
  panIndicatorPosition: SharedValue<Position>,
  clampIndicatorPosition: PositionTransform
): SimultaneousGesture => {
  const normalizePosition = (x: number, y: number) => {
    'worklet';
    return {
      x: (containerSize.value.width > 0 ? x / containerSize.value.width : 0),
      y: 0.2 + 0.8 * (1 - (containerSize.value.height > 0 ? y / containerSize.value.height : 0)),
    };
  };
  const tapGesture = Gesture.Tap()
    .onStart((e) => {
      const normalized = normalizePosition(e.x, e.y);
      composer.playDiscrete(normalized.y, normalized.x);
      recordEvent('tap', normalized.x, normalized.y);

      const clamped = clampIndicatorPosition(e.x, e.y);
      tapIndicatorPosition.value = clamped;
      global.tapTimer = setTimeout(() => {
        tapIndicatorPosition.value = { x: -100, y: -100 };
      }, 100);
    })
    // .onEnd(() => {});

  const panGesture = Gesture.Pan()
    // .onBegin((e) => {})
    .onUpdate((e) => {
      const normalized = normalizePosition(e.x, e.y);
      composer.set(normalized.y, normalized.x);
      recordEvent('pan', normalized.x, normalized.y);
      const clamped = clampIndicatorPosition(e.x, e.y);
      panIndicatorPosition.value = clamped;
    })
    .onEnd((e) => {
      composer.stop();
      panIndicatorPosition.value = { x: -100, y: -100 };
      recordEvent('pan', 0, 0);
    });

  return Gesture.Simultaneous(tapGesture, panGesture);
};
