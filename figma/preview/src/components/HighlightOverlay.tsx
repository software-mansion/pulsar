import type { CSSProperties } from 'react';
import type { ElementInfo, NodeBox } from '../types';

// Map absolute Figma boxes onto the embed, assuming the presented frame is shown
// "contain"-scaled and centred inside the iframe (matches scaling=contain + hide-ui).
function boxStyle(
  el: ElementInfo,
  frame: NodeBox,
  size: { width: number; height: number }
): CSSProperties | null {
  if (!el.box || size.width === 0 || size.height === 0) return null;
  const scale = Math.min(size.width / frame.w, size.height / frame.h);
  const offX = (size.width - frame.w * scale) / 2;
  const offY = (size.height - frame.h * scale) / 2;
  return {
    left: offX + (el.box.x - frame.x) * scale,
    top: offY + (el.box.y - frame.y) * scale,
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
