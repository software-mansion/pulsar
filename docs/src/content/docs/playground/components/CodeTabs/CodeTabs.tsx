import { useState } from 'react';
import styles from './CodeTabs.module.scss';

interface CodeTabsProps {
  swift: string;
  reactNative: string;
  className?: string;
}

export function CodeTabs({ swift, reactNative, className = '' }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState<'swift' | 'reactNative'>('swift');

  const content = {
    swift,
    reactNative,
  };

  return (
    <div className={`${styles.codeTabs} ${className}`}>
      <div className={styles.tabsHeader}>
        <div
          className={`${styles.tab} ${activeTab === 'swift' ? styles.active : ''}`}
          onClick={() => setActiveTab('swift')}
        >
          Swift
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'reactNative' ? styles.active : ''}`}
          onClick={() => setActiveTab('reactNative')}
        >
          React Native
        </div>
      </div>

      <div className={styles.contentArea}>
        <pre className={styles.code}>{content[activeTab]}</pre>
      </div>
    </div>
  );
}
