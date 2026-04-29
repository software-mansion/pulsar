import { useState, Children, isValidElement, ReactElement } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

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
                  backgroundColor: isActive ? '#E8F5FB' : '#fff',
                  borderBottomColor: isActive ? '#38ACDD' : '#B5E1F1',
                },
              ]}
              onPress={() => setActiveTab(index)}
            >
              <ThemedText style={[styles.tabText]}>{tab.props.name}</ThemedText>
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
  },
  tabsHeaderContent: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
  },
  contentArea: {
    flex: 1,
    width: '100%',
  },
});
