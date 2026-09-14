import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './StudioSection.module.scss';
import { BASE_PATH } from '../../../../config';
import { STUDIO_URL } from '../../../content/docs/components/config';
import { track } from '../../../analytics/analytics';

const highlights = [
  'Design patterns from scratch',
  'Tweak existing presets',
  'Generate haptics from audio',
  'Match your Lottie animations',
  'Preview on real devices',
  'Export production-ready code',
];

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
          src="https://assets.puslar.swmansion.com/media/Pulsar_Studio.mp4"
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
          subtitle="An all-in-one tool for designing, tweaking, and generating custom haptics - then exporting production-ready code. Available now, right in your browser."
          align="center"
        />
        <ul className={styles.highlights}>
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button
            label="Learn more"
            url={`${BASE_PATH}/studio/`}
            onClick={() => track('studio_section_learn_more_clicked')}
          />
          <Button
            label="Open Pulsar Studio"
            variant="filled"
            url={STUDIO_URL}
            onClick={() => track('studio_section_open_studio_clicked')}
          />
        </div>
      </div>
      <div className={styles.right}>
        <StudioPreview />
      </div>
    </div>
  );
}
