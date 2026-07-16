import styles from './CustomPresetsPanel.module.css';
import iconWaveform from '../assets/icon-audio-waveform.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconExternalLink from '../assets/icon-external-link.svg';
import { STUDIO_URL } from './onboardingContent';
import { send } from '../figmaBridge';

// Stands in for the removed paste-your-own-JSON editor: authoring custom
// patterns now belongs to Pulsar Studio, which isn't out yet. Keeps the
// accordion row so the answer to "can I add my own?" is where people look for
// it, and points at the docs page hosting the early-access form.
export default function CustomPresetsPanel() {
  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconWaveform} alt="" />
        </span>
        <span className="acc-title">Custom presets</span>
        <span className="tag tag-flush">Soon</span>
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body">
        <p className={styles['studio-text']}>
          <b>Pulsar Studio</b> is a visual editor for designing your own haptic
          patterns - draw a waveform, feel it on a real device, and export it
          straight to your project.
        </p>
        <p className={`muted ${styles['studio-text']}`}>
          It’s still in development. Join the early-access list and we’ll let you
          know when it opens.
        </p>
        <div className="row">
          <button
            className={`primary ${styles['studio-btn']}`}
            onClick={() => send({ type: 'open-external', url: STUDIO_URL })}
            title="Open the Pulsar Studio docs page, where the sign-up form lives"
          >
            <img src={iconExternalLink} alt="" width={13} height={13} />
            <span>Join the waiting list</span>
          </button>
        </div>
      </div>
    </details>
  );
}
