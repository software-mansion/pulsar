import { useEffect, useState } from 'react';
import styles from './AppShowcase.module.scss';
import presetsScreen from '../../../assets/landing-page/app-screens/screen-presets.png';
import playgroundScreen from '../../../assets/landing-page/app-screens/screen-playground.png';
import demosScreen from '../../../assets/landing-page/app-screens/screen-demos.png';
import balloonScreen from '../../../assets/landing-page/app-screens/screen-balloon.png';
import countdownScreen from '../../../assets/landing-page/app-screens/screen-countdown.png';

const screens = [
  { src: presetsScreen.src, alt: 'Pulsar app presets library screen' },
  { src: playgroundScreen.src, alt: 'Pulsar app haptics playground screen' },
  { src: demosScreen.src, alt: 'Pulsar app interactive demos screen' },
  { src: balloonScreen.src, alt: 'Pulsar app balloon haptics demo screen' },
  { src: countdownScreen.src, alt: 'Pulsar app countdown timer haptics demo screen' },
];

const ROTATION_MS = 3500;

export function PhoneCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }
    const id = setInterval(() => {
      setActive((current) => (current + 1) % screens.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.phone}>
      <div className={styles.phoneFrame}>
        <div className={styles.screen}>
          {screens.map((screen, index) => (
            <img
              key={screen.src}
              src={screen.src}
              alt={screen.alt}
              loading="lazy"
              draggable={false}
              className={`${styles.screenImg} ${
                index === active ? styles.screenImgActive : ''
              }`}
            />
          ))}
        </div>
      </div>
      <div className={styles.dots}>
        {screens.map((screen, index) => (
          <button
            key={screen.src}
            type="button"
            aria-label={`Show app screen ${index + 1}`}
            aria-current={index === active}
            className={`${styles.dot} ${index === active ? styles.dotActive : ''}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
}
