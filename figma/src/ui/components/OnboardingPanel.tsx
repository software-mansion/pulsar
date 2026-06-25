import styles from './OnboardingPanel.module.css';
import { send } from '../figmaBridge';
import {
  FAQ,
  FIGMA_DESIGN_URL,
  EXAMPLE_APP_URL,
  SUPPORT_EMAIL
} from './onboardingContent';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconExternal from '../assets/icon-external-link.svg';
import iconPlay from '../assets/icon-play.svg';

// Help tab. A self-serve reference: a "take the tour" button that relaunches the
// first-run onboarding, a Q&A accordion (which restates the tour plus the
// follow-up questions), resource links, and a contact address. The FAQ copy is
// shared with the tour via onboardingContent so they stay in sync.
export default function OnboardingPanel({ onStartOnboarding }: { onStartOnboarding: () => void }) {
  const openExternal = (url: string) => send({ type: 'open-external', url });

  return (
    <div className={`col scroll ${styles['help-panel']}`}>
      <div>
        <div className="panel-title">Help &amp; how-to</div>
        <p className={`muted ${styles['help-intro']}`}>
          Everything you need to design haptics in Figma. Replay the guided tour or
          browse the questions below.
        </p>
      </div>

      <button className={`primary ${styles['tour-btn']}`} onClick={onStartOnboarding}>
        <img src={iconPlay} alt="" width={15} height={15} />
        Take the tour
      </button>

      {/* Q&A - one bordered card, accordion rows separated by hairlines, reusing
          the shared accordion building blocks from common.css. */}
      <div className={styles['section']}>
        <div className="acc-label">Frequently asked</div>
        <div className={styles['faq-card']}>
          {FAQ.map((entry) => (
            <details key={entry.id} className="accordion acc-row">
              <summary className="acc-head">
                <span className="acc-title">{entry.question}</span>
                <span className="acc-chevron" aria-hidden="true">
                  <img src={iconChevron} alt="" />
                </span>
              </summary>
              <div className="acc-body">
                <p className={styles['faq-answer']}>{entry.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Resources - the example Figma file and the live-preview example app. */}
      <div className={styles['section']}>
        <div className="acc-label">Resources</div>
        <div className={styles['link-list']}>
          <button className={`ghost ${styles['link-btn']}`} onClick={() => openExternal(FIGMA_DESIGN_URL)}>
            <span className={styles['link-text']}>
              <span className={styles['link-title']}>Example Figma file</span>
              <span className={styles['link-sub']}>A sample design with onboarding instructions</span>
            </span>
            <img src={iconExternal} alt="" width={15} height={15} />
          </button>
          <button className={`ghost ${styles['link-btn']}`} onClick={() => openExternal(EXAMPLE_APP_URL)}>
            <span className={styles['link-text']}>
              <span className={styles['link-title']}>Example app</span>
              <span className={styles['link-sub']}>Try the live preview in your browser</span>
            </span>
            <img src={iconExternal} alt="" width={15} height={15} />
          </button>
        </div>
      </div>

      {/* Contact - email is enough for the cases the FAQ doesn't cover. */}
      <div className={styles['section']}>
        <div className="acc-label">Still stuck?</div>
        <p className={`muted ${styles['contact-text']}`}>
          Reach the Pulsar team at{' '}
          <button
            className={styles['contact-link']}
            onClick={() => openExternal(`mailto:${SUPPORT_EMAIL}`)}
          >
            {SUPPORT_EMAIL}
          </button>
          .
        </p>
      </div>
    </div>
  );
}
