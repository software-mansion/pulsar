import styles from './BasicLayout.module.scss';

export function BasicLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.layout}>{children}</div>;
}
