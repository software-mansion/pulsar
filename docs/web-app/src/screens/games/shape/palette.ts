/**
 * The six playing pieces.
 *
 * Each one carries a silhouette as well as a colour: matching purely on hue is
 * unplayable for the ~8% of players with a colour-vision deficiency, and the
 * outline also makes a fast cascade readable at a glance.
 */

export type SilhouetteKind = 'circle' | 'square' | 'diamond' | 'hex' | 'drop' | 'star';

export type Shape = {
  name: string;
  color: string;
  /** Lighter tone used for the inner highlight. */
  sheen: string;
  silhouette: SilhouetteKind;
};

export const SHAPES: Shape[] = [
  { name: 'Red', color: '#FF5A5F', sheen: '#FFB2B4', silhouette: 'circle' },
  { name: 'Amber', color: '#FF9F45', sheen: '#FFD3A6', silhouette: 'square' },
  { name: 'Yellow', color: '#FFC93C', sheen: '#FFE9A8', silhouette: 'diamond' },
  { name: 'Green', color: '#3DD68C', sheen: '#AFEFD0', silhouette: 'hex' },
  { name: 'Blue', color: '#38ACDD', sheen: '#B5E1F1', silhouette: 'drop' },
  { name: 'Violet', color: '#A06BE8', sheen: '#D8C2F5', silhouette: 'star' },
];

/** `#RRGGBB` to the 0..1 triple the particle backends want. */
export function toRgb01(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export const shapeRgb: [number, number, number][] = SHAPES.map((shape) => toRgb01(shape.color));

/** Confetti and colour-bomb white, used when an effect has no single colour. */
export const NEUTRAL_RGB: [number, number, number] = [1, 0.95, 0.75];
