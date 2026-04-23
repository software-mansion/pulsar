import { StyleSheet, View, Share, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import Button from '@/components/Button';
import { Link } from 'expo-router';
import GesturePlayground, { type GesturePlaygroundHandle } from '../../components/GesturePlayground';
import { useRef, useState, useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MAX_RECORDING_DURATION_MS } from '@/hooks/usePatternRecorder';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const infoIcon = require('@/assets/images/info.svg');
const slidersIcon = require('@/assets/images/sliders.svg');

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function PlaygroundScreen() {
  const posthog = usePostHog();
  const playgroundRef = useRef<GesturePlaygroundHandle | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const timerText = useSharedValue('');
  const recordingStartRef = useRef<number>(0);
  const recordingDurationRef = useRef<number>(0);

  useEffect(() => {
    if (!isRecording) {
      if (recordingStartRef.current > 0) {
        const duration = Math.min(Date.now() - recordingStartRef.current, MAX_RECORDING_DURATION_MS);
        recordingDurationRef.current = duration;
        timerText.value = `${(duration / 1000).toFixed(1)}s`;
        setIsRecorded(true);
      }
      return;
    }
    setIsRecorded(false);
    recordingStartRef.current = Date.now();
    timerText.value = '0.0s';
    const interval = setInterval(() => {
      const elapsed = (Date.now() - recordingStartRef.current) / 1000;
      timerText.value = `${elapsed.toFixed(1)}s`;
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isPlaying) {
      if (recordingDurationRef.current > 0) {
        timerText.value = `${(recordingDurationRef.current / 1000).toFixed(1)}s`;
      }
      return;
    }
    const playStart = Date.now();
    const totalSec = recordingDurationRef.current / 1000;
    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - playStart) / 1000;
      timerText.value = `${elapsedSec.toFixed(1)}s / ${totalSec.toFixed(1)}s`;
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const animatedTimerProps = useAnimatedProps(() => ({
    text: timerText.value,
    defaultValue: timerText.value,
  } as any));

  const handleShare = async () => {
    try {
      const patternJson = playgroundRef.current?.getPatternAsJson();
      if (!patternJson) {
        console.log('No recorded pattern to share');
        return;
      }
      await Share.share({
        message: patternJson,
      });
      posthog.capture('playground_pattern_shared');
    } catch (error) {
      console.error('Error sharing:', error);
      const err = error as Error;
      posthog.capture('$exception', {
        $exception_list: [
          {
            type: err.name ?? 'ShareError',
            value: err.message ?? 'Failed to share pattern',
            stacktrace: {
              type: 'raw',
              frames: err.stack ?? '',
            },
          },
        ],
        $exception_source: 'playground_share',
      });
    }
  };

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Playground</ThemedText>
          <Link href="/playgroundModal" style={styles.playgroundLink}>
            <Link.Trigger>
              <View style={styles.howItWorksButton}>
                <ThemedText>How does it work?</ThemedText>
                <Image source={infoIcon} style={styles.infoIcon} />
              </View>
            </Link.Trigger>
          </Link>
        </View>

        {Platform.OS === 'android' && (
          <Link href="/playgroundSettingsModal">
            <Link.Trigger>
              <View style={styles.settingsRow}>
                <ThemedText style={[styles.settingsLabel, { color: textColor }]}>
                  Realtime composer settings
                </ThemedText>
                <Image source={slidersIcon} style={styles.settingsIcon} />
              </View>
            </Link.Trigger>
          </Link>
        )}

        <View style={styles.playgroundWrapper}>
          <GesturePlayground
            ref={playgroundRef}
            onRecordingChange={setIsRecording}
            onPlayingChange={setIsPlaying}
          />
          {(isRecording || isRecorded) && (
            <View style={styles.timerRow}>
              <ThemedText style={styles.timerLabel}>
                {isPlaying ? 'Playing' : isRecording ? 'Recording' : 'Duration'}
              </ThemedText>
              <AnimatedTextInput
                style={[styles.timerValue, { color: textColor }]}
                animatedProps={animatedTimerProps}
                editable={false}
              />
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <Button
            enabled={isRecorded}
            onClick={() => {
              if (isPlaying) {
                playgroundRef.current?.stopPlaying();
              } else {
                playgroundRef.current?.playRecordedPattern(recordingDurationRef.current);
                posthog.capture('playground_pattern_played');
              }
            }}
            showIcon={isPlaying ? 'stop' : 'play'}
            largeIcon={true}
          />
          <Button
            label={isRecording ? 'Stop' : 'Record'}
            onClick={() => {
              if (isRecording) {
                playgroundRef.current?.stopRecording();
                posthog.capture('playground_recording_stopped');
              } else {
                playgroundRef.current?.startRecording();
                posthog.capture('playground_recording_started');
              }
            }}
            showIcon={isRecording ? 'square' : 'record'}
            fullWidth={true}
          />
          <Button enabled={isRecorded} onClick={handleShare} showIcon="download" largeIcon={true} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  playgroundLink: {
    marginBottom: -5,
  },
  howItWorksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 18,
    height: 18,
  },
  settingsRow: {
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  settingsIcon: {
    width: 20,
    height: 20,
  },
  settingsLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  handPointer: {
    width: 80,
    height: 80,
    position: 'absolute',
  },
  playgroundWrapper: {
    flex: 1,
  },
  timerRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
    padding: 0,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    gap: 12,
  },
  controlButton: {
    borderWidth: 2,
    borderRadius: 8,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
  },
  downloadIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  recordButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#E74C3C',
    borderRadius: 8,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  recordDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E74C3C',
  },
  recordText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
