import { useCallback } from "react";
import { createSynchronizable } from "react-native-worklets";

export function useSharableState(initialValue: number) {
  const synchronizable = createSynchronizable(initialValue);

  const set = useCallback((newValue: number) => {
    'worklet';
    synchronizable.setBlocking(newValue);
  }, []);

  const get = useCallback(() => {
    'worklet';
    return synchronizable.getBlocking();
  }, []);

  return { get, set };
}