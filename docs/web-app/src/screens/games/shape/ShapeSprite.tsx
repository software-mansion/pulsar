import { SHAPES, type SilhouetteKind } from './palette';
import type { SpecialKind } from './engine';

/**
 * One shape, drawn as SVG.
 *
 * Shape carries the same information as colour so the board stays playable
 * without colour vision, and specials are drawn as overlays on top of the base
 * silhouette — a striped lemon is still recognisably a lemon.
 */

const SILHOUETTES: Record<SilhouetteKind, string> = {
  circle: 'M50 10a40 40 0 1 0 0 80a40 40 0 1 0 0-80Z',
  square:
    'M30 12h40a18 18 0 0 1 18 18v40a18 18 0 0 1-18 18H30a18 18 0 0 1-18-18V30a18 18 0 0 1 18-18Z',
  diamond: 'M50 6 94 50 50 94 6 50Z',
  hex: 'M50 7 89 28.5v43L50 93 11 71.5v-43Z',
  drop: 'M50 7c22 21 38 37 38 52a38 38 0 0 1-76 0c0-15 16-31 38-52Z',
  star: 'M50 6 61.2 34.6 91.9 36.4 68.1 55.9 75.9 85.6 50 69 24.1 85.6 31.9 55.9 8.1 36.4 38.8 34.6Z',
};

/**
 * The drop shadow, in the artwork's own coordinates.
 *
 * This used to be `filter: drop-shadow(0 2px 0 …)` in CSS, which put a filter
 * on all sixty-four tiles at once. A drop-shadow with zero blur is only an
 * offset copy of the silhouette, so drawing that copy here is the same picture
 * for none of the cost — and it matters most on WebKit, where a filtered
 * element takes a separate rendering path rather than compositing like its
 * neighbours.
 *
 * The offset has to be a constant in user units where the filter's was 2 CSS
 * pixels, so it cannot track the tile's size exactly. 100 user units render as
 * 42–49 CSS px across every board width the game supports, which puts this
 * between 1.85 and 2.15 px — indistinguishable at 16% alpha.
 */
const SHADOW_DY = 4.4;
const SHADOW_FILL = 'rgba(0, 26, 114, 0.16)';

type Props = {
  color: number;
  special: SpecialKind;
};

export function ShapeSprite({ color, special }: Props) {
  const shape = SHAPES[color] ?? SHAPES[0];
  const bomb = special === 'bomb';

  return (
    <svg className="shape__art" viewBox="0 0 100 100" aria-hidden="true">
      {bomb ? (
        // A colour bomb belongs to no colour: a dark sphere speckled with every
        // shape hue, so it reads as "all of them at once".
        <>
          <circle cx="50" cy={50 + SHADOW_DY} r="40" fill={SHADOW_FILL} />
          <circle cx="50" cy="50" r="40" fill="#1b1b3a" />
          {SHAPES.map((entry, index) => {
            const angle = (index / SHAPES.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={entry.name}
                cx={50 + Math.cos(angle) * 22}
                cy={50 + Math.sin(angle) * 22}
                r="8.5"
                fill={entry.color}
              />
            );
          })}
          <circle cx="38" cy="34" r="7" fill="#ffffff" opacity="0.5" />
        </>
      ) : (
        <>
          <path
            d={SILHOUETTES[shape.silhouette]}
            fill={SHADOW_FILL}
            transform={`translate(0 ${SHADOW_DY})`}
          />
          <path d={SILHOUETTES[shape.silhouette]} fill={shape.color} />
          <path
            d={SILHOUETTES[shape.silhouette]}
            fill="none"
            stroke="rgba(0,26,114,0.22)"
            strokeWidth="3"
          />
          <ellipse cx="38" cy="31" rx="13" ry="9" fill={shape.sheen} opacity="0.75" />

          {(special === 'stripedH' || special === 'stripedV') && (
            <g opacity="0.92" transform={special === 'stripedV' ? 'rotate(90 50 50)' : undefined}>
              {[-14, 0, 14].map((offset) => (
                <rect
                  key={offset}
                  x="12"
                  y={46 + offset}
                  width="76"
                  height="7"
                  rx="3.5"
                  fill="#ffffff"
                />
              ))}
            </g>
          )}

          {special === 'wrapped' && (
            <>
              <path
                d={SILHOUETTES[shape.silhouette]}
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                opacity="0.9"
                transform="scale(0.62) translate(31 31)"
              />
              <path d="M8 50h84M50 8v84" stroke="#ffffff" strokeWidth="6" opacity="0.75" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
