import { useEffect, useRef, type RefObject } from 'react';
import styles from './FigmaDemo.module.scss';
import { BASE_PATH } from '../../../../config';
import { track, trackFirstTimeOnly } from '../../../analytics/analytics';

import star from '../../../assets/landing-page/star.svg';
import wavePattern from '../../../assets/landing-page/pattern.svg';

const VISIBLE_ENOUGH_TO_PLAY = 0.4;
const PROGRESS_QUARTILES = [25, 50, 75, 100];

const ignoreBlockedAutoplay = () => {};

function usePlayWhileOnScreen(videoRef: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(ignoreBlockedAutoplay);
        else video.pause();
      },
      { threshold: VISIBLE_ENOUGH_TO_PLAY },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef]);
}

function useTrackPlayback(videoRef: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => track('figma_landing_demo_played');
    const onTimeUpdate = () => {
      if (!video.duration) return;
      const percentPlayed = (video.currentTime / video.duration) * 100;
      for (const quartile of PROGRESS_QUARTILES) {
        if (percentPlayed >= quartile)
          trackFirstTimeOnly('figma_landing_demo_progress', { percent: quartile });
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [videoRef]);
}

export function FigmaDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  usePlayWhileOnScreen(videoRef);
  useTrackPlayback(videoRef);

  return (
    <section className={styles.section}>
      <div className={styles.waves} aria-hidden="true">
        <img src={wavePattern.src} alt="" />
      </div>

      <div className={styles.inner}>
        <img
          className={`${styles.star} ${styles.starBig}`}
          src={star.src}
          alt=""
          aria-hidden="true"
        />
        <img
          className={`${styles.star} ${styles.starSmall}`}
          src={star.src}
          alt=""
          aria-hidden="true"
        />

        <div className={styles.frame}>
          <video
            ref={videoRef}
            className={styles.video}
            src={`${BASE_PATH}/figma-plugin/select_preset.mp4#t=0.1`}
            controls
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </section>
  );
}
