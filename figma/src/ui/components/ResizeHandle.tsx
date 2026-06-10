import { useRef } from 'react';
import { send } from '../figmaBridge';
import gripIcon from '../assets/icon-resize-grip.svg';

// Kept in sync with MIN_SIZE/MAX_SIZE in src/main/code.ts. The main thread
// clamps authoritatively; this just stops the UI from sending obviously
// out-of-range values while dragging.
const MIN = { width: 320, height: 460 };
const MAX = { width: 1200, height: 1200 };

function sizeFromEvent(e: React.PointerEvent<HTMLDivElement>) {
  // The iframe fills the plugin window, so the pointer position relative to the
  // iframe viewport is the desired window size.
  return {
    width: Math.max(MIN.width, Math.min(MAX.width, Math.ceil(e.clientX))),
    height: Math.max(MIN.height, Math.min(MAX.height, Math.ceil(e.clientY)))
  };
}

// Bottom-right corner grip. Figma plugin windows don't resize from their OS
// edges — the only way to resize is an in-UI handle that calls
// figma.ui.resize() on the main thread.
export default function ResizeHandle() {
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const { width, height } = sizeFromEvent(e);
    send({ type: 'resize', width, height });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { width, height } = sizeFromEvent(e);
    // commit: persist the final size so it's restored next time.
    send({ type: 'resize', width, height, commit: true });
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title="Drag to resize"
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        width: 22,
        height: 22,
        // Above the floating scroll-to-top FAB (z-index 1000) so it never
        // steals the corner.
        zIndex: 1001,
        cursor: 'nwse-resize',
        touchAction: 'none'
      }}
    >
      <img src={gripIcon} alt="" width={22} height={22} style={{ display: 'block' }} />
    </div>
  );
}
