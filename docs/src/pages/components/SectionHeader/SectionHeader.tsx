import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function SectionHeader(
  { title, subtitle, className = '' }: SectionHeaderProps
) {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  );
}
