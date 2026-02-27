import styles from './Tutorials.module.scss';
import commonStyle from '../../common.module.scss';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Button } from '../Button/Button';

export function Tutorials({ className }: { className?: string }) {
  return (
    <div className={`${styles.section} ${className || ''}`}>
      <div className={styles.left}>
        <SectionHeader
          title="Tutorials"
          subtitle="Haptics are great but only when it fits. We prepared set of articles that will make it easy for you."
          align="left"
        />
        <Button label="Read all" />
      </div>
      <div className={styles.right}>
        <Article
          date="13th September 2025"
          title="Do I need a haptics?"
          details="The meaning and benefits of using haptic technology in the application."
        />
        <Article
          date="13th September 2025"
          title="Do I need a haptics?"
          details="The meaning and benefits of using haptic technology in the application."
        />
        <Article
          date="13th September 2025"
          title="Do I need a haptics?"
          details="The meaning and benefits of using haptic technology in the application."
        />
      </div>
    </div>
  );
}

function Article({ date, title, details }: { date: string; title: string; details: string }) {
  return (
    <div className={styles.background}>
      <div className={styles.section}>
        <div className={styles.articleLeft}>
          <div className={styles.date}>{date}</div>
          <div className={styles.intro}>
            <div className={styles.title}>{title}</div>
            <div className={styles.details}>{details}</div>
          </div>
        </div>
        <div className={styles.articleRight}>
          <div className={styles.image}></div>
        </div>
      </div>
    </div>
  );
}
