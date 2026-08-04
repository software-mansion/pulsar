import { useEffect, useRef, useState, type ReactElement } from 'react';
import styles from './StudioFeatures.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';

// ── Inline, animatable icons ────────────────────────────────────────────────
// Same navy line-art as the Figma icons, inlined so their parts can be animated.
// Every icon animates continuously — there is no hover/spotlight gating. Because
// nothing ever starts or stops, there are no add/remove snap points; the only
// smoothness requirement is a seamless loop wrap, so each CSS animation either
// has 0% == 100% or ping-pongs with `alternate`.
//
// The Design line reshapes together with its nodes, which CSS can't express in a
// cross-browser way (animating a path's `d` isn't supported in Firefox), so it
// keeps the JS requestAnimationFrame approach — just running in a permanent loop.

const NAVY = '#001A72';
const STROKE = 3;

const DESIGN_XS = [12, 38, 60, 84, 108];
const DESIGN_BASE_Y = [84, 50, 76, 40, 68];
const DESIGN_NODES = [1, 2, 3]; // middle points get a marker + bob

function DesignIcon(): ReactElement {
  const [ys, setYs] = useState(DESIGN_BASE_Y);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setYs(DESIGN_BASE_Y);
      return;
    }
    let start: number | null = null;
    const loop = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      // Endpoints stay pinned; the three middle nodes bob on staggered sine waves
      // and the polyline is rebuilt from the same values, so the line follows.
      setYs(
        DESIGN_BASE_Y.map((base, i) =>
          i === 0 || i === DESIGN_BASE_Y.length - 1 ? base : base + Math.sin(elapsed * 2.2 + i * 1.1) * 9,
        ),
      );
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const points = DESIGN_XS.map((x, i) => `${x},${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke={NAVY}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {DESIGN_NODES.map((i) => (
        <circle key={i} cx={DESIGN_XS[i]} cy={ys[i]} r="6.5" fill="#fff" stroke={NAVY} strokeWidth={STROKE} />
      ))}
    </svg>
  );
}

function TweakIcon(): ReactElement {
  const thumbs = [
    [78, 32],
    [40, 60],
    [86, 88],
  ];
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      {[32, 60, 88].map((y) => (
        <line key={y} x1="14" y1={y} x2="106" y2={y} stroke={NAVY} strokeWidth={STROKE} strokeLinecap="round" />
      ))}
      {thumbs.map(([x, y], i) => (
        <rect
          key={i}
          className={styles.tweakThumb}
          x={x - 6.5}
          y={y - 15}
          width="13"
          height="30"
          rx="6"
          fill="#fff"
          stroke={NAVY}
          strokeWidth={STROKE}
          style={{ animationDelay: `${-i * 0.5}s` }}
        />
      ))}
    </svg>
  );
}

// Varied resting heights so the waveform reads like a waveform even when still.
const GEN_BARS = [
  { x: 84, h: 24 },
  { x: 92, h: 46 },
  { x: 100, h: 30 },
  { x: 108, h: 40 },
];

function GenerateIcon(): ReactElement {
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      <path
        d="M30 30 Q30 27 33 27 L58 27 L74 43 L74 90 Q74 93 71 93 L33 93 Q30 93 30 90 Z"
        fill="#fff"
        stroke={NAVY}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path d="M57 27 L57 44 L74 44" stroke={NAVY} strokeWidth={STROKE} strokeLinejoin="round" />
      {GEN_BARS.map(({ x, h }, i) => (
        <rect
          key={x}
          className={styles.genBar}
          x={x - 2.5}
          y={60 - h / 2}
          width={STROKE}
          height={h}
          rx="2.5"
          fill={NAVY}
          style={{ animationDelay: `${-i * 0.15}s` }}
        />
      ))}
    </svg>
  );
}

function CreateIcon(): ReactElement {
  const circles = [
    [42, 0.35],
    [60, 0.6],
    [78, 1],
  ];
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      {circles.map(([cx, op], i) => (
        <circle
          key={i}
          className={styles.createCircle}
          cx={cx}
          cy="60"
          r="30"
          stroke={NAVY}
          strokeWidth={STROKE}
          strokeOpacity={op}
        />
      ))}
    </svg>
  );
}

// The real Figma logo paths (from the Figma export), so it doesn't look off.
const FIGMA_LOGO = [
  'M42.4784 62.7175C42.4784 57.3497 44.6107 52.2018 48.4063 48.4062C52.2019 44.6106 57.3498 42.4783 62.7176 42.4783C68.0853 42.4783 73.2332 44.6106 77.0288 48.4062C80.8244 52.2018 82.9567 57.3497 82.9567 62.7175C82.9567 68.0852 80.8244 73.2332 77.0288 77.0287C73.2332 80.8243 68.0853 82.9567 62.7176 82.9567C57.3498 82.9567 52.2019 80.8243 48.4063 77.0287C44.6107 73.2332 42.4784 68.0852 42.4784 62.7175Z',
  'M2 103.196C2 97.8282 4.13234 92.6803 7.92792 88.8847C11.7235 85.0891 16.8714 82.9567 22.2392 82.9567H42.4784V103.196C42.4784 108.564 40.346 113.712 36.5505 117.507C32.7549 121.303 27.607 123.435 22.2392 123.435C16.8714 123.435 11.7235 121.303 7.92792 117.507C4.13234 113.712 2 108.564 2 103.196Z',
  'M42.4784 2V42.4784H62.7176C68.0853 42.4784 73.2332 40.346 77.0288 36.5505C80.8244 32.7549 82.9567 27.607 82.9567 22.2392C82.9567 16.8714 80.8244 11.7235 77.0288 7.92792C73.2332 4.13234 68.0853 2 62.7176 2L42.4784 2Z',
  'M2.0001 22.2392C2.0001 27.607 4.13244 32.7549 7.92802 36.5505C11.7236 40.346 16.8715 42.4784 22.2393 42.4784H42.4785V2H22.2393C16.8715 2 11.7236 4.13234 7.92802 7.92792C4.13244 11.7235 2.0001 16.8714 2.0001 22.2392Z',
  'M2 62.7175C2 68.0852 4.13234 73.2332 7.92792 77.0287C11.7235 80.8243 16.8714 82.9567 22.2392 82.9567H42.4784V42.4783H22.2392C16.8714 42.4783 11.7235 44.6106 7.92792 48.4062C4.13234 52.2018 2 57.3497 2 62.7175Z',
];

function PreviewIcon(): ReactElement {
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      {/* Phone frame — fades / scales in around the shrinking logo. */}
      <g className={styles.previewPhone}>
        <rect x="34" y="12" width="52" height="96" rx="12" fill="#fff" stroke={NAVY} strokeWidth={STROKE} />
        <rect x="52" y="19" width="16" height="4" rx="2" fill={NAVY} />
      </g>
      {/* Figma logo (real paths), scaled to fit. Inner group carries the shrink. */}
      <g transform="translate(28.85 14) scale(0.733)">
        <g className={styles.previewLogo} stroke={NAVY} strokeWidth="4" fill="none">
          {FIGMA_LOGO.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}

function ExportIcon(): ReactElement {
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} fill="none" aria-hidden="true">
      <path
        d="M28 74 L28 96 Q28 100 32 100 L88 100 Q92 100 92 96 L92 74"
        stroke={NAVY}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g
        className={styles.exportArrow}
        stroke={NAVY}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="60" y1="20" x2="60" y2="72" />
        <path d="M42 55 L60 74 L78 55" />
      </g>
    </svg>
  );
}

interface Feature {
  lead: string;
  rest: string;
  Icon: () => ReactElement;
}

const features: Feature[] = [
  { lead: 'Design', rest: ' custom haptic patterns from scratch', Icon: DesignIcon },
  { lead: 'Tweak', rest: ' existing presets so they match your project', Icon: TweakIcon },
  { lead: 'Generate', rest: ' haptics from audio', Icon: GenerateIcon },
  { lead: 'Create', rest: ' haptics that match your Lottie animations', Icon: CreateIcon },
  {
    lead: 'Preview',
    rest: ' everything in Figma or on a real device, using our companion app',
    Icon: PreviewIcon,
  },
  { lead: 'Export', rest: ' the generated code and hand it off to your developers', Icon: ExportIcon },
];

export function StudioFeatures() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <h2 className={styles.heading}>Bring tailor-made haptics into your product</h2>

        <div className={styles.grid}>
          {features.map((f) => {
            const Icon = f.Icon;
            return (
              <div key={f.lead} className={styles.card}>
                <p className={styles.text}>
                  <strong>{f.lead}</strong>
                  {f.rest}
                </p>
                <div className={styles.art}>
                  <Icon />
                </div>
              </div>
            );
          })}
        </div>
      </BasicLayout>
    </section>
  );
}
