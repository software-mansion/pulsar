import type { Pattern, PatternComposer } from './types';
import { vibrate } from './engine';
import { isHapticsEnabled, isSoundEnabled } from './state';
import { AudioEngine } from './audio-engine';

function patternToVibration(pattern: Pattern): number[] {
  const { discretePattern } = pattern;
  if (discretePattern.length === 0) return [];

  const sorted = [...discretePattern].sort((a, b) => a.time - b.time);
  const result: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const vibrateDuration = Math.max(10, Math.round(event.amplitude * 50));
    result.push(vibrateDuration);

    if (i < sorted.length - 1) {
      const pause = Math.max(1, sorted[i + 1].time - event.time - vibrateDuration);
      result.push(pause);
    }
  }

  return result;
}

export function createPatternComposer(): PatternComposer {
  let parsedPattern: Pattern | null = null;
  let audioReady = false;
  const audioEngine = new AudioEngine();

  return {
    parse(pattern: Pattern) {
      parsedPattern = pattern;
      audioReady = false;
      audioEngine.parsePattern(pattern)
        .then(() => { audioReady = true; })
        .catch(() => {});
    },

    play() {
      if (!parsedPattern) return;

      if (isHapticsEnabled()) {
        const vibrationPattern = patternToVibration(parsedPattern);
        if (vibrationPattern.length > 0) {
          vibrate(vibrationPattern);
        }
      }

      if (isSoundEnabled() && audioReady) {
        audioEngine.play().catch(() => {});
      }
    },

    stop() {
      audioEngine.stop();
    },

    isParsed() {
      return parsedPattern !== null;
    },
  };
}
