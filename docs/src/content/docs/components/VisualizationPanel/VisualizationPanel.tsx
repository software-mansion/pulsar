import styles from './VisualizationPanel.module.scss';
import phoneIcon from '../../assets/new_assets/phone.svg';
import playIcon from '../../assets/new_assets/play.svg';
import pauseIcon from '../../assets/new_assets/pause.svg';
import { useState, useEffect, useRef } from 'react';
import { AudioPatternUtility } from '../Preset/audio-player';
import type { PresetConfig } from '../Preset/types';
import { API_SERVER_URL } from '../config';

interface VisualizationPanelProps {
  visualization: PresetConfig;
  duration?: number;
  className?: string;
  playOnDevice?: () => void;
}

export function VisualizationPanel({
  visualization,
  duration = 300,
  className = '',
  playOnDevice,
}: VisualizationPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<AudioPatternUtility | null>(null);
  const isParsed = useRef<boolean>(false);

  if (!audioPlayerRef.current) {
    audioPlayerRef.current = new AudioPatternUtility();
  }

  const handlePlayOnDevice = async () => {
    if (playOnDevice) {
      playOnDevice();
      return;
    }

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
          message: visualization.data,
          token: token,
        }),
      });

      const data = await response.json();
      console.log('Broadcast response:', data);
    } catch (error) {
      console.error('Error broadcasting to device:', error);
    }
  };

  const handlePlayClick = async () => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;
    if (audioPlayer.isPlaying()) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        if (!isParsed.current) {
          await audioPlayer.parsePattern(visualization.data);
          isParsed.current = true;
        }
        audioPlayer.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, duration]);

  return (
    <div className={`${styles.visualizationPanel} ${className}`}>
      <div className={styles.visualization}>
        <img src={visualization.image.src} alt="visualization" className={styles.image} />
        {isPlaying && (
          <div 
            className={styles.indicator} 
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>

      <div className={styles.controls}>
        <div
          className={styles.controlButton}
          onClick={handlePlayClick}
        >
          {isPlaying ? <img src={pauseIcon.src} alt="Pause" /> : <img src={playIcon.src} alt="Play" />}
        </div>

        <div
          className={styles.controlButton}
          onClick={handlePlayOnDevice}
          title="Record"
          aria-label="Record"
        >
          <img src={phoneIcon.src} alt="Play vibration on device" />
        </div>
      </div>

    </div>
  );
}
