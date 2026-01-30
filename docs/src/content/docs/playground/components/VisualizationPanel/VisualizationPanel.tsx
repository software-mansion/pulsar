import styles from './VisualizationPanel.module.scss';

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
        <button
          className={styles.controlButton}
          onClick={onPlayClick}
          title="Play"
          aria-label="Play"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>

        <button
          className={styles.controlButton}
          onClick={onRecordClick}
          title="Record"
          aria-label="Record"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
