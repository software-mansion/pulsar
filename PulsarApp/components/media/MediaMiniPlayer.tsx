import { router } from 'expo-router';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { MediaProgressBar, sessionStatusText } from '@/components/media/MediaProgress';
import { ThemedText } from '@/components/themed-text';
import { useMediaSession } from '@/contexts/MediaSessionContext';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const SUBTLE = '#496695';
const RED = '#FF6259';

/**
 * The pinned mini-player for media-backed haptics received from Studio: it appears above
 * the tab bar on an incoming push and stays there while something is loaded. Tapping it
 * opens that connection's library (`/mediaLibraryModal`), which is where the full player
 * and the cached resources live — so this bar carries only play/stop and dismiss.
 */
export default function MediaMiniPlayer() {
  const { session, downloadProgress, positionMs, openConnectionId, dismissPlayer, stop, play } =
    useMediaSession();
  const insets = useSafeAreaInsets();

  // The library modal shows a full player of its own; don't stack a second one under it.
  if (!session || openConnectionId) return null;

  const isDownloading = session.status === 'downloading';
  const isPlaying = session.status === 'playing';
  const fraction = isDownloading
    ? downloadProgress
    : session.durationMs > 0
      ? positionMs / session.durationMs
      : 0;

  // One control, one meaning: stop what's running, or resume it from the playhead.
  const onTogglePlay = () => (isPlaying ? stop() : play());

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.wrap, { bottom: insets.bottom + 64 }]}
    >
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/mediaLibraryModal',
            params: { connectionId: session.connectionId },
          })
        }
      >
        <View style={styles.main}>
          <View style={styles.header}>
            <Icon name={isDownloading ? 'download' : 'play'} size={16} color={NAVY} />
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
              {session.name}
            </ThemedText>
          </View>
          <MediaProgressBar fraction={fraction} color={isDownloading ? NAVY : SKY} />
          <ThemedText style={styles.status} numberOfLines={1}>
            {sessionStatusText(session, downloadProgress, positionMs)}
          </ThemedText>
        </View>

        {!isDownloading && session.status !== 'error' && (
          <TouchableOpacity
            onPress={onTogglePlay}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel={isPlaying ? 'Stop' : 'Play'}
          >
            <Icon name={isPlaying ? 'stop' : 'play'} size={20} color={NAVY} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={dismissPlayer}
          hitSlop={8}
          style={styles.iconBtn}
          accessibilityLabel="Dismiss"
        >
          <Icon name="x" size={22} color={RED} />
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 15,
    right: 15,
  },
  // Matches the Card look used across the app (white, 2px sky border, offset shadow).
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    boxShadow: '-3px 3px 0px #38ACDD',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: SKY,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  main: { flex: 1, marginRight: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  title: { flexShrink: 1, fontSize: 16, lineHeight: 22 },
  status: { fontSize: 13, color: SUBTLE, marginTop: 4 },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
