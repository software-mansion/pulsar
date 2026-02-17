import styles from './TopBanner.module.scss';

import swmLogo from '../../../assets/swm-logo.svg';
import volume from '../../../assets/landing-page/volume.png';
import { Button } from '../Button/Button';
import { EmojiButton } from '../EmojiButton/EmojiButton';

export function TopBanner() {
  return(<div className={styles.banner}>

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

      <div className={styles.circle1}>
        <div className={styles.circle2}>
          <div className={styles.circle3}>
            <div className={styles.circle4}></div>
          </div>
        </div>
      </div>

      <div className={styles.phoneBackground}>
        <div className={styles.phone}>
          <div className={styles.notch}></div>
          <div className={styles.buttonHolder}>

            <div className={styles.row}>
              <EmojiButton emoji="emoji1" />
              <EmojiButton emoji="emoji2" />
            </div>

            <div className={styles.row}>
              <EmojiButton emoji="emoji3" />
              <EmojiButton emoji="emoji4" />
            </div>

          </div>
        </div>
      </div>
    </div>

    <div className={styles.soundBanner}>
      <div className={styles.text}>
        🔊 Keep you sound on for the best experience
      </div>
      <img className={styles.icon} src={volume.src} />
    </div>

  </div>)
}
