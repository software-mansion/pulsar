import { StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import OnboardingOverlay from './OnboardingOverlay';
import { useRealtimeComposer } from 'react-native-pulsar';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useComposedGesture } from '@/hooks/useComposedGesture';
import { useHapticsScreenActivity } from '@/hooks/useHapticsScreenActivity';
import { useOnboardingComposedGesture } from '@/hooks/useOnboardingComposedGesture';
import { usePatternRecorder } from '@/hooks/usePatternRecorder';
import { useImperativeHandle, forwardRef } from 'react';

const gridImage = require('@/assets/images/grid.svg');

export type GesturePlaygroundHandle = {
  startRecording: () => void;
  stopRecording: () => void;
  stopPlaying: () => void;
  playRecordedPattern: (durationMs: number) => void;
  getPatternAsJson: () => string | null;
};

type GesturePlaygroundProps = {
  onRecordingChange?: (isRecording: boolean) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onRecordedChange?: (isRecorded: boolean) => void;
};

const GesturePlayground = forwardRef<GesturePlaygroundHandle, GesturePlaygroundProps>(function GesturePlayground(
  { onRecordingChange, onPlayingChange, onRecordedChange },
  ref
) {
  const { onboardingState, setOnboardingState } = useOnboarding();
  const composer = useRealtimeComposer();
  useHapticsScreenActivity(composer);
  const containerSize = useSharedValue({ width: 0, height: 0 });
  const tapIndicatorPosition = useSharedValue({ x: -100, y: -100 });
  const panIndicatorPosition = useSharedValue({ x: -100, y: -100 });

  const {
    startRecording,
    stopRecording,
    stopPlaying,
    playRecordedPattern,
    recordEvent,
    getPatternAsJson,
  } = usePatternRecorder({ onRecordingChange, onPlayingChange, onRecordedChange });

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    stopPlaying,
    playRecordedPattern,
    getPatternAsJson,
  }));

  const tapIndicatorStyle = useAnimatedStyle(() => ({
    left: tapIndicatorPosition.value.x - 15,
    top: tapIndicatorPosition.value.y - 15,
  }));

  const panIndicatorStyle = useAnimatedStyle(() => ({
    left: panIndicatorPosition.value.x - 15,
    top: panIndicatorPosition.value.y - 15,
  }));

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    containerSize.value = { width, height };
  };

  const clampIndicatorPosition = (x: number, y: number) => {
    'worklet';
    if (x === -100 && y === -100) {
      return { x, y };
    }

    const clampedX = Math.max(15, Math.min(x, containerSize.value.width - 15));
    const clampedY = Math.max(15, Math.min(y, containerSize.value.height - 15));

    return { x: clampedX, y: clampedY };
  };

  const composedGesture = useComposedGesture(
    containerSize,
    composer,
    recordEvent,
    tapIndicatorPosition,
    panIndicatorPosition,
    clampIndicatorPosition
  );

  const updateOnboardingState = (newState: number) => {
    if (onboardingState >= newState) {
      return;
    }
    setOnboardingState(newState);
  };

  const onboardingComposedGesture = useOnboardingComposedGesture(
    updateOnboardingState,
    containerSize,
    composer,
    tapIndicatorPosition,
    panIndicatorPosition,
    clampIndicatorPosition
  );

  return (
    <OnboardingOverlay state={onboardingState}>
      <GestureDetector gesture={onboardingState === 3 ? composedGesture : onboardingComposedGesture}>
        <Animated.View  style={styles.gridContainer} onLayout={handleLayout}>
          <Animated.View style={[styles.tapIndicator, tapIndicatorStyle]} />
          <Animated.View style={[styles.panIndicator, panIndicatorStyle]} />
          <Image
            source={gridImage}
            style={styles.grid}
            contentFit="cover"
          />
        </Animated.View>
      </GestureDetector>
    </OnboardingOverlay>
  );
});

export default GesturePlayground;

const styles = StyleSheet.create({
  gridContainer: {
    marginVertical: 25,
  },
  grid: {
    width: '100%',
    height: '100%',
  },
  tapIndicator: {
    position: 'absolute',
    left: -100,
    top: -100,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6259',
    opacity: 0.8,
  },
  panIndicator: {
    position: 'absolute',
    left: -100,
    top: -100,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#001A72',
    opacity: 0.8,
  },
});
