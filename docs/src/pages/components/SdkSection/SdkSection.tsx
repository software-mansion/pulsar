import { Button } from '../Button/Button';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import styles from './SdkSection.module.scss';
import commonStyle from '../../common.module.scss';

export function SdkSection(
  { className }: 
  { className?: string; }
) {
  return <div className={`${styles.section} ${className || ''}`}>
    <div className={styles.left}>
      <SectionHeader
        title='Mulitplatform SDKs'
        subtitle='SDK available for all popular mobile solution - iOS Swift UI, Android Kotlin SDK, React Native.'
        align='left'
      />
      <Button label='See all of them' />
    </div>
    <div className={styles.right}>
      <div className={styles.row}>
        <div className={styles.logo}></div>
        <div className={styles.logo}></div>
        <div className={styles.logo}></div>
      </div>
      <div className={styles.row}>
        <div className={styles.logo}></div>
        <div className={styles.logo}></div>
        <div className={styles.logo}></div>
      </div>
    </div>
  </div>
}
