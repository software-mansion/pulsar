import { useMemo, useRef } from 'react';
import type { ElementInfo, NodeBox } from '../types';
import { buildEmbedSrc } from '../lib/embed';
import { useElementSize } from '../lib/useElementSize';
import { HighlightOverlay } from './HighlightOverlay';

export function PrototypeView({
  fileKey,
  nodeId,
  frame,
  elements,
  showHighlights,
  activeId,
  fullscreen = false,
  deviceFrame
}: {
  fileKey: string;
  nodeId: string | null;
  frame: NodeBox | null;
  elements: ElementInfo[];
  showHighlights: boolean;
  activeId: string;
  fullscreen?: boolean;
  deviceFrame: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(wrapRef);
  const src = useMemo(
    () => buildEmbedSrc(fileKey, nodeId, deviceFrame),
    [fileKey, nodeId, deviceFrame]
  );

  return (
    <div className={`frame-wrap${fullscreen ? ' fullscreen' : ''}`} ref={wrapRef}>
      <iframe title="Figma prototype" src={src} allow="fullscreen" allowFullScreen />
      {showHighlights && frame && (
        <HighlightOverlay frame={frame} elements={elements} size={size} activeId={activeId} />
      )}
    </div>
  );
}
