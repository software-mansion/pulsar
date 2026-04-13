import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
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
