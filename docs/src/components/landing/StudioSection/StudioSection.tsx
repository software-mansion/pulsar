import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './StudioSection.module.scss';

import heroChart from '../../../assets/landing-page/studio-features/hero-chart.svg';
import emojiStar from '../../../assets/landing-page/emoji2.svg';
import emojiSad from '../../../assets/landing-page/emoji3.svg';
import emojiHappy from '../../../assets/landing-page/emoji4.svg';
import emojiNeutral from '../../../assets/landing-page/emoji_neutral.svg';

// What Studio lets you do — echoing the Studio landing feature tiles.
const highlights = [
  'Design custom haptic patterns from scratch',
  'Tweak existing presets to match your project',
  'Generate haptics from audio',
  'Create haptics that match your Lottie animations',
  'Preview in Figma or on a real device',
  'Export production-ready code',
];

const emojiTiles = [
  { src: emojiStar.src, label: 'Applause' },
  { src: emojiSad.src, label: 'Power Down' },
  { src: emojiHappy.src, label: 'Bloom' },
  { src: emojiNeutral.src, label: 'Heartbeat' },
];

function StudioPreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.urlPill}>pulsar.swmansion.com/studio</div>
      </div>
      <div className={styles.previewBody}>
        <div className={styles.emojiRow}>
          {emojiTiles.map((tile) => (
            <div key={tile.label} className={styles.emojiTile}>
              <img src={tile.src} alt={tile.label} />
            </div>
          ))}
        </div>
        <img
          src={heroChart.src}
          alt="Pulsar Studio haptic waveform editor preview"
          className={styles.heroChart}
        />
      </div>
    </div>
  );
}

export function StudioSection({ className }: { className?: string }) {
  return (
    <div className={`${styles.section} ${className || ''}`}>
      <div className={styles.left}>
        <SectionHeader
          title="Design your own with Pulsar Studio"
          subtitle="Pulsar Studio is a visual haptic editor for designing custom patterns, previewing them live on device, and exporting production-ready code for iOS, Android, and React Native. Currently in development."
          align="left"
        />
        <ul className={styles.highlights}>
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button
            label="Join the waitlist"
            variant="filled"
            url="https://pulsar.swmansion.com/studio"
            onClick={() => window.posthog?.capture('studio_section_waitlist_clicked')}
          />
        </div>
      </div>
      <div className={styles.right}>
        <StudioPreview />
      </div>
    </div>
  );
}
