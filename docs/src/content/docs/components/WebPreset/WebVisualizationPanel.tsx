import styles from './WebVisualizationPanel.module.scss';
import playIcon from '../../assets/new_assets/play.svg';
import pauseIcon from '../../assets/new_assets/pause.svg';
import { useEffect, useRef, useState } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import type { WebPresetConfig } from './types';

// Mirror the generator constants in web/Pulsar/scripts/generate-images.ts so the play
// indicator lines up with the rendered bars regardless of the image's display scale.
const PX_PER_MS = 0.3;
const PAD_X = 14;
const RIGHT_MARGIN = 24; // keep the playhead this far inside the right edge when scrolling

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

interface Props {
  visualization: WebPresetConfig;
  soundEnabled?: boolean;
  className?: string;
}

// A single Pulsar preset instance is created lazily and kept around so a repeated
// play reuses the prepared audio fallback buffer.
type PulsarPreset = { play: () => Promise<unknown>; stop: () => boolean };

/**
 * Web version of VisualizationPanel: shows the generated PNG and plays the preset
 * directly in the browser through pulsar-haptics (real vibration where supported,
 * audio fallback otherwise). No phone connection / broadcast.
 */
export function WebVisualizationPanel({ visualization, soundEnabled = true, className = '' }: Props) {
  const { data } = visualization;
  const [isPlaying, setIsPlaying] = useState(false);
  const presetRef = useRef<PulsarPreset | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      presetRef.current?.stop();
    };
  }, []);

  const stopAnimation = (scrollBack = true) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (indicatorRef.current) indicatorRef.current.style.left = '0px';
    if (scrollBack) scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const startAnimation = () => {
    const presetDuration = data.duration;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / presetDuration, 1);
      // Bars sit at natural x = PAD_X + t * PX_PER_MS; scale by the image's display ratio.
      const img = imageRef.current;
      const scaleX = img && img.naturalWidth ? img.offsetWidth / img.naturalWidth : 1;
      const indicatorX = (PAD_X + progress * presetDuration * PX_PER_MS) * scaleX;

      if (indicatorRef.current) indicatorRef.current.style.left = `${indicatorX}px`;

      const scroller = scrollRef.current;
      if (scroller) {
        // Scroll just enough to keep the playhead in view, based on where the BARS end
        // (not scrollWidth, which includes trailing grid). Linear in progress → smooth,
        // never lurches, and never overshoots into empty grid.
        const barsEndX = (PAD_X + presetDuration * PX_PER_MS) * scaleX;
        const needed = Math.max(0, barsEndX + RIGHT_MARGIN - scroller.clientWidth);
        scroller.scrollLeft = progress * needed;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setTimeout(() => stopAnimation(true), 200);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handlePlayClick = async () => {
    if (isPlaying) {
      presetRef.current?.stop();
      setIsPlaying(false);
      stopAnimation();
      return;
    }

    setIsPlaying(true);
    startAnimation();
    window.posthog?.capture('web_preset_played', { preset_name: data.name });

    try {
      // Loaded lazily so the haptics library never runs during SSR.
      const { Preset, Settings } = await import('pulsar-haptics');
      Settings.enableSound(soundEnabled);
      const preset = new Preset(
        data.name,
        data.pattern as unknown as HapticPattern,
      ) as unknown as PulsarPreset;
      presetRef.current = preset;
      await preset.play();
    } catch (error) {
      console.error('Error playing web preset:', error);
      setIsPlaying(false);
      stopAnimation();
    }
  };

  return (
    <div className={`${styles.visualizationPanel} ${className}`}>
      <div className={styles.visualization} ref={scrollRef}>
        <div className={styles.visualizationInner}>
          <img
            ref={imageRef}
            src={visualization.image.src}
            alt={`${data.name} visualization`}
            className={styles.image}
          />
          {isPlaying && <div className={styles.indicator} ref={indicatorRef} />}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlButton} onClick={handlePlayClick}>
          <img src={isPlaying ? pauseIcon.src : playIcon.src} alt={isPlaying ? 'Pause' : 'Play'} />
        </div>
      </div>
    </div>
  );
}
