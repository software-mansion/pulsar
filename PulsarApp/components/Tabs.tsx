import { useState, Children, isValidElement, ReactElement } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TabProps {
  name: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: React.ReactNode;
  defaultTab?: number;
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState<number>(defaultTab);
  const borderColor = useThemeColor({}, 'borderColor');
  const activeBackgroundColor = useThemeColor({ light: '#E8F5FB', dark: '#1a2a3a' }, 'background');
  const inactiveBackgroundColor = useThemeColor({ light: '#fff', dark: '#0a0a0a' }, 'background');

  const tabs = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Tab
  ) as ReactElement<TabProps>[];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsHeader}
        contentContainerStyle={styles.tabsHeaderContent}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
                  borderBottomWidth: isActive ? 3 : 0,
                  borderBottomColor: borderColor,
                },
              ]}
              onPress={() => setActiveTab(index)}
            >
              <ThemedText style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.props.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.contentArea}>
        {tabs.map((tab, index) => {
          if (activeTab === index) {
            return (
              <View key={index} style={{ flex: 1 }}>
                {tab.props.children}
              </View>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsHeader: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsHeaderContent: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    width: '100%',
  },
});
