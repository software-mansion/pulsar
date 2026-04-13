import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PresetsScreen from './src/screens/PresetsScreen';
import RealtimeComposerScreen from './src/screens/RealtimeComposerScreen';
import PublicApisScreen from './src/screens/PublicApisScreen';

type TabName = 'presets' | 'realtime' | 'apis';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('presets');

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'presets' && <PresetsScreen />}
          {activeTab === 'realtime' && <RealtimeComposerScreen />}
          {activeTab === 'apis' && <PublicApisScreen />}
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TabButton
            title="Presets"
            icon="🎵"
            active={activeTab === 'presets'}
            onPress={() => setActiveTab('presets')}
          />
          <TabButton
            title="Realtime"
            icon="🎮"
            active={activeTab === 'realtime'}
            onPress={() => setActiveTab('realtime')}
          />
          <TabButton
            title="APIs"
            icon="⚙️"
            active={activeTab === 'apis'}
            onPress={() => setActiveTab('apis')}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

interface TabButtonProps {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({ title, icon, active, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
