import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { realtime } from "../pulsar";

export function RealtimePad() {
  const padRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const [intensity, setIntensity] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [active, setActive] = useState(false);

  const update = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const yFromTop = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const i = 1 - yFromTop;
    const f = x;

    pad.style.setProperty("--x", `${x * 100}%`);
    pad.style.setProperty("--y", `${yFromTop * 100}%`);
    if (cursorRef.current) {
      cursorRef.current.style.left = `${x * 100}%`;
      cursorRef.current.style.top = `${yFromTop * 100}%`;
    }

    setIntensity(i);
    setFrequency(f);
    realtime.set(i, f);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activeRef.current = true;
    setActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e.clientX, e.clientY);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;
    update(e.clientX, e.clientY);
  };

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setActive(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    realtime.stop();
  };

  return (
    <section className="panel">
      <h2>Realtime composer pad</h2>
      <div
        ref={padRef}
        className={`pad${active ? " active" : ""}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="pad-axes" />
        <span className="pad-label x">x → frequency</span>
        <span className="pad-label y">y → intensity</span>
        <div ref={cursorRef} className="pad-cursor" />
      </div>
      <div className="pad-values">
        <div>
          intensity (y)<strong>{intensity.toFixed(2)}</strong>
        </div>
        <div>
          frequency (x)<strong>{frequency.toFixed(2)}</strong>
        </div>
      </div>
    </section>
  );
}
