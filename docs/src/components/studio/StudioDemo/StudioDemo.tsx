import { useEffect, useRef } from 'react';
import styles from './StudioDemo.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { Button } from '../../landing/Button/Button';
import { STUDIO_URL } from '../../../content/docs/components/config';
import { BASE_PATH } from '../../../../config';
import { track, trackFirstTimeOnly } from '../../../analytics/analytics';

export function StudioDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play the demo while it's on screen and pause it once it scrolls away, so it
  // starts on its own without an autoplay attribute (kept muted so browsers
  // allow programmatic playback). The user can still take over via the controls.
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

    const onPlay = () => track('studio_landing_demo_played');
    const onTimeUpdate = () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      for (const quartile of [25, 50, 75, 100]) {
        if (percent >= quartile)
          trackFirstTimeOnly('studio_landing_demo_progress', { percent: quartile });
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
      <BasicLayout>
        <div className={styles.inner}>
          <h2 className={styles.heading}>See Pulsar Studio in action</h2>
          <p className={styles.subtitle}>
            A quick look at designing, tweaking, and exporting custom haptics — all in one place.
          </p>

          <div className={styles.window}>
            <div className={styles.windowBar}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.windowTitle}>Pulsar Studio</span>
            </div>
            <div className={styles.windowBody}>
              <video
                ref={videoRef}
                className={styles.video}
                src="https://assets.puslar.swmansion.com/media/Pulsar_Studio.mp4"
                poster={`${BASE_PATH}/assets/pulsar-demo-poster.jpg`}
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          <div className={styles.cta}>
            <Button
              label="Open Pulsar Studio"
              variant="filled"
              url={STUDIO_URL}
              onClick={() => track('studio_landing_cta_clicked', { location: 'demo' })}
            />
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
