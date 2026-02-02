import styles from './VisualizationPanel.module.scss';
import phoneIcon from '../../../assets/new_assets/phone.svg';
import playIcon from '../../../assets/new_assets/play.svg';

interface VisualizationPanelProps {
  image: {
    src: string;
  };
  onPlayClick: () => void;
  onRecordClick: () => void;
  className?: string;
}

export function VisualizationPanel({
  image,
  onPlayClick,
  onRecordClick,
  className = '',
}: VisualizationPanelProps) {
  return (
    <div className={`${styles.visualizationPanel} ${className}`}>
      <div className={styles.visualization}>
        <img src={image.src} alt="visualization" className={styles.image} />
      </div>

      <div className={styles.controls}>
        <div
          className={styles.controlButton}
          onClick={onPlayClick}
          title="Play"
          aria-label="Play"
        >
          <img src={playIcon.src} alt="Play audio" />
        </div>

        <div
          className={styles.controlButton}
          onClick={onRecordClick}
          title="Record"
          aria-label="Record"
        >
          <img src={phoneIcon.src} alt="Play vibration on device" />
        </div>
      </div>
    </div>
  );
}
