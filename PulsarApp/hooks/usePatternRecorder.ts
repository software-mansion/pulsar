import { useState, useRef, useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Pattern, usePatternComposer } from 'react-native-pulsar';
import { runOnUISync, scheduleOnUI } from 'react-native-worklets';

declare global {
  var tapTimer: any;
  var PatternRecorder: any[];
  var PatternRecorderStartTime: number;
}

export type RecordedEvent = {
  type: 'tap' | 'pan';
  time: number;
  x: number;
  y: number;
  amplitude?: number;
  frequency?: number;
};

function convertToPattern(events: RecordedEvent[]): Pattern {
  const discretePattern: { time: number, amplitude: number, frequency: number }[] = [];
  const continuousAmplitude: { time: number, value: number }[] = [];
  const continuousFrequency: { time: number, value: number }[] = [];

  let lastPanTime = 0;
  const panGroups: RecordedEvent[][] = [];
  let currentPanGroup: RecordedEvent[] = [];

  events.forEach((event) => {
    if (event.type === 'tap') {
      discretePattern.push({
        time: event.time,
        amplitude: event.y,
        frequency: event.x,
      });
    } else if (event.type === 'pan') {
      if (currentPanGroup.length === 0 || event.time - lastPanTime < 100) {
        currentPanGroup.push(event);
      } else {
        if (currentPanGroup.length > 0) {
          panGroups.push([...currentPanGroup]);
        }
        currentPanGroup = [event];
      }
      lastPanTime = event.time;
    }
  });

  if (currentPanGroup.length > 0) {
    panGroups.push(currentPanGroup);
  }

  // Convert pan groups to continuous pattern
  panGroups.forEach((group) => {
    group.forEach((event) => {
      continuousAmplitude.push({
        time: event.time,
        value: event.y,
      });
      continuousFrequency.push({
        time: event.time,
        value: event.x,
      });
    });

    // Add end point
    const lastEvent = group[group.length - 1];
    continuousAmplitude.push({
      time: lastEvent.time,
      value: 0,
    });
    continuousFrequency.push({
      time: lastEvent.time,
      value: 0,
    });
  });

  return {
    discretePattern,
    continuousPattern: {
      amplitude: continuousAmplitude,
      frequency: continuousFrequency,
    },
  };
}

type UsePatternRecorderProps = {
  onRecordingChange?: (isRecording: boolean) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onRecordedChange?: (isRecorded: boolean) => void;
};

type UsePatternRecorderReturn = {
  startRecording: () => void;
  stopRecording: () => void;
  playRecordedPattern: () => void;
  recordEvent: (type: 'tap' | 'pan', x: number, y: number) => void;
  getPatternAsJson: () => string | null;
};

export function usePatternRecorder({ onRecordingChange, onPlayingChange, onRecordedChange }: UsePatternRecorderProps): UsePatternRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordedPattern = useSharedValue<any[]>([]);
  const patternComposer = usePatternComposer();
  const isNewRecording = useRef(false);

  useEffect(() => {
    onRecordingChange?.(isRecording);
  }, [isRecording, onRecordingChange]);
  
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const startRecording = () => {
    isNewRecording.current = true;
    setIsRecording(true);
    recordedPattern.value = [];
    scheduleOnUI(() => {
      global.PatternRecorderStartTime = Date.now();
      global.PatternRecorder = [];
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    runOnUISync(() => {
      recordedPattern.value = global.PatternRecorder;
    });
    onRecordedChange?.(recordedPattern.value.length > 0);
  };

  const playRecordedPattern = () => {
    if (recordedPattern.value.length === 0) {
      console.log('No recorded events to play');
      return;
    }

    setIsPlaying(true);
    const recordedEvents = recordedPattern.value as RecordedEvent[];
    if (isNewRecording.current) {
      const pattern = convertToPattern(recordedPattern.value);
      patternComposer.parse(pattern);
      isNewRecording.current = false;
    }
    patternComposer.play();

    // Estimate duration and reset playing state
    const lastEvent = recordedEvents[recordedEvents.length - 1];
    const duration = lastEvent?.time * 1000;
    setTimeout(() => {
      setIsPlaying(false);
    }, duration + 100);
  };

  const recordEvent = (type: 'tap' | 'pan', x: number, y: number) => {
    'worklet';
    const time = (Date.now() - global.PatternRecorderStartTime) / 1000;
    const event: RecordedEvent = { type, time, x, y };
    if (!global.PatternRecorder) {
      global.PatternRecorder = [];
    }
    global.PatternRecorder.push(event);
  };

  const getPatternAsJson = () => {
    if (recordedPattern.value.length === 0) {
      return null;
    }
    const pattern = convertToPattern(recordedPattern.value);
    return "Pulsar custom preset\n\n" + JSON.stringify(pattern, null, 2);
  };

  return {
    startRecording,
    stopRecording,
    playRecordedPattern,
    recordEvent,
    getPatternAsJson,
  };
}
