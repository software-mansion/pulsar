import { useRef, useState } from 'react';
import { Presets } from 'pulsar-haptics';
import styles from './FigmaHero.module.scss';
import { Button } from '../../landing/Button/Button';
import { EmojiButton } from '../../landing/EmojiButton/EmojiButton';
import { FIGMA_COMMUNITY_URL } from '../figmaLinks';
import { track, trackingAttributes } from '../../../analytics/analytics';

import swmLogo from '../../../assets/swm-logo.svg';
import star from '../../../assets/landing-page/star.svg';
import pluginWindow from '../../../content/docs/assets/figma-plugin/presets-filters.png';

interface Mood {
  emoji: string;
  playHaptic: () => void;
  background: string;
}

const moods: Mood[] = [
  { emoji: 'emoji1', playHaptic: () => Presets.sway(), background: '' },
  { emoji: 'emoji2', playHaptic: () => Presets.trill(), background: styles.yellow },
  { emoji: 'emoji3', playHaptic: () => Presets.smash(), background: styles.red },
  { emoji: 'emoji4', playHaptic: () => Presets.heartbeat(), background: styles.green },
];

const forceReflow = (element: HTMLElement) => void element.offsetWidth;

function restartAnimation(element: HTMLElement | null, animationClass: string) {
  if (!element) return;
  element.classList.remove(animationClass);
  forceReflow(element);
  element.classList.add(animationClass);
}

export function FigmaHero() {
  const [background, setBackground] = useState('');
  const pluginWindowRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  const playMood = (mood: Mood) => {
    mood.playHaptic();
    setBackground(mood.background);
    restartAnimation(pluginWindowRef.current, styles.shake);
    restartAnimation(haloRef.current, styles.haloPulse);
    track('figma_landing_haptic_played', { emoji: mood.emoji });
  };

  return (
    <section className={`${styles.hero} ${background}`}>
      <div ref={haloRef} className={styles.halo} aria-hidden="true" />
      <img
        className={`${styles.star} ${styles.starBig}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${styles.star} ${styles.starSmall}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.createdBy}>
            <span>Created by</span>
            <img src={swmLogo.src} alt="Software Mansion" />
          </div>

          <h1 className={styles.title}>Design your haptics right where you design your UI</h1>

          <p className={styles.subtitle}>
            Pulsar brings haptics into Figma: the plugin lets you bind a preset to any design
            element, hear it as you edit, feel it on a real phone, and iterate on the spot.
          </p>

          <div className={styles.ctaRow}>
            <Button
              label="Install from Figma Community"
              url={FIGMA_COMMUNITY_URL}
              analytics={trackingAttributes('figma_landing_cta_clicked', { location: 'hero' })}
            />
            <Button
              label="See how it works"
              variant="filled"
              url="#how-it-works"
              analytics={trackingAttributes('figma_landing_how_it_works_clicked')}
            />
          </div>

          <p className={styles.footnote}>
            *The plugin works with a free Pulsar account and a plugin subscription. A free trial is
            available.
          </p>
        </div>

        <div className={styles.right}>
          <div ref={pluginWindowRef} className={styles.shot}>
            <div className={styles.shotBar}>
              <span className={styles.shotMark} aria-hidden="true" />
              <span className={styles.shotName}>Pulsar Haptics</span>
              <span className={styles.shotClose} aria-hidden="true">
                &times;
              </span>
            </div>
            <img
              className={styles.shotImage}
              src={pluginWindow.src}
              width={pluginWindow.width}
              height={pluginWindow.height}
              alt="The Pulsar Haptics plugin running inside Figma, showing the preset library with its filters open"
            />
          </div>

          <div className={styles.moodColumn}>
            {moods.map((mood) => (
              <EmojiButton
                key={mood.emoji}
                emoji={mood.emoji}
                size="small"
                className={styles.moodTile}
                onClick={() => playMood(mood)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
