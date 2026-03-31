import styles from './VisitComposer.module.scss';

import star from '../../../assets/landing-page/star.svg';
import screenshot from '../../../assets/landing-page/screenshot.png';

interface VisitComposerProps {
  className?: string;
}

export function VisitComposer({ className }: VisitComposerProps) {
  return (
    <div className={`${styles.background} ${className || ''}`}>
      <div className={styles.section}>
        <div className={styles.stars}>
          <img className={styles.star1} src={star.src} />
          <img className={styles.star2} src={star.src} />
        </div>

        <div className={styles.leftBar}>
          <div className={styles.header}>Not sure which one to choose?</div>
          <div className={styles.text}>
            Choosing the right one isn't obvious. We know this, so we prepared a composer that will
            make your choice much easier.
          </div>
          <img src={screenshot.src} />
          <br />
          <a className={styles.link} href='/presets-playground'>Visit our composer</a>
        </div>
      </div>
    </div>
  );
}
