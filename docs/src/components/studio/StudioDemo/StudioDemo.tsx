import styles from './StudioDemo.module.scss';
import { BasicLayout } from '../../landing/Layouts/BasicLayout';
import { BASE_PATH } from '../../../../config';

// A looping product demo, framed in the Pulsar "window" card. Sits right above
// the waitlist so visitors can see Studio in action before signing up.
export function StudioDemo() {
  return (
    <section className={styles.section}>
      <BasicLayout>
        <div className={styles.inner}>
          <h2 className={styles.heading}>See Pulsar Studio in action</h2>
          <p className={styles.subtitle}>
            A quick look at designing, tweaking, and exporting custom haptics — all in one place.
          </p>

          <div className={styles.window}>
            <div className={styles.windowBar}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.windowTitle}>Pulsar Studio</span>
            </div>
            <div className={styles.windowBody}>
              <video
                className={styles.video}
                src={`${BASE_PATH}/assets/pulsar-demo.mp4`}
                poster={`${BASE_PATH}/assets/pulsar-demo-poster.jpg`}
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </BasicLayout>
    </section>
  );
}
