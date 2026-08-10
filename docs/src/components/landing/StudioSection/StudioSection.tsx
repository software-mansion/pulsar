import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './StudioSection.module.scss';
import { BASE_PATH } from '../../../../config';

// What Studio lets you do — short labels echoing the Studio landing feature grid.
const highlights = [
  'Design patterns from scratch',
  'Tweak existing presets',
  'Generate haptics from audio',
  'Match your Lottie animations',
  'Preview on real devices',
  'Export production-ready code',
];

// Studio in action: a looping product demo framed in the Pulsar "window" card.
function StudioPreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.previewTitle}>Pulsar Studio</span>
      </div>
      <div className={styles.previewBody}>
        <video
          className={styles.video}
          src={`${BASE_PATH}/assets/pulsar-demo.mp4`}
          poster={`${BASE_PATH}/assets/pulsar-demo-poster.jpg`}
          controls
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
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
          title="Design your own with Pulsar&nbsp;Studio"
          subtitle="An all-in-one tool for designing, tweaking, and generating custom haptics - then exporting production-ready code. Currently in development."
          align="center"
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
            url={`${BASE_PATH}/studio/#waitlist`}
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
