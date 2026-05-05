import { useState } from 'react';
import styles from './CodeTabs.module.scss';

interface CodeTabsProps {
  swift: string;
  kotlin: string;
  kmp: string;
  reactNative: string;
  className?: string;
}

export function CodeTabs({ swift, reactNative, kotlin, kmp, className = '' }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState<'swift' | 'kotlin' | 'kmp' | 'reactNative'>('swift');

  const content = {
    swift,
    kotlin,
    kmp,
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
          className={`${styles.tab} ${activeTab === 'kotlin' ? styles.active : ''}`}
          onClick={() => setActiveTab('kotlin')}
        >
          Kotlin
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'kmp' ? styles.active : ''}`}
          onClick={() => setActiveTab('kmp')}
        >
          KMP
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
