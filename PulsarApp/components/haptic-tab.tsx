import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { PlatformPressable } from 'expo-router/react-navigation';
import { Presets } from 'react-native-pulsar';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        Presets.System.impactLight();
        props.onPressIn?.(ev);
      }}
    />
  );
}
