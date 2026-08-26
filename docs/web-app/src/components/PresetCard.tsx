import { useEffect, useRef, useState } from 'react';
import type { WebPresetEntry } from '../data/presets';
import { playPattern, stopPattern } from '../haptics';
import { HeartIcon, PlayIcon, StopIcon } from './Icons';

/**
 * Waveform geometry from `web/Pulsar/scripts/generate-images.ts`. The images are
 * drawn at a fixed 0.3px-per-millisecond scale on a 100px-tall canvas, so
 * rendering them at their natural size lets the playhead sit exactly on the
 * block it is currently playing.
 */
const PX_PER_MS = 0.3;
const PAD_X = 14;

type Props = {
  entry: WebPresetEntry;
  favourite: boolean;
  onToggleFavourite: (name: string) => void;
};

export function PresetCard({ entry, favourite, onToggleFavourite }: Props) {
  const { data, image } = entry;
  const [elapsed, setElapsed] = useState<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => cancel, []);

  function cancel() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  function reset() {
    cancel();
    setElapsed(null);
    chartRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }

  function handleToggle() {
    if (elapsed !== null) {
      reset();
      stopPattern();
      return;
    }

    playPattern(data.name, data.pattern);

    // Driven off the wall clock rather than a CSS transition so the playhead
    // stays in step with the pattern even when the browser throttles frames.
    const started = performance.now();
    const tick = () => {
      const now = performance.now() - started;
      if (now >= data.duration) {
        reset();
        return;
      }
      setElapsed(now);
      frameRef.current = requestAnimationFrame(tick);
    };
    setElapsed(0);
    frameRef.current = requestAnimationFrame(tick);
  }

  // Keep the playhead in view on presets long enough to overflow the card.
  useEffect(() => {
    const chart = chartRef.current;
    if (elapsed === null || chart === null) return;
    const x = PAD_X + elapsed * PX_PER_MS;
    if (x > chart.scrollLeft + chart.clientWidth - 40) {
      chart.scrollLeft = x - chart.clientWidth / 2;
    }
  }, [elapsed]);

  const playing = elapsed !== null;

  return (
    <article className="card preset">
      <div className="preset__top">
        <div className="tags">
          {data.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="heart"
          aria-label={
            favourite ? `Remove ${data.name} from favourites` : `Add ${data.name} to favourites`
          }
          aria-pressed={favourite}
          onClick={() => onToggleFavourite(data.name)}
        >
          <HeartIcon size={22} filled={favourite} />
        </button>
      </div>

      <h3 className="subtitle preset__title">{data.name}</h3>
      <p className="preset__description">{data.description}</p>

      <div className="preset__chart" ref={chartRef}>
        <img src={image} alt={`Waveform of the ${data.name} preset`} loading="lazy" />
        {elapsed !== null && (
          <span className="preset__playhead" style={{ left: PAD_X + elapsed * PX_PER_MS }} />
        )}
      </div>

      <button type="button" className="btn" onClick={handleToggle}>
        {playing ? <StopIcon size={18} /> : <PlayIcon size={18} />}
        {playing ? 'Stop' : 'Play'}
      </button>
    </article>
  );
}
