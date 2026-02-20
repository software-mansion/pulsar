import { StyleSheet, View, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import Button from '@/components/Button';
import { Link } from 'expo-router';
import GesturePlayground from '../../components/GesturePlayground';

const handImage = require('@/assets/images/hand.png');
const infoIcon = require('@/assets/images/info.svg');

const defaultEdges = {
  top: 'additive',
  left: 'additive',
  bottom: 'off',
  right: 'additive',
};

const stringToShare = "Example preset content";

export default function PlaygroundScreen() {
  const handleShare = async () => {
    try {
      await Share.share({
        message: stringToShare,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView edges={defaultEdges as any} style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Playground</ThemedText>
          <Link href="/playgroundModal">
            <Link.Trigger>
              <View style={styles.howItWorksButton}>
                <ThemedText>How does it work?</ThemedText>
                <Image source={infoIcon} style={styles.infoIcon} />
              </View>
            </Link.Trigger>
          </Link>
        </View>

        {/* <Image
            source={handImage}
            style={styles.handPointer}
            contentFit="contain"
          /> */}

        <GesturePlayground />

        <View style={styles.controlsContainer}>
          <Button onClick={() => {}} showIcon="play" largeIcon={true} />
          <Button label="Record" onClick={() => {}} showIcon="record" fullWidth={true} />
          <Button onClick={handleShare} showIcon="download" largeIcon={true} />
        </View>
        
      </View>
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
  infoIcon: {
    width: 18,
    height: 18,
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  handPointer: {
    width: 80,
    height: 80,
    position: 'absolute',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    gap: 12,
  },
  controlButton: {
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
