import { useRef, useCallback } from "react";

let useSavedValue = (_: number) => { return { value: -1 }; };
let isReanimatedAvailable = false;
try {
  const reanimated = require('react-native-reanimated');
  useSavedValue = reanimated.useSharedValue;
  isReanimatedAvailable = true;
} catch (e) {}

export function useSharableState(initialValue: number) {
  const stateRef = useRef(initialValue);
  const sharedValue = useSavedValue(initialValue);

  const set = useCallback((newValue: number) => {
    'worklet';
    if (isReanimatedAvailable) {
      sharedValue.value = newValue;
    } else {
      stateRef.current = newValue;
    }
  }, []);

  const get = useCallback(() => {
    'worklet';
    if (isReanimatedAvailable) {
      return sharedValue.value;
    } else {
      return stateRef.current;
    }
  }, []);

  return { get, set };
}