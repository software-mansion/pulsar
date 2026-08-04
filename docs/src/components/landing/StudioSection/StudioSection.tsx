import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './StudioSection.module.scss';
import { BASE_PATH } from '../../../../config';

const NAVY = '#001A72';

// What Studio lets you do — short labels echoing the Studio landing feature grid.
const highlights = [
  'Design patterns from scratch',
  'Tweak existing presets',
  'Generate haptics from audio',
  'Match your Lottie animations',
  'Preview on real devices',
  'Export production-ready code',
];

// Static preview of the Studio editor: an editable-looking haptic waveform with
// draggable nodes, in the Pulsar navy line-art style.
const WAVE_XS = [10, 46, 82, 118, 154, 190, 226];
const WAVE_YS = [70, 40, 58, 22, 52, 34, 64];
const WAVE_NODES = [1, 3, 5];

function StudioPreview() {
  const points = WAVE_XS.map((x, i) => `${x},${WAVE_YS[i]}`).join(' ');
  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.previewTitle}>Pulsar Studio</span>
      </div>
      <div className={styles.previewBody}>
        <svg viewBox="0 0 236 92" className={styles.wave} fill="none" aria-hidden="true">
          <polyline
            points={points}
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {WAVE_NODES.map((i) => (
            <circle key={i} cx={WAVE_XS[i]} cy={WAVE_YS[i]} r="6" fill="#fff" stroke={NAVY} strokeWidth="3" />
          ))}
        </svg>
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
          subtitle="An all-in-one tool for designing, tweaking, and generating custom haptics - then exporting production-ready code. Currently in development."
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
