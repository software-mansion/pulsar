import styles from './ResizeHandle.module.css';
import { useRef } from 'react';
import { send } from '../figmaBridge';
import gripIcon from '../assets/icon-resize-grip.svg';

// Kept in sync with MIN_SIZE/MAX_SIZE in src/main/code.ts. The main thread
// clamps authoritatively; this just stops the UI from sending obviously
// out-of-range values while dragging.
const MIN = { width: 320, height: 460 };
const MAX = { width: 1200, height: 1200 };

const clampW = (v: number) => Math.max(MIN.width, Math.min(MAX.width, Math.ceil(v)));
const clampH = (v: number) => Math.max(MIN.height, Math.min(MAX.height, Math.ceil(v)));

// Which edge a handle drives. Figma anchors the plugin window at its top-left and
// only exposes figma.ui.resize(w, h) - there's no reposition - so only the right
// edge (width), the bottom edge (height), and the bottom-right corner (both) can
// move; the top/left edges have nothing to anchor against.
type Edge = 'right' | 'bottom' | 'corner';

// The iframe fills the plugin window, so the pointer position relative to the
// iframe viewport IS the desired window size. An edge handle changes only its own
// axis; the other axis holds the current window size (innerWidth/innerHeight).
function sizeFromEvent(e: React.PointerEvent<HTMLDivElement>, edge: Edge) {
  return {
    width: edge === 'bottom' ? window.innerWidth : clampW(e.clientX),
    height: edge === 'right' ? window.innerHeight : clampH(e.clientY)
  };
}

// A single drag affordance. Corner shows the grip glyph; the edges are thin
// invisible strips that only change the cursor on hover.
function ResizeGrip({
  edge,
  className,
  title,
  children
}: {
  edge: Edge;
  className: string;
  title: string;
  children?: React.ReactNode;
}) {
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    send({ type: 'resize', ...sizeFromEvent(e, edge) });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    // commit: persist the final size so it's restored next time.
    send({ type: 'resize', ...sizeFromEvent(e, edge), commit: true });
  }

  return (
    <div
      className={className}
      title={title}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
}

// Plugin-window resize affordances. Figma plugin windows don't resize from their
// OS edges - the only way to resize is in-UI handles that call figma.ui.resize()
// on the main thread. A grip in the bottom-right corner drives both axes; thin
// strips down the right edge and along the bottom edge drive one axis each.
export default function ResizeHandle() {
  return (
    <>
      <ResizeGrip edge="right" className={styles['resize-edge-right']} title="Drag to resize width" />
      <ResizeGrip edge="bottom" className={styles['resize-edge-bottom']} title="Drag to resize height" />
      <ResizeGrip edge="corner" className={styles['resize-handle']} title="Drag to resize">
        <img src={gripIcon} alt="" width={22} height={22} />
      </ResizeGrip>
    </>
  );
}
