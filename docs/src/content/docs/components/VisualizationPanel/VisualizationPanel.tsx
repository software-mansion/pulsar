import styles from './VisualizationPanel.module.scss';
import playIcon from '../../assets/new_assets/play.svg';
import pauseIcon from '../../assets/new_assets/pause.svg';
import { useState, useRef } from 'react';
import { AudioPatternUtility } from '../Preset/audio-player';
import type { PresetConfig } from '../Preset/types';
import { API_SERVER_URL } from '../config';

type PosthogWithException = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  captureException?: (error: Error) => void;
};

interface VisualizationPanelProps {
  visualization: PresetConfig;
  className?: string;
  playOnDevice?: () => void;
  presetName?: string;
  soundEnabled?: boolean;
}

export function VisualizationPanel({
  visualization,
  className = '',
  presetName,
  soundEnabled = true,
}: VisualizationPanelProps) {
  const normalizedPresetName = presetName
    ? `${presetName.charAt(0).toLowerCase()}${presetName.slice(1)}`
    : presetName;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<AudioPatternUtility | null>(null);
  const isParsed = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  if (!audioPlayerRef.current) {
    audioPlayerRef.current = new AudioPatternUtility();
  }

  const stopAnimation = (scrollBack = true) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (indicatorRef.current) indicatorRef.current.style.left = '0px';
    if (scrollBack) {
      scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const startAnimation = () => {
    const presetDuration = visualization.data.duration;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / presetDuration, 1);
      const imageWidth = imageRef.current?.offsetWidth ?? 1000;
      const indicatorX = progress * Math.min(imageWidth, presetDuration);

      if (indicatorRef.current) indicatorRef.current.style.left = `${indicatorX}px`;

      if (scrollRef.current) {
        const viewportWidth = scrollRef.current.offsetWidth;
        const scrollX = Math.max(0, indicatorX - viewportWidth / 2);
        scrollRef.current.scrollLeft = scrollX;
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

  const handlePlayOnDevice = async () => {
    const token = localStorage.getItem('hapticsToken');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_SERVER_URL}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: presetName,
          // message: normalizedPresetName,
          token: token,
        }),
      });

      const data = await response.json();
      console.log('Broadcast response:', data);
      window.posthog?.capture('preset_played_on_device', { preset_name: presetName });
    } catch (error) {
      console.error('Error broadcasting to device:', error);
      (window.posthog as PosthogWithException | undefined)?.captureException?.(error as Error);
    }
  };

  const handlePlayClick = async () => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;
    if (audioPlayer.isPlaying()) {
      audioPlayer.stop();
      setIsPlaying(false);
      stopAnimation();
    } else {
      setIsPlaying(true);
      handlePlayOnDevice();
      window.posthog?.capture('preset_played', { preset_name: presetName });
      try {
        if (!isParsed.current) {
          await audioPlayer.parsePattern(visualization.data);
          isParsed.current = true;
        }
        if (soundEnabled) {
          audioPlayer.play();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        (window.posthog as PosthogWithException | undefined)?.captureException?.(error as Error);
      }
      startAnimation();
    }
  };

  return (
    <div className={`${styles.visualizationPanel} ${className}`}>
      <div className={styles.visualization} ref={scrollRef}>
        <div className={styles.visualizationInner}>
          <img ref={imageRef} src={visualization.image.src} alt="visualization" className={styles.image} />
          {isPlaying && (
            <div className={styles.indicator} ref={indicatorRef} />
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlButton} onClick={handlePlayClick}>
          {isPlaying ? (
            <img src={pauseIcon.src} alt="Pause" />
          ) : (
            <img src={playIcon.src} alt="Play" />
          )}
        </div>
      </div>
    </div>
  );
}
