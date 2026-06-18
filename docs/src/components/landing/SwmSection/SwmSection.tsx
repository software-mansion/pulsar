import styles from './SwmSection.module.scss';
import commonStyle from '../common.module.scss';
import { BasicLayout } from '../Layouts/BasicLayout';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Button } from '../Button/Button';

import swm_logo from '../../../assets/swm-logo.svg';
import social_discord from '../../../assets/landing-page/social_discord.svg';
import social_drb from '../../../assets/landing-page/social_drb.svg';
import social_fb from '../../../assets/landing-page/social_fb.svg';
import social_git from '../../../assets/landing-page/social_git.png';
import social_ig from '../../../assets/landing-page/social_ig.svg';
import social_in from '../../../assets/landing-page/social_in.svg';
import social_x from '../../../assets/landing-page/social_x.svg';
import social_yt from '../../../assets/landing-page/social_yt.svg';
import arrow from '../../../assets/landing-page/footer_arrow.svg';

export function SwmSection({ className }: { className?: string }) {
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

        <div className={styles.iconBar}>
          <a href="https://x.com/swmansion" target="_blank">
            <img src={social_x.src} />
          </a>
          <a href="https://www.facebook.com/SoftwareMansion/" target="_blank">
            <img src={social_fb.src} />
          </a>
          <a href="https://github.com/software-mansion" target="_blank">
            <img src={social_git.src} />
          </a>
          <a href="https://www.instagram.com/swmansion/" target="_blank">
            <img src={social_ig.src} />
          </a>
          <a href="https://www.youtube.com/c/SoftwareMansion" target="_blank">
            <img src={social_yt.src} />
          </a>
          <a href="https://www.linkedin.com/company/software-mansion/" target="_blank">
            <img src={social_in.src} />
          </a>
          <a href="https://discord.gg/PtsUSUKrqU" target="_blank">
            <img src={social_discord.src} />
          </a>
          <a href="https://dribbble.com/softwaremansion" target="_blank">
            <img src={social_drb.src} />
          </a>
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
