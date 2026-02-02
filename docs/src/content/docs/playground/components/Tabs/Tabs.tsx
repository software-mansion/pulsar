import { useState, Children, isValidElement } from 'react';
import styles from './Tabs.module.scss';

interface TabProps {
  name: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: React.ReactNode;
  className?: string;
  defaultTab?: number;
}

export function Tabs({ children, className = '', defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState<number>(defaultTab);

  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Tab
  );

  return (
    <div className={`${styles.tabs} ${className}`}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab, index) => {
          if (isValidElement<TabProps>(tab)) {
            return (
              <div
                key={index}
                className={`${styles.tab} ${activeTab === index ? styles.active : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.props.name}
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className={styles.contentArea}>
        {tabs.map((tab, index) => {
          if (isValidElement<TabProps>(tab) && activeTab === index) {
            return <div key={index}>{tab.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
}
