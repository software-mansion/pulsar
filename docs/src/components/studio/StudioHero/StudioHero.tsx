import styles from './StudioHero.module.scss';
import { Button } from '../../landing/Button/Button';

import pulsarLogo from '../../../assets/logo.svg';
import swmLogo from '../../../assets/swm-logo.svg';
import emojiStar from '../../../assets/landing-page/emoji2.svg';
import emojiSad from '../../../assets/landing-page/emoji3.svg';
import emojiHappy from '../../../assets/landing-page/emoji4.svg';
import emojiNeutral from '../../../assets/landing-page/emoji_neutral.svg';
import heroChart from '../../../assets/landing-page/studio-features/hero-chart.svg';

const emojiTiles = [
  { src: emojiStar.src, alt: 'star reaction' },
  { src: emojiSad.src, alt: 'sad reaction' },
  { src: emojiHappy.src, alt: 'happy reaction' },
  { src: emojiNeutral.src, alt: 'neutral reaction' },
];

export function StudioHero() {
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
            coming soon. X$ per month.
          </p>

          <div className={styles.ctaRow}>
            <Button label="Join the waitlist" url="#waitlist" />
            <span className={styles.priceHint}>with pricing starting from X$</span>
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
                {emojiTiles.map((e) => (
                  <div key={e.alt} className={styles.emojiTile}>
                    <img src={e.src} alt={e.alt} />
                  </div>
                ))}
              </div>

              <div className={styles.chart}>
                <img src={heroChart.src} alt="" aria-hidden="true" />
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
