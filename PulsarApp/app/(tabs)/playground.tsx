import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useThemeColor } from '@/hooks/use-theme-color';

import { Link } from 'expo-router';

const gridImage = require('@/assets/images/grid.svg');
const handImage = require('@/assets/images/hand.png');
const infoIcon = require('@/assets/images/info.svg');

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

export default function PlaygroundScreen() {
  const borderColor = useThemeColor({}, 'borderColor');

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <ThemedView style={styles.container}>

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Playground</ThemedText>
          <Link href="/playgroundModal">
            <Link.Trigger>
              <View style={styles.howItWorksButton}>
                <ThemedText style={styles.howItWorksText}>How does it work?</ThemedText>
                <Image source={infoIcon} style={styles.infoIcon} />
              </View>
            </Link.Trigger>
          </Link>
        </View>


        <View style={styles.gridContainer}>
          <Image
            source={gridImage}
            style={styles.grid}
            contentFit="contain"
          />
          <Image
            source={handImage}
            style={styles.handPointer}
            contentFit="contain"
          />
        </View>

        <Link href="/playgroundModal">
          <Link.Trigger>
            <Text>test</Text>
          </Link.Trigger>
        </Link>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={[styles.controlButton, { borderColor }]}>
            <ThemedText style={styles.playIcon}>▶</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.recordButton, { borderColor }]}>
            <View style={styles.recordDot} />
            <ThemedText style={styles.recordText}>Record</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, { borderColor }]}>
            <ThemedText style={styles.downloadIcon}>↓</ThemedText>
          </TouchableOpacity>
        </View>
        
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  howItWorksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  howItWorksText: {
    fontSize: 14,
  },
  infoIcon: {
    width: 18,
    height: 18,
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  grid: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
  },
  handPointer: {
    width: 80,
    height: 80,
    position: 'absolute',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 8,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
  },
  downloadIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  recordButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#E74C3C',
    borderRadius: 8,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  recordDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E74C3C',
  },
  recordText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
