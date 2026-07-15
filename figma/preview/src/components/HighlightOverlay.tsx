import { memo, type CSSProperties } from 'react';
import type { ElementInfo, NodeBox } from '../types';
import { usePreviewStore } from '../store';

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

// One highlight box. Memoized + subscribes to whether *this* element is the
// active one, so lighting up a highlight on hover re-renders only the box that
// gains (and the one that loses) the active state - not the whole overlay.
const HighlightBox = memo(function HighlightBox({
  id,
  presetName,
  style
}: {
  id: string;
  presetName: string;
  style: CSSProperties;
}) {
  const active = usePreviewStore((s) => s.activeId === id);
  return (
    <div className={`hl${active ? ' active' : ''}`} style={style}>
      <span className="hl-label">{presetName}</span>
    </div>
  );
});

// The overlay container no longer subscribes to activeId, so it re-renders only
// when the frame / elements / size change (navigation, resize) - never on a hover.
export function HighlightOverlay({
  frame,
  elements,
  size
}: {
  frame: NodeBox;
  elements: ElementInfo[];
  size: { width: number; height: number };
}) {
  return (
    <div className="overlay">
      {elements.map((el) => {
        const style = boxStyle(el, frame, size);
        if (!style) return null;
        return <HighlightBox key={el.id} id={el.id} presetName={el.presetName} style={style} />;
      })}
    </div>
  );
}
