export interface Position {
  x: number;
  y: number;
}

export interface Composer {
  playDiscrete(amplitude: number, frequency: number): void;
  set(amplitude: number, frequency: number): void;
  stop(): void;
  reset(): void;
}

export type PositionTransform = (x: number, y: number) => Position;

export type EventType = 'tap' | 'pan';

export type RecordEventFn = (type: EventType, x: number, y: number) => void;

export type UpdateStateCallback = (newState: number) => void;
