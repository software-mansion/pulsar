import { type PropsWithChildren, useState } from 'react';
import styles from './Accordion.module.scss';
import arrowIcon from '../../assets/new_assets/arrow.svg';

type AccordionProps = PropsWithChildren<{
  title: string;
  defaultOpen?: boolean;
  className?: string;
}>;

export function Accordion({ title, children, defaultOpen = false, className }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details className={`${styles.accordion} ${className || ''}`}>
      <summary className={styles.header} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <img
          src={arrowIcon.src}
          alt="toggle"
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
        />
        <span className={styles.title}>{title}</span>
      </summary>
      {isOpen && <div className={styles.content}>{children}</div>}
    </details>
  );
}
