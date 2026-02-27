import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
  align?: 'center' | 'left';
}

export function SectionHeader({
  title,
  subtitle,
  className = '',
  align = 'center',
}: SectionHeaderProps) {
  const alignClass = align === 'left' ? styles.left : styles.center;

  return (
    <div className={`${styles.header} ${alignClass} ${className}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  );
}
