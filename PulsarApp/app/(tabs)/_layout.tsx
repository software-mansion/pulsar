import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { usePathname } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import SvgIcon from '@/components/SvgIcon';
import { useStoreReview } from '@/contexts/StoreReviewContext';

export default function TabLayout() {
  const pathname = usePathname();
  const { trackTabVisit } = useStoreReview();

  useEffect(() => {
    // Track tab visits based on pathname
    const tabName = pathname.split('/').pop() || 'index';
    trackTabVisit(tabName);
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <SvgIcon iconName="home" state={focused ? 'active' : 'default'} />,
        }}
      />
      <Tabs.Screen
        name="presets"
        options={{
          title: 'Presets',
          tabBarIcon: ({ focused }) => <SvgIcon iconName="list" state={focused ? 'active' : 'default'} />,
        }}
      />
      <Tabs.Screen
        name="playground"
        options={{
          title: 'Playground',
          tabBarIcon: ({ focused }) => <SvgIcon iconName="brush" state={focused ? 'active' : 'default'} />,
        }}
      />
      <Tabs.Screen
        name="demos"
        options={{
          title: 'Demos',
          tabBarIcon: ({ focused }) => <SvgIcon iconName="sparkles" state={focused ? 'active' : 'default'} />,
        }}
      />
    </Tabs>
  );
}
