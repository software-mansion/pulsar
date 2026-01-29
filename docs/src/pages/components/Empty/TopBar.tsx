import styles from './VisitPlayground.module.scss';

export function TopBar(
  { className }: 
  { className?: string; }
) {
  return <div className={`${styles.topbar} ${className || ''}`}>
    <div className={styles.NAME}></div>
  </div>
}
