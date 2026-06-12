import { Gesture, type SimultaneousGesture } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Position, Composer, PositionTransform, UpdateStateCallback } from './gestureTypes';

export const useOnboardingComposedGesture = (
  updateOnboardingState: UpdateStateCallback,
  containerSize: SharedValue<{ width: number; height: number }>,
  composer: Composer,
  tapIndicatorPosition: SharedValue<Position>,
  panIndicatorPosition: SharedValue<Position>,
  clampIndicatorPosition: PositionTransform
): SimultaneousGesture => {
  const normalizePosition = (x: number, y: number) => {
    'worklet';
    return {
      x: (containerSize.value.width > 0 ? x / containerSize.value.width : 0),
      y: 1 - (containerSize.value.height > 0 ? y / containerSize.value.height : 0),
    };
  };
  const onboardingTapGesture = Gesture.Tap()
    .onStart((e) => {
      scheduleOnRN(updateOnboardingState, 2);
      const normalized = normalizePosition(e.x, e.y);
      composer.playDiscrete(normalized.y, normalized.x);
      tapIndicatorPosition.value = clampIndicatorPosition(e.x, e.y);
      global.tapTimer = setTimeout(() => {
        tapIndicatorPosition.value = { x: -100, y: -100 };
      }, 100);
    });

  const onboardingPanGesture = Gesture.Pan()
    .onUpdate((e) => {
      const normalized = normalizePosition(e.x, e.y);
      composer.set(normalized.y, normalized.x);
      panIndicatorPosition.value = clampIndicatorPosition(e.x, e.y);
    })
    .onEnd(() => {
      scheduleOnRN(updateOnboardingState, 3);
      composer.stop();
      panIndicatorPosition.value = { x: -100, y: -100 };
    });

  return Gesture.Simultaneous(onboardingTapGesture, onboardingPanGesture);
};
