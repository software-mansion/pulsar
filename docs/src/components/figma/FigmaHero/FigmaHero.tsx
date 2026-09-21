import { useEffect, useState } from 'react';
import { Presets } from 'pulsar-haptics';
import styles from './FigmaHero.module.scss';
import { Button } from '../../landing/Button/Button';
import { EmojiButton } from '../../landing/EmojiButton/EmojiButton';
import {
  HapticRings,
  type RingsAnimation,
  type RingsColor,
} from '../../landing/HapticRings/HapticRings';
import { FIGMA_COMMUNITY_URL } from '../figmaLinks';
import { track, trackingAttributes } from '../../../analytics/analytics';

import swmLogo from '../../../assets/swm-logo.svg';
import star from '../../../assets/landing-page/star.svg';
import pluginWindow from '../../../content/docs/assets/figma-plugin/presets-filters.png';

interface Mood {
  emoji: string;
  playHaptic: () => void;
  color: RingsColor;
  animation: RingsAnimation;
}

const moods: Mood[] = [
  { emoji: 'emoji1', playHaptic: () => Presets.sway(), color: 'blue', animation: 'wave' },
  { emoji: 'emoji2', playHaptic: () => Presets.trill(), color: 'yellow', animation: 'sonar' },
  { emoji: 'emoji3', playHaptic: () => Presets.smash(), color: 'red', animation: 'quake' },
  {
    emoji: 'emoji4',
    playHaptic: () => Presets.heartbeat(),
    color: 'green',
    animation: 'heartbeat',
  },
];

const heroBackground: Record<RingsColor, string> = {
  blue: '',
  yellow: styles.yellow,
  red: styles.red,
  green: styles.green,
};

const AUTO_ADVANCE_MS = 3600;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return prefersReducedMotion;
}

export function FigmaHero() {
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeMood = moods[activeMoodIndex];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const advance = setTimeout(
      () => setActiveMoodIndex((index) => (index + 1) % moods.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearTimeout(advance);
  }, [activeMoodIndex, prefersReducedMotion]);

  const playMood = (mood: Mood, index: number) => {
    setActiveMoodIndex(index);
    mood.playHaptic();
    track('figma_landing_haptic_played', { emoji: mood.emoji });
  };

  return (
    <section className={`${styles.hero} ${heroBackground[activeMood.color]}`}>
      <HapticRings
        animation={activeMood.animation}
        color={activeMood.color}
        className={styles.rings}
      />
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
          <div className={styles.shot}>
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
            {moods.map((mood, index) => (
              <EmojiButton
                key={mood.emoji}
                emoji={mood.emoji}
                size="medium"
                className={`${styles.moodTile} ${
                  index === activeMoodIndex ? styles.moodTileActive : ''
                }`}
                onClick={() => playMood(mood, index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
