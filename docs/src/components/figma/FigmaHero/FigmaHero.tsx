import styles from './FigmaHero.module.scss';
import { Button } from '../../landing/Button/Button';
import { FIGMA_COMMUNITY_URL } from '../figmaLinks';
import { trackingAttributes } from '../../../analytics/analytics';

import swmLogo from '../../../assets/swm-logo.svg';
import star from '../../../assets/landing-page/star.svg';
import pluginWindow from '../../../content/docs/assets/figma-plugin/presets-filters.png';

export function FigmaHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.halo} aria-hidden="true" />
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

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.createdBy}>
            <span>Created by</span>
            <img src={swmLogo.src} alt="Software Mansion" />
          </div>

          <h1 className={styles.title}>Design your haptics right where you design your UI</h1>

          <p className={styles.subtitle}>
            Pulsar brings haptics into Figma: the plugin lets you bind a preset to any design
            element, hear it as you edit, feel it on a real phone, and iterate on the spot.
          </p>

          <div className={styles.ctaRow}>
            <Button
              label="Install from Figma Community"
              url={FIGMA_COMMUNITY_URL}
              analytics={trackingAttributes('figma_landing_cta_clicked', { location: 'hero' })}
            />
            <Button
              label="See how it works"
              variant="filled"
              url="#how-it-works"
              analytics={trackingAttributes('figma_landing_how_it_works_clicked')}
            />
          </div>

          <p className={styles.footnote}>
            *The plugin works with a free Pulsar account and a plugin subscription. A free trial is
            available.
          </p>
        </div>

        <div className={styles.right}>
          <div className={styles.cardBehind} aria-hidden="true" />
          <div className={`${styles.cardBehind} ${styles.cardBehindFar}`} aria-hidden="true" />
          <div className={styles.shot}>
            <div className={styles.shotBar}>
              <span className={styles.shotMark} aria-hidden="true" />
              <span className={styles.shotName}>Pulsar Haptics</span>
              <span className={styles.shotClose} aria-hidden="true">
                &times;
              </span>
            </div>
            <img
              className={styles.shotImage}
              src={pluginWindow.src}
              width={pluginWindow.width}
              height={pluginWindow.height}
              alt="The Pulsar Haptics plugin running inside Figma, showing the preset library with its filters open"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
