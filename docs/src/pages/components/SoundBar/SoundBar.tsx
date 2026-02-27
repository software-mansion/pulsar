import styles from './SoundBar.module.scss';
import volume from '../../../assets/landing-page/volume.png';

export function SoundBar() {
  return (
    <div className={styles.soundBanner}>
      <div className={styles.text}>🔊 Keep you sound on for the best experience</div>
      <img className={styles.icon} src={volume.src} />
    </div>
  );
}
