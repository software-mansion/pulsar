import { useEffect, useRef } from 'react';
import styles from './FigmaDemo.module.scss';
import { BASE_PATH } from '../../../../config';
import { track, trackFirstTimeOnly } from '../../../analytics/analytics';

import star from '../../../assets/landing-page/star.svg';
import wavePattern from '../../../assets/landing-page/pattern.svg';

export function FigmaDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Same treatment as the Studio demo: play while it is on screen, pause once it
  // scrolls away, and stay muted so browsers allow the programmatic start.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* Autoplay can be blocked; the visible controls are the fallback. */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );

    const onPlay = () => track('figma_landing_demo_played');
    const onTimeUpdate = () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      for (const quartile of [25, 50, 75, 100]) {
        if (percent >= quartile)
          trackFirstTimeOnly('figma_landing_demo_progress', { percent: quartile });
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    observer.observe(video);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      observer.disconnect();
    };
  }, []);

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
