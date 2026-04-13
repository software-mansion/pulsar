let hapticsEnabled = true;
let soundEnabled = false;

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function setHapticsEnabled(state: boolean): void {
  hapticsEnabled = state;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(state: boolean): void {
  soundEnabled = state;
}
