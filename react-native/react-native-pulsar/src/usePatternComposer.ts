import { useCallback, useEffect, useRef } from 'react';
import Pulsar from './NativeRNPulsar';
import type { Pattern, PatternComposer } from './types';
import { useSharableState } from './useSharableState';

// workaround for RN prototype caching issue 
Pulsar.PatternComposer_play;

export default function usePatternComposer(pattern?: Pattern): PatternComposer {
  const patternId = useSharableState(-1);

  const play = useCallback(() => {
    'worklet';
    const id = patternId.get();
    if (id !== -1) {
      Pulsar.PatternComposer_play(id);
    }
  }, []);

  const stop = useCallback(() => {
    'worklet';
    const id = patternId.get();
    if (id !== -1) {
      Pulsar.PatternComposer_stop(id);
    }
  }, []);

  const parse = useCallback((pattern: Pattern) => {
    const newPatternId = Pulsar.PatternComposer_parsePattern(pattern);
    patternId.set(newPatternId);
  }, [pattern]);

  const isParsed = () => {
    return patternId.get() !== -1;
  }

  useEffect(() => {
    if (pattern) {
      parse(pattern);
    }

    return () => {
      const id = patternId.get();
      if (id !== -1) {
        Pulsar.PatternComposer_release(id);
      }
    };
  }, [pattern]);

  return { play, stop, parse, isParsed };
}

