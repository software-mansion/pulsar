import { useState } from 'react';
import styles from './WebCodeTabs.module.scss';

export interface WebCodeTab {
  id: string;
  label: string;
  code: string;
}

interface Props {
  tabs: WebCodeTab[];
  className?: string;
}

export function WebCodeTabs({ tabs, className = '' }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className={`${styles.codeTabs} ${className}`}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${active?.id === tab.id ? styles.active : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={styles.contentArea}>
        <pre className={styles.code}>{active?.code}</pre>
      </div>
    </div>
  );
}
