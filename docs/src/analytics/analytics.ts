import type { EventName } from './events';

export type EventProps = Record<string, string | number | boolean | null | undefined>;

export function track(event: EventName, props: EventProps = {}): void {
  window.posthog?.capture(event, props);
}

export function trackError(error: unknown): void {
  if (error instanceof Error) window.posthog?.captureException?.(error);
}

const alreadyTracked = new Set<string>();

export function trackFirstTimeOnly(event: EventName, props: EventProps = {}): void {
  const key = `${event}:${JSON.stringify(props)}`;
  if (alreadyTracked.has(key)) return;
  alreadyTracked.add(key);
  track(event, props);
}

/** For sections Astro renders without hydration, where an onClick would be dropped. */
export function trackingAttributes(
  event: EventName,
  props: Record<string, string | number> = {},
): Record<string, string> {
  const attributes: Record<string, string> = { 'data-ph-event': event };
  for (const [key, value] of Object.entries(props)) attributes[`data-ph-${key}`] = String(value);
  return attributes;
}

export type { EventName };
