import { useRef, useCallback } from "react";

let hasWorkletsAvailable = false;
let createSynchronizable = () => { return { getBlocking: () => -1, setBlocking: (_: number) => {} }; };
try {
  const worklets = require('react-native-worklets');
  createSynchronizable = worklets.createSynchronizable;
  hasWorkletsAvailable = true;
} catch (e) {}

export function useSharableState(initialValue: number) {
  const stateRef = useRef(initialValue);
  const synchronizable = createSynchronizable();

  const set = useCallback((newValue: number) => {
    'worklet';
    if (hasWorkletsAvailable) {
      synchronizable.setBlocking(newValue);
    } else {
      stateRef.current = newValue;
    }
  }, []);

  const get = () => {
    'worklet';
    if (hasWorkletsAvailable) {
      return synchronizable.getBlocking();
    } else {
      return stateRef.current;
    }
  };

  return { get, set };
}