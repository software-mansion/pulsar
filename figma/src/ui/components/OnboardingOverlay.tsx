import styles from './OnboardingOverlay.module.css';
import { useEffect, useRef, useState } from 'react';
import { ONBOARDING_STEPS, WELCOME, OUTRO, type OnboardingStep } from './onboardingContent';
import PulsarLogo from './PulsarLogo';
import iconClose from '../assets/icon-close.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconPlay from '../assets/icon-play.svg';
import iconExternalLink from '../assets/icon-external-link.svg';
import { send } from '../figmaBridge';

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

// One step's demo clip within the persistent media stack. Every step's clip is
// mounted for the tour's lifetime so it buffers exactly once (no re-load each
// time you page to it); only the `active` one is shown and playing. Shows a
// spinner + caption until it can play, and a labelled placeholder if it has no
// clip / fails to load.
function StackVideo({ video, caption, active }: { video?: string; caption: string; active: boolean }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(video ? 'loading' : 'error');
  const ref = useRef<HTMLVideoElement>(null);
  // Only the active clip plays; the rest stay paused but buffered so switching to
  // them is instant. (Explicit play/pause instead of the autoPlay attribute so a
  // clip that becomes active after it loaded still starts.)
  useEffect(() => {
    const v = ref.current;
    if (!v || status !== 'ready') return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, status]);
  const showVideo = !!video && status !== 'error';
  return (
    <div className={`${styles['stack-item']}${active ? ` ${styles['active']}` : ''}`} aria-hidden={!active}>
      {showVideo ? (
        <>
          <video
            ref={ref}
            className={styles['stack-video']}
            src={video}
            aria-label={caption}
            preload="auto"
            controls={active}
            loop
            muted
            playsInline
            onCanPlay={() => setStatus('ready')}
            onError={() => setStatus('error')}
          />
          {status === 'loading' && (
            <div className={styles['stack-loading']}>
              <span className={styles['stack-spinner']} aria-hidden="true" />
              <span>{caption}</span>
            </div>
          )}
        </>
      ) : (
        <div className={styles['stack-placeholder']} aria-hidden="true">
          <img src={iconPlay} alt="" width={20} height={20} />
          <span>{caption}</span>
          <span className={styles['gif-tag']}>GIF coming soon</span>
        </div>
      )}
    </div>
  );
}

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

        {/* Persistent media stack: kept OUTSIDE the keyed screen below so the
            video elements survive navigation - each clip buffers once and is
            instant on later steps. Collapsed on welcome / finish (no clip). */}
        <div
          className={`${styles['media-col']}${
            screen.kind === 'feature' ? '' : ` ${styles['media-hidden']}`
          }`}
        >
          <div className={styles['media-stack']}>
            {ONBOARDING_STEPS.map((step) => (
              <StackVideo
                key={step.id}
                video={step.video}
                caption={step.gifPlaceholder}
                active={screen.kind === 'feature' && screen.id === step.id}
              />
            ))}
          </div>
          {screen.kind === 'feature' && screen.video && (
            <button
              type="button"
              className={styles['media-link']}
              onClick={() => send({ type: 'open-external', url: screen.video! })}
              title="Open this video full size in your browser"
            >
              <img src={iconExternalLink} alt="" width={11} height={11} />
              Open full size video
            </button>
          )}
        </div>

        {/* Keyed on `index` so the wrapper remounts each navigation, replaying
            the slide-in keyframe from the side matching the paging direction.
            Holds only the copy now (the media stack above is persistent). */}
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
            <div className={styles['body']}>
              <h2 className={styles['title']}>{screen.title}</h2>
              <p className={styles['text']}>{screen.body}</p>
            </div>
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
