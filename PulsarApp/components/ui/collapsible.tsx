import { PropsWithChildren, useState } from 'react';
import { StyleSheet, ViewProps, View } from 'react-native';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {  BaseButton } from 'react-native-gesture-handler';

export function Collapsible({
  children,
  title,
  style,
  defaultOpen = false,
}: PropsWithChildren & { title: string; style?: ViewProps['style']; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={style}>
      <BaseButton
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        rippleColor="transparent">
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText>{title}</ThemedText>
      </BaseButton>
      {isOpen && <Animated.View entering={FadeInUp.delay(50)} exiting={FadeOutUp} style={styles.content}>{children}</Animated.View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
  },
});
