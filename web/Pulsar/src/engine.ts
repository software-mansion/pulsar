import { isHapticsEnabled } from './state';

export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

// Safari haptics trick: toggling a hidden switch-style checkbox triggers
// haptic feedback on iOS Safari, which does not support navigator.vibrate.
let safariCheckbox: HTMLInputElement | null = null;
let safariCheckboxState = false;
let safariHapticTimeouts: ReturnType<typeof setTimeout>[] = [];

function getSafariCheckbox(): HTMLInputElement | null {
  if (typeof document === 'undefined') return null;
  if (!safariCheckbox) {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.style.position = 'fixed';
    el.style.top = '-9999px';
    el.style.left = '-9999px';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    (el.style as any).webkitAppearance = 'switch';
    document.body.appendChild(el);
    safariCheckbox = el;
  }
  return safariCheckbox;
}

function triggerSafariHaptic(): void {
  const el = getSafariCheckbox();
  if (!el) return;
  safariCheckboxState = !safariCheckboxState;
  el.checked = safariCheckboxState;
}

export function vibrate(pattern: number | number[]): void {
  if (!isHapticsEnabled()) return;

  if (isVibrationSupported()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently fail — vibration not supported or denied
    }
    return;
  }

  // Fallback for Safari: use the hidden switch checkbox trick
  if (typeof document === 'undefined') return;

  safariHapticTimeouts.forEach(clearTimeout);
  safariHapticTimeouts = [];

  if (typeof pattern === 'number') {
    triggerSafariHaptic();
    return;
  }

  // pattern[] alternates: vibrate, pause, vibrate, pause, ...
  // Schedule one haptic toggle per vibrate segment.
  let elapsed = 0;
  for (let i = 0; i < pattern.length; i += 2) {
    const delay = elapsed;
    const id = setTimeout(triggerSafariHaptic, delay);
    safariHapticTimeouts.push(id);
    elapsed += pattern[i] ?? 0;
    if (i + 1 < pattern.length) {
      elapsed += pattern[i + 1] ?? 0;
    }
  }
}

export function stopVibration(): void {
  safariHapticTimeouts.forEach(clearTimeout);
  safariHapticTimeouts = [];

  if (!isVibrationSupported()) return;
  try {
    navigator.vibrate(0);
  } catch {
    // Silently fail
  }
}
