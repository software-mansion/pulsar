import styles from './LivePreviewReminder.module.css';
import iconInfo from '../assets/icon-info.svg';

// Top-of-Presets reminder nudging the user to finish the Live preview setup
// (file key + paired phone). Rendered only while configuration is incomplete;
// the Configure button switches to the Live preview tab where the configurator lives.
export default function LivePreviewReminder({ onConfigure }: { onConfigure: () => void }) {
  return (
    <div className={styles['reminder']}>
      <span className={styles['reminder-icon']}>
        <img src={iconInfo} alt="" />
      </span>
      <div className={styles['reminder-main']}>
        <div className={styles['reminder-title']}>
          To use Live Preview you need to connect Pulsar App
        </div>
      </div>
      <button className={styles['reminder-cta']} onClick={onConfigure}>
        Configure
      </button>
    </div>
  );
}
