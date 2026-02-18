import styles from './TopBanner.module.scss';

import swmLogo from '../../../assets/swm-logo.svg';
import starIcon from '../../../assets/landing-page/star.svg';
import angelIcon from '../../../assets/landing-page/angel.svg';
import warningIcon from '../../../assets/landing-page/warning.svg';
import { Button } from '../Button/Button';
import { EmojiButton } from '../EmojiButton/EmojiButton';
import { SoundBar } from '../SoundBar/SoundBar';
import { useEffect, useState } from 'react';

export function TopBanner() {
  const [colorClass, setColorClass] = useState('');
  const [showStars, setShowStars] = useState(false);
  const [showAngels, setShowAngels] = useState(false);
  const [confettiInstances, setConfettiInstances] = useState<number[]>([]);
  const [backgroundAnimation, setBackgroundAnimation] = useState(styles.wave);

  function handleAnimationEffect(effect: '' | 'stars' | 'angels' | 'confetti', enable: boolean = true) {
    if (effect === '') {
      setShowStars(false);
      setShowAngels(false);
      setConfettiInstances([]);
    } else if (effect === 'stars') {
      setShowAngels(false);
      setConfettiInstances([]);
      setShowStars(enable);
    } else if (effect === 'angels') {
      setShowStars(false);
      setConfettiInstances([]);
      setShowAngels(enable);
    } else if (effect === 'confetti') {
      setShowStars(false);
      setShowAngels(false);
      setConfettiInstances(prev => [...prev, Date.now()]);
    }
  }

  const removeConfettiInstance = (id: number) => {
    setConfettiInstances(prev => prev.filter(confetti => confetti !== id));
  }
  
  return(<div className={`${styles.banner} ${colorClass}`}>

    <div>

      <div className={styles.leftBar}>

        <div className={styles.authors}>
          <span>Created by</span>
          <img src={swmLogo.src} />
        </div>

        <div className={styles.header}>
          <div className={styles.title}>
            Rich and ready-to use haptics library
          </div>
          <div className={styles.subtitle}>
            Presets that you can hear and feel with Live Preview.
          </div>
        </div>

        <div className={styles.buttonHolder}>
          <Button label='Preset playground' url={'/presets'} />
          <Button label='Read the docs' variant='filled' url={'/docs'} />
        </div>

      </div>

      <div className={styles.rightBar}>

        <svg className={`${styles.svgWave} ${colorClass} ${backgroundAnimation}`} width="1000" height="1000" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle opacity="0.1" cx="600" cy="600" r="500" fill="#87CCE8" stroke="#2B85AB" stroke-miterlimit="16" stroke-dasharray="8 8"/>
          <circle opacity="0.1" cx="600" cy="600" r="400" fill="#87CCE8" stroke="#2B85AB" stroke-miterlimit="16" stroke-dasharray="8 8"/>
          <circle opacity="0.1" cx="600" cy="600" r="300" fill="#87CCE8" stroke="#2B85AB" stroke-miterlimit="16" stroke-dasharray="8 8"/>
          <circle opacity="0.1" cx="600" cy="600" r="200" fill="#87CCE8" stroke="#2B85AB" stroke-miterlimit="16" stroke-dasharray="8 8"/>
          <circle opacity="0.1" cx="600" cy="600" r="100" fill="#87CCE8" stroke="#2B85AB" stroke-miterlimit="16" stroke-dasharray="8 8"/>
        </svg>


        <div className={styles.phoneBackground}>
          
          {showStars && <StarsEffect onComplete={() => handleAnimationEffect('stars', false)} />}

          {showAngels && <AngelEffect />}

          {confettiInstances.map(id => (
            <ConfettiEffect key={id} onComplete={() => removeConfettiInstance(id)} />
          ))}
          
          <div className={styles.phone}>
            
            <div className={styles.notch}></div>
            <div className={styles.buttonHolder}>

              <div className={styles.row}>
                <EmojiButton emoji="emoji1" onClick={() => {
                  setColorClass('');
                  setBackgroundAnimation(styles.wave);
                  handleAnimationEffect('');
                }} />
                <EmojiButton emoji="emoji2" onClick={() => {
                  setColorClass(styles.yellow);
                  setBackgroundAnimation(styles.sonar);
                  handleAnimationEffect('stars');
                }} />
              </div>

              <div className={styles.row}>
                <EmojiButton emoji="emoji3" onClick={() => {
                  setColorClass(styles.red);
                  setBackgroundAnimation(styles.quake);
                  handleAnimationEffect('confetti');
                }} />
                <EmojiButton emoji="emoji4" onClick={() => {
                  setColorClass(styles.green);
                  setBackgroundAnimation(styles.heartbeat);
                  handleAnimationEffect('angels');
                }} />
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>

    <SoundBar />

  </div>)
}

function StarsEffect({onComplete}: { onComplete?: () => void }) {
  return <div className={styles.starContainer}>
    <img src={starIcon.src} />
    <img src={starIcon.src} />
    <img src={starIcon.src} />
    <img src={starIcon.src} onAnimationEnd={onComplete} />
  </div>
}

function ConfettiEffect({onComplete}: { onComplete?: () => void }) {
  return <div className={styles.confettiContainer}>
    <img src={warningIcon.src} />
    <img src={warningIcon.src} />
    <img src={warningIcon.src} />
    <img src={warningIcon.src} />
    <img src={warningIcon.src} onAnimationEnd={onComplete} />
    <img src={warningIcon.src} />
    <img src={warningIcon.src} />
    <img src={warningIcon.src} />
  </div>
}

function AngelEffect() {
  return <div className={styles.angelContainer}>
    <img src={angelIcon.src} />
    <img src={angelIcon.src} />
    <img src={angelIcon.src} />
    <img src={angelIcon.src} />
  </div>
}
