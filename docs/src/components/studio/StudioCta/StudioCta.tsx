import styles from './StudioCta.module.scss';
import { Button } from '../../landing/Button/Button';
import { STUDIO_URL } from '../../../content/docs/components/config';
import { BASE_PATH } from '../../../../config';
import star from '../../../assets/landing-page/star.svg';
import wavePattern from '../../../assets/landing-page/pattern.svg';
import { track } from '../../../analytics/analytics';

export function StudioCta() {
  return (
    <section className={styles.section} id="open-studio">
      <div className={styles.waves} aria-hidden="true">
        <img src={wavePattern.src} alt="" />
      </div>

      <img
        className={`${styles.star} ${styles.starTopLeft}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${styles.star} ${styles.starBottomLeft}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${styles.star} ${styles.starTopRight}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`${styles.star} ${styles.starBottomRight}`}
        src={star.src}
        alt=""
        aria-hidden="true"
      />

      <div className={styles.inner}>
        <h2 className={styles.heading}>Start designing your haptics</h2>
        <p className={styles.subtitle}>
          Pulsar Studio runs in the browser — open it, draw a pattern, feel it on your phone, and
          export the code.
        </p>

        <div className={styles.actions}>
          <Button
            label="Open Pulsar Studio"
            variant="filled"
            url={STUDIO_URL}
            onClick={() => track('studio_landing_cta_clicked', { location: 'closing' })}
          />
          <Button
            label="Read the docs"
            url={`${BASE_PATH}/studio/overview/`}
            onClick={() => track('studio_landing_docs_link_clicked', { location: 'closing' })}
          />
        </div>

        <p className={styles.priceHint}>Pricing starts from 9$/month.</p>
      </div>
    </section>
  );
}
