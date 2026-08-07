import { useCallback, useEffect } from 'react';
import { Image } from 'react-native';
import Pulsar from './NativeRNPulsar';
import type { Pattern, PatternComposer, Sound } from './types';
import { useSharableState } from './useSharableState';

// workaround for RN prototype caching issue
Pulsar.PatternComposer_play;

function resolveSoundUri(uri: Sound['uri']): string | undefined {
  if (typeof uri === 'number') {
    return Image.resolveAssetSource(uri)?.uri;
  }
  return uri;
}

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
    const resolvedUri = pattern.sound ? resolveSoundUri(pattern.sound.uri) : undefined;
    let newPatternId: number;
    if (pattern.sound && resolvedUri) {
      const { volume = 1, offset = 0 } = pattern.sound;
      newPatternId = Pulsar.PatternComposer_parsePatternWithSound(pattern, resolvedUri, volume, offset);
    } else {
      newPatternId = Pulsar.PatternComposer_parsePattern(pattern);
    }
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

