import styles from './FigmaDemo.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { Button } from '../../landing/Button/Button';
import { FIGMA_COMMUNITY_URL } from '../figmaLinks';
import { trackingAttributes } from '../../../analytics/analytics';

import star from '../../../assets/landing-page/star.svg';
import wavePattern from '../../../assets/landing-page/pattern.svg';

const highlights = [
  'Pick a preset from a library of 200+',
  'Bind it to a layer and hear it as you design',
  'Feel it on your phone, then hand over the code',
];

export function FigmaDemo() {
  return (
    <section className={styles.section}>
      <div className={styles.waves} aria-hidden="true">
        <img src={wavePattern.src} alt="" />
      </div>

      <BasicLayout>
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

          <div className={styles.copy}>
            <h2 className={styles.heading}>See the plugin in action</h2>
            <p className={styles.subtitle}>
              A short run through the whole loop, from picking a haptic in Figma to feeling it on
              the phone next to you.
            </p>

            <ul className={styles.highlights}>
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            <Button
              label="Install from Figma Community"
              variant="filled"
              url={FIGMA_COMMUNITY_URL}
              analytics={trackingAttributes('figma_landing_cta_clicked', { location: 'demo' })}
            />
          </div>

          <div className={styles.player}>
            <iframe
              className={styles.video}
              src="https://streamable.com/e/b00ey2"
              title="Pulsar plugin for Figma in action"
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
