import { useRef, useState } from 'react';
import styles from './StudioHero.module.scss';
import { Button } from '../../landing/Button/Button';
import { HeroChart } from './HeroChart';
import { AudioPatternUtility } from '../../../content/docs/components/Preset/audio-player';
import type { PatternData } from '../../../content/docs/components/Preset/types';

import pulsarLogo from '../../../assets/logo.svg';
import swmLogo from '../../../assets/swm-logo.svg';
import emojiStar from '../../../assets/landing-page/emoji2.svg';
import emojiSad from '../../../assets/landing-page/emoji3.svg';
import emojiHappy from '../../../assets/landing-page/emoji4.svg';
import emojiNeutral from '../../../assets/landing-page/emoji_neutral.svg';

import applausePreset from '../../../content/docs/assets/presets/Applause.json';
import powerDownPreset from '../../../content/docs/assets/presets/PowerDown.json';
import bloomPreset from '../../../content/docs/assets/presets/Bloom.json';
import heartbeatPreset from '../../../content/docs/assets/presets/Heartbeat.json';

const CHART_POINTS = 9;

// Reduce a preset to N amplitude samples (0..1) for the chart line: interpolate
// the continuous envelope, then let each discrete transient push its sample up.
function sampleAmplitudes(data: PatternData): number[] {
  const duration = data.duration || 1;
  const cont = data.continuousPattern?.amplitude ?? [];

  const interp = (t: number): number => {
    if (cont.length === 0) return 0;
    if (t <= cont[0].time) return cont[0].value;
    const last = cont[cont.length - 1];
    if (t >= last.time) return last.value;
    for (let i = 1; i < cont.length; i += 1) {
      if (t <= cont[i].time) {
        const p0 = cont[i - 1];
        const p1 = cont[i];
        const span = p1.time - p0.time || 1;
        return p0.value + (p1.value - p0.value) * ((t - p0.time) / span);
      }
    }
    return last.value;
  };

  const ys = Array.from({ length: CHART_POINTS }, (_, i) =>
    interp((i / (CHART_POINTS - 1)) * duration),
  );
  for (const bar of data.discretePattern ?? []) {
    const idx = Math.round((bar.time / duration) * (CHART_POINTS - 1));
    if (idx >= 0 && idx < CHART_POINTS) ys[idx] = Math.max(ys[idx], bar.amplitude);
  }
  return ys.map((y) => Math.max(0.05, Math.min(1, y)));
}

// A navigator.vibrate() pattern built from the preset's transients — real haptics
// on devices with the Web Vibration API (Android Chrome), a harmless no-op
// everywhere else (desktop, iOS).
function vibrationPattern(data: PatternData): number[] {
  const bars = data.discretePattern ?? [];
  if (bars.length === 0) return [Math.min(Math.round(data.duration || 120), 400)];
  const pattern: number[] = [];
  let cursor = 0;
  for (const bar of bars) {
    const gap = Math.max(0, Math.round(bar.time - cursor));
    const pulse = Math.round(20 + 60 * bar.amplitude);
    pattern.push(gap, pulse);
    cursor = bar.time + pulse;
  }
  // vibrate() treats index 0 as a vibrate slot, but our first entry is the leading
  // pause — prepend a 0ms buzz so the timeline stays aligned.
  return [0, ...pattern];
}

interface EmojiTile {
  src: string;
  label: string;
  preset: PatternData;
  values: number[];
}

const emojiTiles: EmojiTile[] = [
  { src: emojiStar.src, label: 'Applause', preset: applausePreset as PatternData },
  { src: emojiSad.src, label: 'Power Down', preset: powerDownPreset as PatternData },
  { src: emojiHappy.src, label: 'Bloom', preset: bloomPreset as PatternData },
  { src: emojiNeutral.src, label: 'Heartbeat', preset: heartbeatPreset as PatternData },
].map((tile) => ({ ...tile, values: sampleAmplitudes(tile.preset) }));

// The line before anything is clicked — a pleasant rising waveform in the spirit
// of the original static chart.
const DEFAULT_VALUES = [0.1, 0.28, 0.18, 0.5, 0.34, 0.66, 0.42, 0.82, 0.5];

export function StudioHero() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const playersRef = useRef<AudioPatternUtility[]>([]);
  const parsedRef = useRef<boolean[]>([]);
  const playingRef = useRef<AudioPatternUtility | null>(null);

  // Stable references (module-level / precomputed) so HeroChart only re-morphs
  // when the active preset actually changes.
  const chartValues = activeIndex === null ? DEFAULT_VALUES : emojiTiles[activeIndex].values;

  const handleEmojiClick = async (index: number) => {
    setActiveIndex(index);

    // Real device haptics where supported.
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(vibrationPattern(emojiTiles[index].preset));
    }

    // Sound — the same Web Audio path the landing-page presets use.
    playingRef.current?.stop();
    const player = (playersRef.current[index] ??= new AudioPatternUtility());
    playingRef.current = player;
    try {
      if (!parsedRef.current[index]) {
        await player.parsePattern(emojiTiles[index].preset);
        parsedRef.current[index] = true;
      }
      player.play();
    } catch (error) {
      console.error('Error playing haptic preview:', error);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.createdBy}>
            <span>Created by</span>
            <img src={swmLogo.src} alt="Software Mansion" />
          </div>

          <div className={styles.titleRow}>
            <img className={styles.mark} src={pulsarLogo.src} alt="" aria-hidden="true" />
            <h1 className={styles.title}>
              Pulsar Haptics Studio: Everything You Need to Create Custom Haptics
            </h1>
          </div>

          <p className={styles.subtitle}>
            An all-in-one tool for designing, modifying, and deploying custom haptics is
            coming soon.
          </p>

          <div className={styles.ctaRow}>
            <Button label="Join the waitlist" url="#waitlist" />
            <span className={styles.priceHint}>with pricing starting from <b style={{ fontSize: '24px' }}>9$</b></span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>
            <div className={styles.cardBar}>
              <div className={styles.dots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.urlPill}>https://pulsar.swmansion.com/studio</div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.emojiRow}>
                {emojiTiles.map((tile, index) => (
                  <button
                    key={tile.label}
                    type="button"
                    className={`${styles.emojiTile} ${
                      activeIndex === index ? styles.emojiTileActive : ''
                    }`}
                    onClick={() => handleEmojiClick(index)}
                    aria-label={`Play the ${tile.label} haptic`}
                  >
                    <img src={tile.src} alt="" aria-hidden="true" />
                  </button>
                ))}
              </div>

              <div className={styles.chart}>
                <HeroChart values={chartValues} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.soundChip}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 5 6 9H3v6h3l5 4V5Z"
            fill="#001A72"
            stroke="#001A72"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"
            stroke="#001A72"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>Keep your sound on for the best experience</span>
      </div>
    </section>
  );
}
