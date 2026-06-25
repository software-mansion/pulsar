import styles from './OnboardingOverlay.module.css';
import { useEffect, useState } from 'react';
import { ONBOARDING_STEPS, WELCOME, OUTRO, type OnboardingStep } from './onboardingContent';
import PulsarLogo from './PulsarLogo';
import iconClose from '../assets/icon-close.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconPlay from '../assets/icon-play.svg';

// The tour leads with a welcome screen (brand mark + greeting), runs the feature
// steps, and ends on a send-off. The welcome / finish screens share a brand
// layout, so screens are a small union rather than a plain step list.
type Screen =
  | { kind: 'welcome' }
  | { kind: 'finish' }
  | ({ kind: 'feature' } & OnboardingStep);

const SCREENS: Screen[] = [
  { kind: 'welcome' },
  ...ONBOARDING_STEPS.map((s) => ({ kind: 'feature' as const, ...s })),
  { kind: 'finish' }
];

// First-run onboarding tour. A full-window overlay that walks through the three
// core flows (bind a preset → live preview → share) one screen at a time. It is
// always cancellable (Skip / Esc / the X), and the Help tab can relaunch it.
//
// Onboarding design notes: one idea per screen, a clear progress indicator
// (the dots), an always-visible escape hatch, and a single primary action so
// the path forward is obvious. Content is shared with the Help-tab FAQ via
// onboardingContent so the two never drift.
export default function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  // Paging direction (+1 forward, -1 back) so the screen slides in from the
  // matching side. Drives the slide-next / slide-prev animation class.
  const [dir, setDir] = useState(1);
  const screens = SCREENS;
  const screen = screens[index];
  const isFirst = index === 0;
  const isLast = index === screens.length - 1;

  // Single entry point for every navigation (buttons, dots, arrow keys) so the
  // slide direction is always set before the index changes.
  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(target, screens.length - 1));
    if (clamped === index) return;
    setDir(clamped > index ? 1 : -1);
    setIndex(clamped);
  };

  const next = () => (isLast ? onClose() : goTo(index + 1));
  const back = () => goTo(index - 1);

  // Esc skips; arrow keys page through the tour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // `next`/`back` close over `index`; re-bind so the handler always pages
    // from the current step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className={styles['overlay']} role="dialog" aria-modal="true" aria-label="Welcome to Pulsar">
      <div className={styles['card']}>
        <header className={styles['head']}>
          {/* The welcome screen is a greeting, not a numbered step. */}
          {screen.kind === 'feature' && (
            <span className={styles['step-count']}>
              Step {index} of {ONBOARDING_STEPS.length}
            </span>
          )}
          <button
            className={`ghost ${styles['skip']}`}
            onClick={onClose}
            title="Skip the tour (Esc)"
            aria-label="Skip the tour"
          >
            Skip
            <img src={iconClose} alt="" width={12} height={12} />
          </button>
        </header>

        {/* Keyed on `index` so the wrapper remounts each navigation, replaying
            the slide-in keyframe from the side matching the paging direction. */}
        <div
          key={index}
          className={`${styles['screen']} ${dir >= 0 ? styles['slide-next'] : styles['slide-prev']}`}
        >
          {screen.kind === 'welcome' || screen.kind === 'finish' ? (
            <div className={styles['welcome']}>
              <PulsarLogo size={72} />
              <h2 className={styles['title']}>
                {screen.kind === 'welcome' ? WELCOME.title : OUTRO.title}
              </h2>
              <p className={styles['text']}>
                {screen.kind === 'welcome' ? WELCOME.body : OUTRO.body}
              </p>
            </div>
          ) : (
            <>
              <div className={styles['media']}>
                {screen.gif ? (
                  <img className={styles['gif']} src={screen.gif} alt={screen.gifPlaceholder} />
                ) : (
                  <div className={styles['gif-placeholder']} aria-hidden="true">
                    <img src={iconPlay} alt="" width={20} height={20} />
                    <span>{screen.gifPlaceholder}</span>
                    <span className={styles['gif-tag']}>GIF coming soon</span>
                  </div>
                )}
              </div>

              <div className={styles['body']}>
                <h2 className={styles['title']}>{screen.title}</h2>
                <p className={styles['text']}>{screen.body}</p>
              </div>
            </>
          )}
        </div>

        <div className={styles['dots']} role="tablist" aria-label="Tour progress">
          {screens.map((s, i) => (
            <button
              key={s.kind === 'feature' ? s.id : s.kind}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={
                s.kind === 'welcome'
                  ? WELCOME.title
                  : s.kind === 'finish'
                    ? OUTRO.title
                    : s.title
              }
              className={`${styles['dot']} ${i === index ? styles['dot-active'] : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <footer className={styles['foot']}>
          <button className="ghost" onClick={back} disabled={isFirst}>
            <img className={styles['arrow-left']} src={iconChevron} alt="" width={14} height={14} />
            Back
          </button>
          <button className="primary" onClick={next}>
            {isLast ? 'Get started' : screen.kind === 'welcome' ? 'Start tour' : 'Next'}
            {!isLast && (
              <img className={styles['arrow-right']} src={iconChevron} alt="" width={14} height={14} />
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
