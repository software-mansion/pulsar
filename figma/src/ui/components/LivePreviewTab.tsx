import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './LivePreviewTab.module.css';
import PhonePanel from './PhonePanel';
import { phoneStatusOf, type PhoneConnection } from '../hooks/usePhoneConnection';
import type { SyncStatus } from '../App';
import { isFileKeyValid } from '../lib/fileKey';
import iconCheck from '../assets/icon-check.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconPlay from '../assets/icon-play.svg';
import iconRefresh from '../assets/icon-refresh.svg';
import iconExternalLink from '../assets/icon-external-link.svg';
import { ONBOARDING_VIDEOS } from '../lib/onboardingMedia';
import { send } from '../figmaBridge';

// Server-sync status copy + dot colour for the footer pill (moved here from the
// Share tab) - reflects whether the shared preview's data matches the server.
const SYNC_META: Record<SyncStatus, { label: string; dot: string; pulse?: boolean }> = {
  idle: { label: 'Not shared yet', dot: 'var(--color-blue-20)' },
  syncing: { label: 'Syncing…', dot: 'var(--color-blue-50)', pulse: true },
  synced: { label: 'Synced with server', dot: '#1ea672' },
  unsynced: { label: 'Unsynced changes', dot: 'var(--color-yellow-60)' },
  error: { label: 'Sync failed - will retry', dot: '#d2392b' }
};

// Staged step-1 → step-2 hand-off timings, in ms from the moment step 1 is
// completed: pulse step 1, then collapse it, then fade step 2 in, then open it.
const HANDOFF_COLLAPSE_MS = 750;
const HANDOFF_UNLOCK_MS = 1050;
const HANDOFF_OPEN_MS = 1400;

// The "live preview" tab - a two-step setup configurator. Step 1 captures the real
// Figma file key (the embed needs it); step 2 pairs a phone so bound haptics
// play on the device. Step 2 stays locked until step 1 is valid. Deliberately
// separate from LivePreviewPanel, which is the "share" tab.

// A media slot for a short demo. Pass `src` (a remote clip) to play it muted +
// looping; until it has buffered enough to play we overlay a spinner + caption,
// and on a load error we fall back to the labelled placeholder.
function ConfiguratorMedia({ src, caption }: { src?: string; caption: string }) {
  // 'loading' until the clip can play, 'ready' once it can, 'error' if it fails.
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');
  const showVideo = !!src && status !== 'error';
  return (
    <div className={styles['configurator-media-wrap']}>
      <figure className={styles['configurator-media']}>
        {showVideo ? (
          <>
            <video
              className={styles['configurator-media-img']}
              src={src}
              aria-label={caption}
              // Buffer up front so both steps' clips are ready when the tab
              // opens - the collapsed step's video loads without waiting for its
              // accordion to be expanded.
              preload="auto"
              controls
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={() => setStatus('ready')}
              onError={() => setStatus('error')}
            />
            {status === 'loading' && (
              <div className={styles['configurator-media-loading']}>
                <span className={styles['configurator-media-spinner']} aria-hidden="true" />
                <span className={styles['configurator-media-caption']}>{caption}</span>
              </div>
            )}
          </>
        ) : (
          <div className={styles['configurator-media-ph']}>
            <img src={iconPlay} alt="" width={18} height={18} />
            <span className={styles['configurator-media-caption']}>{caption}</span>
            <span className={styles['configurator-media-tag']}>Demo</span>
          </div>
        )}
      </figure>
      {src && (
        <button
          type="button"
          className={styles['configurator-media-link']}
          onClick={() => send({ type: 'open-external', url: src })}
          title="Open this video full size in your browser"
        >
          <img src={iconExternalLink} alt="" width={11} height={11} />
          Open full size video
        </button>
      )}
    </div>
  );
}

// One numbered step card. `done` flips it to the green completed look (check in
// the disc); `locked` dims it and blocks interaction until it's the user's turn;
// `celebrate` plays a one-shot green pulse when the step is first completed.
// Collapsible: the header toggles the body via the controlled `open`/`onToggle`
// pair (locked steps can't be opened). The <details> stays natively open so its
// body stays mounted for the CSS open/close animation; `expanded` drives that
// animation, and the collapsed body is made `inert` so it's out of the tab order.
function ConfiguratorStep({
  index,
  title,
  blurb,
  done,
  locked,
  warn,
  celebrate,
  statusDot,
  open,
  onToggle,
  children
}: {
  index: number;
  title: string;
  blurb: string;
  done: boolean;
  locked: boolean;
  // Amber "needs attention" treatment (e.g. the phone link dropped).
  warn?: boolean;
  // One-shot green pulse the moment the step is completed.
  celebrate?: boolean;
  // Coloured status dot next to the title: green ok / amber problem / blue pending.
  statusDot?: 'connected' | 'warn' | 'pending';
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const expanded = open && !locked;
  const collapseRef = useRef<HTMLDivElement>(null);
  // The collapsed body stays in the DOM (clipped to 0 height) so open/close can
  // animate - mark it inert so its inputs/buttons stay out of the tab order and
  // the a11y tree while hidden.
  useEffect(() => {
    const el = collapseRef.current;
    if (el) el.inert = !expanded;
  }, [expanded]);
  return (
    <details
      className={`${styles['configurator-step']}${done ? ` ${styles['done']}` : ''}${
        warn ? ` ${styles['warn']}` : ''
      }${locked ? ` ${styles['locked']}` : ''}${celebrate ? ` ${styles['celebrate']}` : ''}${
        expanded ? ` ${styles['expanded']}` : ''
      }`}
      open
      aria-disabled={locked || undefined}
    >
      <summary
        className={styles['configurator-step-head']}
        aria-expanded={expanded}
        onClick={(e) => {
          // Controlled: drive open state from React, not the native toggle.
          e.preventDefault();
          if (!locked) onToggle();
        }}
      >
        <span className={styles['configurator-step-num']}>
          {done ? <img src={iconCheck} alt="Done" width={14} height={14} /> : index}
        </span>
        <div className={styles['configurator-step-heading']}>
          <div className={styles['configurator-step-title']}>
            {title}
            {statusDot && (
              <span className={`${styles['configurator-step-dot']} ${styles[statusDot]}`} aria-hidden="true" />
            )}
          </div>
          <p className={styles['configurator-step-blurb']}>{blurb}</p>
        </div>
        {!locked && (
          <span className={styles['configurator-step-chevron']} aria-hidden="true">
            <img src={iconChevron} alt="" width={16} height={16} />
          </span>
        )}
      </summary>
      <div className={styles['configurator-step-collapse']} ref={collapseRef}>
        <div className={styles['configurator-step-body']}>{children}</div>
      </div>
    </details>
  );
}

export default function LivePreviewTab({
  figmaFileKey,
  onFigmaFileKeyChange,
  phone,
  syncStatus,
  onSyncNow
}: {
  // The real Figma file key (or share URL) for the embed, remembered per-file.
  figmaFileKey: string;
  onFigmaFileKeyChange: (next: string) => void;
  // The shared phone-connection state/actions (owned by App so the link
  // persists across tabs). The configurator reads its `paired` flag and renders the
  // pairing panel from it.
  phone: PhoneConnection;
  // Server-sync status footer: whether the shared preview matches the current
  // design, plus a manual "sync now".
  syncStatus: SyncStatus;
  onSyncNow: () => void;
}) {
  const sync = SYNC_META[syncStatus];
  const step1Done = isFileKeyValid(figmaFileKey);
  // "Configured" = paired (token present); the live link may still be offline.
  const step2Done = phone.paired;
  const doneCount = (step1Done ? 1 : 0) + (step2Done ? 1 : 0);
  const allDone = doneCount === 2;
  // The step the user needs to act on now = the first incomplete one (0 = none
  // left, everything's done).
  const activeStep = !step1Done ? 1 : !step2Done ? 2 : 0;
  const typedKey = figmaFileKey.trim().length > 0;

  // Live phone-link status for the step-2 dot: green when reachable, blue while
  // pairing, amber when something's wrong (a pairing error, or a paired phone
  // that's gone offline). `phoneNotOk` drives the warning treatment + auto-open.
  const phoneStatus = phoneStatusOf(phone);
  const phoneNotOk = phoneStatus === 'warn';

  // Single-open accordion of steps: collapsed by default, with the active step
  // (the one awaiting action) auto-expanded to flag the current focus. Once a
  // step is done it collapses and the next opens; when all are done they all
  // collapse. A phone problem force-opens step 2 so the error is never hidden.
  // The user can still click any unlocked header to review a step.
  const [expandedStep, setExpandedStep] = useState(activeStep);
  // Staged step-1 → step-2 hand-off so an accepted file key is legible instead
  // of snapping straight to step 2: pulse step 1 green, then collapse it, then
  // fade step 2 in from its dimmed/locked look, then open it.
  const [celebrateStep1, setCelebrateStep1] = useState(false);
  const [holdStep2Dim, setHoldStep2Dim] = useState(false);
  // Synchronous guard so the normal "jump to the active step" effect below never
  // overrides the hand-off mid-flight (state updates aren't visible to the other
  // effect in the same commit; a ref is).
  const advancingRef = useRef(false);
  const prevStep1DoneRef = useRef(step1Done);

  useEffect(() => {
    const wasDone = prevStep1DoneRef.current;
    prevStep1DoneRef.current = step1Done;
    // Only run the sequence on a fresh step-1 completion (not on mount, and not
    // when step 2 is already done - nothing to hand off to).
    if (!(step1Done && !wasDone && !step2Done)) return;

    advancingRef.current = true;
    setCelebrateStep1(true);
    setHoldStep2Dim(true);
    setExpandedStep(1); // hold step 1 open while it pulses green
    const timers = [
      setTimeout(() => setExpandedStep(0), HANDOFF_COLLAPSE_MS), // collapse step 1
      setTimeout(() => setHoldStep2Dim(false), HANDOFF_UNLOCK_MS), // fade step 2 in
      setTimeout(() => {
        // open the now-revealed step 2
        setCelebrateStep1(false);
        advancingRef.current = false;
        setExpandedStep(2);
      }, HANDOFF_OPEN_MS)
    ];
    return () => {
      timers.forEach(clearTimeout);
      // Never get stuck mid-hand-off if step 1 is cleared or the tab unmounts.
      advancingRef.current = false;
      setCelebrateStep1(false);
      setHoldStep2Dim(false);
    };
  }, [step1Done, step2Done]);

  useEffect(() => {
    if (advancingRef.current) return;
    setExpandedStep(phoneNotOk ? 2 : activeStep);
  }, [activeStep, phoneNotOk]);
  const toggleStep = (step: number) => {
    if (advancingRef.current) return; // don't let a click interrupt the hand-off
    setExpandedStep((cur) => (cur === step ? 0 : step));
  };

  return (
    <div className={`col scroll ${styles['live-panel']}`}>
      <div>
        <div className="panel-title">Live preview</div>
        <p className={`muted ${styles['live-intro']}`}>
          Two quick steps to feel your bound haptics on a real device while you
          preview this design.
        </p>
      </div>

      {/* Progress bar + step counter - orientation and a sense of "almost there". */}
      <div className={styles['configurator-progress']} role="progressbar" aria-valuemin={0} aria-valuemax={2} aria-valuenow={doneCount}>
        <div className={styles['configurator-progress-track']}>
          <div className={styles['configurator-progress-fill']} style={{ width: `${(doneCount / 2) * 100}%` }} />
        </div>
        <span className={`${styles['configurator-progress-label']}${allDone ? ` ${styles['complete']}` : ''}`}>
          {allDone ? 'All set' : `Step ${activeStep} of 2`}
        </span>
      </div>

      <ConfiguratorStep
        index={1}
        title="Paste your Figma file key"
        blurb="Pulsar can’t read this on its own - paste the file’s link once and it’s saved here."
        done={step1Done}
        locked={false}
        celebrate={celebrateStep1}
        open={expandedStep === 1}
        onToggle={() => toggleStep(1)}
      >
        <ConfiguratorMedia src={ONBOARDING_VIDEOS.link} caption="Where to copy this file’s link" />
        <p className={styles['configurator-text']}>
          In Figma’s top bar, open <b>Share → Copy link</b>, then paste it below.
          A full link or the raw key both work.
        </p>
        <div className={styles['live-filekey']}>
          <input
            id="figma-file-key"
            type="text"
            placeholder="Paste this file’s link or key"
            value={figmaFileKey}
            onChange={(e) => onFigmaFileKeyChange(e.target.value)}
          />
          {step1Done ? (
            <p className={`${styles['configurator-feedback']} ${styles['ok']}`}>
              Looks good - saved with this file.
            </p>
          ) : typedKey ? (
            <p className={`${styles['configurator-feedback']} ${styles['warn']}`}>
              That doesn’t look like a Figma link or key yet.
            </p>
          ) : (
            <p className={`muted ${styles['live-filekey-hint']}`}>
              From Figma use <b>Share → Copy link</b>.
            </p>
          )}
        </div>
      </ConfiguratorStep>

      <ConfiguratorStep
        index={2}
        title="Pair your phone"
        blurb="Scan the QR with the Pulsar app to open this design on your device."
        // While there's a live problem, drop the green "done" look in favour of
        // the amber warning treatment so the issue stands out.
        done={step2Done && !phoneNotOk}
        warn={phoneNotOk}
        statusDot={step1Done && !holdStep2Dim ? phoneStatus : undefined}
        // Stay dimmed/locked-looking through the hand-off, then fade in.
        locked={!step1Done || holdStep2Dim}
        open={expandedStep === 2}
        onToggle={() => toggleStep(2)}
      >
        <ConfiguratorMedia src={ONBOARDING_VIDEOS.livePreview} caption="Scan the QR with the Pulsar app" />
        <p className={styles['configurator-text']}>
          Scanning opens your live preview in the Pulsar app - tap any bound
          element and feel its haptics on your device in real time, as you edit.
        </p>
        {/* Shown only once step 1 is valid; the connection itself lives in
            App (usePhoneConnection) so it survives leaving the tab. */}
        {step1Done ? (
          <PhonePanel
            paired={phone.paired}
            connected={phone.connected}
            phase={phone.phase}
            code={phone.code}
            qrDataUrl={phone.qrDataUrl}
            error={phone.error}
            onRefresh={phone.refresh}
            onDisconnect={phone.disconnect}
          />
        ) : (
          <p className={`muted ${styles['configurator-text']}`}>Finish step 1 to unlock pairing.</p>
        )}
      </ConfiguratorStep>

      {/* Server-sync status footer (moved from the Share tab) - whether the
          shared preview matches the current design, plus a manual sync. */}
      <div className={styles['sync-row']}>
        <span className={styles['sync-pill']} title="Whether the shared preview matches your current design">
          <span
            className={`${styles['sync-dot']}${sync.pulse ? ` ${styles['pulse']}` : ''}`}
            style={{ background: sync.dot }}
          />
          <span>{sync.label}</span>
        </span>
        <button
          className={`ghost icon ${styles['sync-now']}`}
          onClick={onSyncNow}
          disabled={syncStatus === 'syncing'}
          title="Push the current design to the server now"
          aria-label="Sync now"
        >
          <img
            src={iconRefresh}
            alt=""
            width={16}
            height={16}
            className={syncStatus === 'syncing' ? styles['sync-spin'] : undefined}
          />
        </button>
      </div>
    </div>
  );
}
