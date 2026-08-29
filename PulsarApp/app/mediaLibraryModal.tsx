import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import LottieCanvas from '@/components/media/LottieCanvas';
import { MediaProgressBar, formatMs, sessionStatusText } from '@/components/media/MediaProgress';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { Margins } from '@/constants/theme';
import { connectionDisplayName, useConnections } from '@/contexts/ConnectionsContext';
import { useMediaSession } from '@/contexts/MediaSessionContext';
import type { ResourceRecord } from '@/src/connections/mediaLibrary';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const RED = '#FF6259';

/**
 * A connection's media-haptics library: the player for whatever is loaded, plus the
 * resources cached on this device — each replayable without Studio pushing again.
 * Opened by tapping a Studio connection on Home, or the mini-player.
 */
export default function MediaLibraryModal() {
  const params = useLocalSearchParams<{ connectionId?: string }>();
  const connectionId = typeof params.connectionId === 'string' ? params.connectionId : '';

  const {
    session,
    downloadProgress,
    positionMs,
    library,
    openLibrary,
    closeLibrary,
    playResource,
    removeResource,
    repeat,
    stop,
  } = useMediaSession();
  const { connections } = useConnections();

  const connection = connections.find((c) => c.id === connectionId);

  // The library is loaded for as long as this screen is mounted — dismissing it (button,
  // swipe or back) tears the state down through the cleanup.
  useEffect(() => {
    if (!connectionId) return;
    openLibrary(connectionId);
    return () => closeLibrary();
  }, [connectionId, openLibrary, closeLibrary]);

  // Only this connection's session belongs on this screen.
  const active = session && session.connectionId === connectionId ? session : null;
  const isDownloading = active?.status === 'downloading';
  const isPlaying = active?.status === 'playing';
  const fraction = useMemo(() => {
    if (!active) return 0;
    if (active.status === 'downloading') return downloadProgress;
    return active.durationMs > 0 ? positionMs / active.durationMs : 0;
  }, [active, downloadProgress, positionMs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">Haptics library</ThemedText>
          <ThemedText style={styles.headerSubtitle} numberOfLines={1}>
            {connection ? connectionDisplayName(connection) : 'Connection'}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Icon name="x" size={28} color={NAVY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!connection ? (
          <Card>
            <ThemedText>This connection is no longer available.</ThemedText>
          </Card>
        ) : (
          <>
            {active && (
              <Card>
                {/* The Lottie canvas for a downloaded animation — its playhead runs off the
                    same clock as the haptics. */}
                {active.kind === 'animation' && active.localUri && (
                  <LottieCanvas uri={active.localUri} progress={fraction} />
                )}

                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {active.name}
                </ThemedText>
                <View style={Margins.marginTop2X}>
                  <MediaProgressBar fraction={fraction} color={isDownloading ? NAVY : SKY} />
                </View>
                <ThemedText style={[styles.meta, Margins.marginTop1X]}>
                  {sessionStatusText(active, downloadProgress, positionMs)}
                </ThemedText>

                {!isDownloading && active.status !== 'error' && (
                  <Button
                    label={isPlaying ? 'Stop' : 'Play'}
                    showIcon={isPlaying ? 'stop' : 'play'}
                    style={Margins.marginTop3X}
                    // The press starts the media pattern on its own composer; a confirmation
                    // chip on top of it would fight the very haptics being played.
                    disableHaptics
                    onClick={() => (isPlaying ? stop() : repeat())}
                  />
                )}
              </Card>
            )}

            <Collapsible
              title={`Saved on this device${library.length ? ` (${library.length})` : ''}`}
              defaultOpen
              style={active ? Margins.marginTop4X : undefined}
            >
              {library.length === 0 ? (
                <ThemedText style={[styles.meta, Margins.marginTop1X]}>
                  Nothing yet. Play an audio- or animation-based haptic from Studio and it appears
                  here.
                </ThemedText>
              ) : (
                library.map((record) => (
                  <ResourceRow
                    key={record.resourceId}
                    record={record}
                    active={active?.resourceId === record.resourceId}
                    onPlay={() => playResource(connectionId, record.resourceId)}
                    onDelete={() => removeResource(connectionId, record.resourceId)}
                  />
                ))
              )}
            </Collapsible>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** One cached resource. Tapping the row plays it — mirroring how a connection row opens. */
function ResourceRow({
  record,
  active,
  onPlay,
  onDelete,
}: {
  record: ResourceRecord;
  active: boolean;
  onPlay: () => void;
  onDelete: () => void;
}) {
  return (
    <Card style={[styles.resourceCard, active && styles.resourceCardActive]}>
      <View style={styles.resourceRow}>
        <TouchableOpacity style={styles.pressArea} onPress={onPlay} activeOpacity={0.6}>
          <Icon name={record.kind === 'animation' ? 'sparkles' : 'play'} size={18} color={NAVY} />
          <View style={styles.resourceInfo}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {record.name}
            </ThemedText>
            <ThemedText style={styles.meta} numberOfLines={1}>
              {record.kind === 'animation' ? 'Animation' : 'Audio'} · {formatMs(record.durationMs)}
            </ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={8}
          style={styles.iconBtn}
          accessibilityLabel="Delete"
        >
          <Icon name="x" size={22} color={RED} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#B5E1F1',
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#496695',
  },
  closeButton: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  meta: {
    fontSize: 14,
    color: '#496695',
  },
  resourceCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  resourceCardActive: {
    backgroundColor: '#F2FAFE',
    borderColor: NAVY,
    boxShadow: '-3px 3px 0px #001A72',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
