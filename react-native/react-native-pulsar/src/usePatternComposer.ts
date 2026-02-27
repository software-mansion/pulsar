import { useCallback, useEffect, useRef } from 'react';
import Pulsar from './NativeRNPulsar';
import type { Pattern, PatternComposer } from './types';

// workaround for RN prototype caching issue 
Pulsar.PatternComposer_play;

export default function usePatternComposer(pattern?: Pattern): PatternComposer {
  const patternIdRef = useRef<number>(-1);

  const play = useCallback(() => {
    'worklet';
    if (patternIdRef.current !== -1) {
      Pulsar.PatternComposer_play(patternIdRef.current);
    }
  }, []);

  const parse = useCallback((pattern: Pattern) => {
    const patternId = Pulsar.PatternComposer_parsePattern(pattern);
    patternIdRef.current = patternId;
  }, [pattern]);

  const isParsed = () => {
    return patternIdRef.current !== -1;
  }

  useEffect(() => {
    if (pattern) {
      parse(pattern);
    }
    return () => {
      if  (patternIdRef.current !== -1) {
        Pulsar.PatternComposer_release(patternIdRef.current);
      }
    };
  }, [pattern]);

  return { play, parse, isParsed };
}

