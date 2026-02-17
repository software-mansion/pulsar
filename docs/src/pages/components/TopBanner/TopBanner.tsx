import styles from './TopBanner.module.scss';

import swmLogo from '../../../assets/swm-logo.svg';
import { Button } from '../Button/Button';
import { EmojiButton } from '../EmojiButton/EmojiButton';
import { SoundBar } from '../SoundBar/SoundBar';
import { useState } from 'react';

export function TopBanner() {
  const [colorClass, setColorClass] = useState('');
  const [backgroundAnimation, setBackgroundAnimation] = useState(styles.wave);
  
  return(<div className={`${styles.banner} ${colorClass}`}>

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
        <div className={styles.phone}>
          <div className={styles.notch}></div>
          <div className={styles.buttonHolder}>

            <div className={styles.row}>
              <EmojiButton emoji="emoji1" onClick={() => {
                setColorClass('');
                setBackgroundAnimation(styles.wave);
              }} />
              <EmojiButton emoji="emoji2" onClick={() => {
                setColorClass(styles.yellow);
                setBackgroundAnimation(styles.sonar);
              }} />
            </div>

            <div className={styles.row}>
              <EmojiButton emoji="emoji3" onClick={() => {
                setColorClass(styles.red);
                setBackgroundAnimation(styles.quake);
              }} />
              <EmojiButton emoji="emoji4" onClick={() => {
                setColorClass(styles.green);
                setBackgroundAnimation(styles.heartbeat);
              }} />
            </div>

          </div>
        </div>
      </div>
    </div>

    <SoundBar />

  </div>)
}
