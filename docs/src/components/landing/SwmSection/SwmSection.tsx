import styles from './SwmSection.module.scss';
import { BasicLayout } from '../Layouts/BasicLayout';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Button } from '../Button/Button';

import swm_logo from '../../../assets/swm-logo.svg';
import arrow from '../../../assets/landing-page/footer_arrow.svg';

export function SwmSection({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`${styles.section} ${className || ''}`}>
      <img className={styles.logo} src={swm_logo.src} />
      <BasicLayout>
        <div>
          <img className={styles.arrows} src={arrow.src} />
          <span className={styles.zOrder}>
            <SectionHeader
              title="We are Software Mansion"
              subtitle="We're a software company built around improving developer experience and bringing to life the innovative ideas of our clients."
            />
          </span>
        </div>

        <Card>
          <div className={styles.wrapper}>
            <div className={styles.text}>
              Do you have a software project that we can help you with?
            </div>
            <Button label="Learn more about us" url="https://swmansion.com/" />
          </div>
        </Card>
      </BasicLayout>
      <BasicLayout>
        <div className={styles.footer}>
          <p className={styles.footerText}>
            &copy; {currentYear}{' '}
            <a href="https://swmansion.com/" target="_blank" rel="noopener">
              Software Mansion
            </a>
            . Read about our{' '}
            <a href="https://swmansion.com/privacy/policy/ " target="_blank" rel="noopener">
              Privacy Policy
            </a>
            . We collect anonymous, cookieless usage statistics — no cookies, no tracking
            across sites.
          </p>
        </div>
      </BasicLayout>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.cardBackground}>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
}
