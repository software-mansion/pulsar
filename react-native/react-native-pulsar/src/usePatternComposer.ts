import { useCallback, useEffect, useRef } from 'react';
import Pulsar from './NativeRNPulsar';

type Pattern = {
  discretePattern: { time: number, amplitude: number, frequency: number }[],
  continuesPattern: {
    amplitude: { time: number, value: number }[],
    frequency: { time: number, value: number }[],
  }
}

export type PatternComposer = {
  play: () => void;
  parse: (pattern: Pattern) => void;
};

export default function usePatternComposer(pattern: Pattern): PatternComposer {
  const patternIdRef = useRef<number>(-1);

  const play = useCallback(() => {
    'worklet';
    if (patternIdRef.current !== -1) {
      Pulsar.PatternComposer_play(patternIdRef.current);
    }
  }, []);

  const parse = useCallback((pattern: Pattern) => {
    'worklet';
    const patternId = Pulsar.PatternComposer_parsePattern(pattern);
    patternIdRef.current = patternId;
  }, []);

  useEffect(() => {
    parse(pattern);
    return () => {
      Pulsar.PatternComposer_release(patternIdRef.current);
    };
  }, [pattern]);

  return { play, parse };
}
