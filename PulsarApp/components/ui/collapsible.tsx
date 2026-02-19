import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, ViewProps, View } from 'react-native';
import Animated, {FadeInUp, FadeOutUp} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title, style }: PropsWithChildren & { title: string; style?: ViewProps['style'] }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText>{title}</ThemedText>
      </TouchableOpacity>
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
