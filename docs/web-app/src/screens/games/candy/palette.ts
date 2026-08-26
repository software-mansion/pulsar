/**
 * The six candies.
 *
 * Each one carries a shape as well as a colour: matching purely on hue is
 * unplayable for the ~8% of players with a colour-vision deficiency, and the
 * silhouette also makes a fast cascade readable at a glance.
 */

export type CandyShape = 'circle' | 'square' | 'diamond' | 'hex' | 'drop' | 'star';

export type Candy = {
  name: string;
  color: string;
  /** Lighter tone used for the inner highlight. */
  sheen: string;
  shape: CandyShape;
};

export const CANDIES: Candy[] = [
  { name: 'Cherry', color: '#FF5A5F', sheen: '#FFB2B4', shape: 'circle' },
  { name: 'Orange', color: '#FF9F45', sheen: '#FFD3A6', shape: 'square' },
  { name: 'Lemon', color: '#FFC93C', sheen: '#FFE9A8', shape: 'diamond' },
  { name: 'Lime', color: '#3DD68C', sheen: '#AFEFD0', shape: 'hex' },
  { name: 'Blueberry', color: '#38ACDD', sheen: '#B5E1F1', shape: 'drop' },
  { name: 'Grape', color: '#A06BE8', sheen: '#D8C2F5', shape: 'star' },
];

/** `#RRGGBB` to the 0..1 triple the particle backends want. */
export function toRgb01(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export const candyRgb: [number, number, number][] = CANDIES.map((candy) => toRgb01(candy.color));

/** Confetti and colour-bomb white, used when an effect has no single colour. */
export const NEUTRAL_RGB: [number, number, number] = [1, 0.95, 0.75];
