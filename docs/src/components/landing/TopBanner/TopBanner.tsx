import styles from './TopBanner.module.scss';

import { BASE_PATH } from '../../../../config';
import swmLogo from '../../../assets/swm-logo.svg';
import starIcon from '../../../assets/landing-page/star.svg';
import angelIcon from '../../../assets/landing-page/angel.svg';
import warningIcon from '../../../assets/landing-page/warning.svg';
import arrowIcon from '../../../assets/landing-page/arrow.svg';
import { Button } from '../Button/Button';
import { EmojiButton } from '../EmojiButton/EmojiButton';
import { SoundBar } from '../SoundBar/SoundBar';
import { useState } from 'react';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function TopBanner() {
  const [colorClass, setColorClass] = useState('');
  const [showStars, setShowStars] = useState(false);
  const [showAngels, setShowAngels] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [confettiInstances, setConfettiInstances] = useState<number[]>([]);
  const [backgroundAnimation, setBackgroundAnimation] = useState(styles.wave);
  const [showDecorativeIcons, setShowDecorativeIcons] = useState(true);

  function handleAnimationEffect(
    effect: '' | 'stars' | 'angels' | 'confetti',
    enable: boolean = true,
  ) {
    if (effect === '') {
      setShowStars(false);
      setShowAngels(false);
      setConfettiInstances([]);
      setShowClouds(true);
    } else if (effect === 'stars') {
      setShowAngels(false);
      setConfettiInstances([]);
      setShowClouds(false);
      setShowStars(enable);
    } else if (effect === 'angels') {
      setShowStars(false);
      setConfettiInstances([]);
      setShowClouds(false);
      setShowAngels(enable);
    } else if (effect === 'confetti') {
      setShowStars(false);
      setShowAngels(false);
      setShowClouds(false);
      setConfettiInstances((prev) => [...prev, Date.now()]);
    }
    setShowDecorativeIcons(false);
  }

  const removeConfettiInstance = (id: number) => {
    setConfettiInstances((prev) => prev.filter((confetti) => confetti !== id));
  };

  return (
    <div className={`${styles.banner} ${colorClass}`}>
      <div className={styles.leftBar}>
        <div className={styles.authors}>
          <span>Created by</span>
          <img src={swmLogo.src} />
        </div>

        <div className={styles.header}>
          <div className={styles.title}>Rich and ready-to-use haptics library</div>
          <div className={styles.subtitle}>
            Presets that you can hear and feel with Live Preview.
          </div>
        </div>

        <div className={styles.buttonHolder}>
          <Button
            label="Preset playground"
            url={`${BASE_PATH}/presets-playground`}
            className={styles.fullWidth}
            onClick={() => window.posthog?.capture('preset_playground_cta_clicked')}
          />
          <Button
            label="Read the docs"
            variant="filled"
            url={`${BASE_PATH}/getting-started`}
            className={styles.fullWidth}
            onClick={() => window.posthog?.capture('docs_cta_clicked')}
          />
        </div>
      </div>

      <div className={styles.rightBar}>
        <div className={styles.phoneBackground}>
          {showClouds && <CloudEffect />}

          {showStars && <StarsEffect onComplete={() => handleAnimationEffect('stars', false)} />}

          {showAngels && <AngelEffect />}

          {confettiInstances.map((id) => (
            <ConfettiEffect key={id} onComplete={() => removeConfettiInstance(id)} />
          ))}

          {showDecorativeIcons && (
            <div className={styles.decorativeIcons}>
              <img className={styles.arrowIcon} src={arrowIcon.src} />
              <img className={styles.starIcon} src={starIcon.src} />
            </div>
          )}

          <div className={styles.phone}>
            <div className={styles.notch}></div>
            <div className={styles.buttonHolder}>
              <div className={styles.row}>
                <EmojiButton
                  emoji="emoji1"
                  onClick={() => {
                    setColorClass('');
                    setBackgroundAnimation(styles.wave);
                    handleAnimationEffect('');
                    window.posthog?.capture('haptics_demo_interacted', {
                      emoji: 'emoji1',
                      effect: 'wave',
                    });
                  }}
                />
                <EmojiButton
                  emoji="emoji2"
                  onClick={() => {
                    setColorClass(styles.yellow);
                    setBackgroundAnimation(styles.sonar);
                    handleAnimationEffect('stars');
                    window.posthog?.capture('haptics_demo_interacted', {
                      emoji: 'emoji2',
                      effect: 'stars',
                    });
                  }}
                />
              </div>

              <div className={styles.row}>
                <EmojiButton
                  emoji="emoji3"
                  onClick={() => {
                    setColorClass(styles.red);
                    setBackgroundAnimation(styles.quake);
                    handleAnimationEffect('confetti');
                    window.posthog?.capture('haptics_demo_interacted', {
                      emoji: 'emoji3',
                      effect: 'confetti',
                    });
                  }}
                />
                <EmojiButton
                  emoji="emoji4"
                  onClick={() => {
                    setColorClass(styles.green);
                    setBackgroundAnimation(styles.heartbeat);
                    handleAnimationEffect('angels');
                    window.posthog?.capture('haptics_demo_interacted', {
                      emoji: 'emoji4',
                      effect: 'angels',
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <svg
          className={`${styles.svgWave} ${colorClass} ${backgroundAnimation}`}
          width="1000"
          height="1000"
          viewBox="0 0 1200 1200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            opacity="0.1"
            cx="600"
            cy="600"
            r="500"
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
          <circle
            opacity="0.1"
            cx="600"
            cy="600"
            r="400"
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
          <circle
            opacity="0.1"
            cx="600"
            cy="600"
            r="300"
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
          <circle
            opacity="0.1"
            cx="600"
            cy="600"
            r="200"
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
          <circle
            opacity="0.1"
            cx="600"
            cy="600"
            r="100"
            fill="#87CCE8"
            stroke="#2B85AB"
            strokeMiterlimit="16"
            strokeDasharray="8 8"
          />
        </svg>
      </div>

      <SoundBar />
    </div>
  );
}

function StarsEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className={styles.starContainer}>
      <img src={starIcon.src} />
      <img src={starIcon.src} />
      <img src={starIcon.src} />
      <img src={starIcon.src} onAnimationEnd={onComplete} />
    </div>
  );
}

function ConfettiEffect({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className={styles.confettiContainer}>
      <img src={warningIcon.src} />
      <img src={warningIcon.src} />
      <img src={warningIcon.src} />
      <img src={warningIcon.src} />
      <img src={warningIcon.src} onAnimationEnd={onComplete} />
      <img src={warningIcon.src} />
      <img src={warningIcon.src} />
      <img src={warningIcon.src} />
    </div>
  );
}

function CloudSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.63)} viewBox="-2 -2 104 65" fill="none">
      <path
        d="M83,61
           c9.4,0 17,-7.6 17,-17
             0,-9.4 -7.6,-17 -17,-17
             -0.2,0 -0.1,0 -0.2,0
             -1.7,-15.3 -14.7,-27.2 -30.5,-27.2
             -12.5,0 -23.2,7.4 -28,18.1
             -0.9,-0.1 -1.8,-0.2 -2.7,-0.2
             -12,0 -21.7,9.7 -21.7,21.7
             0,12 9.7,21.7 21.7,21.7
           h61.4z"
        fill="white"
        stroke="#38acdd"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudEffect() {
  return (
    <div className={styles.cloudContainer}>
      <div><CloudSvg size={90} /></div>
      <div><CloudSvg size={55} /></div>
      <div><CloudSvg size={72} /></div>
      <div><CloudSvg size={48} /></div>
    </div>
  );
}

function AngelEffect() {
  return (
    <div className={styles.angelContainer}>
      <div><img src={angelIcon.src} /></div>
      <div><img src={angelIcon.src} /></div>
      <div><img src={angelIcon.src} /></div>
      <div><img src={angelIcon.src} /></div>
    </div>
  );
}
