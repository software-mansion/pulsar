import type { CSSProperties } from 'react';
import type { ElementInfo, NodeBox } from '../types';

// The iframe fills the whole stage (100%×100%); Figma renders the frame with
// scaling=contain, which fits the frame INSIDE the iframe and centers it, but
// reserves a small fixed inset (measured empirically against the live embed -
// see fitFrame). We reproduce that exact fit+center transform so the overlay
// boxes land on the rendered components.
//
// Measured rule (device-frame=false, scaling=contain):
//   scale  = min((W - 2*INSET_X)/frame.w, (H - 2*INSET_Y)/frame.h)
//   offset = center the scaled frame within the iframe: (W - frame.w*scale)/2, …
// INSET_X / INSET_Y are the constant insets Figma's contain reserves on each
// axis, in iframe (CSS) pixels. Derived from screenshots at multiple window
// sizes/aspect ratios; alignment confirmed on the live embed.
const INSET_X = 60;
const INSET_Y = 72;

function fitFrame(frame: NodeBox, size: { width: number; height: number }) {
  const scale = Math.min(
    (size.width - 2 * INSET_X) / frame.w,
    (size.height - 2 * INSET_Y) / frame.h
  );
  const offsetX = (size.width - frame.w * scale) / 2;
  const offsetY = (size.height - frame.h * scale) / 2;
  return { scale, offsetX, offsetY };
}

function boxStyle(
  el: ElementInfo,
  frame: NodeBox,
  size: { width: number; height: number }
): CSSProperties | null {
  if (!el.box || size.width === 0 || size.height === 0) return null;
  const { scale, offsetX, offsetY } = fitFrame(frame, size);
  if (scale <= 0) return null;
  return {
    left: offsetX + (el.box.x - frame.x) * scale,
    top: offsetY + (el.box.y - frame.y) * scale,
    width: el.box.w * scale,
    height: el.box.h * scale
  };
}

export function HighlightOverlay({
  frame,
  elements,
  size,
  activeId
}: {
  frame: NodeBox;
  elements: ElementInfo[];
  size: { width: number; height: number };
  activeId: string;
}) {
  return (
    <div className="overlay">
      {elements.map((el) => {
        const style = boxStyle(el, frame, size);
        if (!style) return null;
        return (
          <div
            key={el.id}
            className={`hl${activeId === el.id ? ' active' : ''}`}
            style={style}
          >
            <span className="hl-label">{el.presetName}</span>
          </div>
        );
      })}
    </div>
  );
}
