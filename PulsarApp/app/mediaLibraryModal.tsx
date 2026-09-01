import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import LottieCanvas from '@/components/media/LottieCanvas';
import PatternCanvas from '@/components/media/PatternCanvas';
import { formatMs, sessionStatusText } from '@/components/media/MediaProgress';
import MediaScrubber from '@/components/media/MediaScrubber';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { Margins } from '@/constants/theme';
import { connectionDisplayName, useConnections } from '@/contexts/ConnectionsContext';
import { useMediaSession } from '@/contexts/MediaSessionContext';
import type { MediaKind, ResourceRecord } from '@/src/connections/mediaLibrary';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const RED = '#FF6259';

const KIND_ICON: Record<MediaKind, IconName> = {
  audio: 'play',
  animation: 'sparkles',
  pattern: 'record',
};
const KIND_LABEL: Record<MediaKind, string> = {
  audio: 'Audio',
  animation: 'Animation',
  pattern: 'Pattern',
};

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
    playFromPlayhead,
    seek,
    pause,
    stop,
  } = useMediaSession();
  const { connections } = useConnections();

  const connection = connections.find((c) => c.id === connectionId);
  const [draggedToMs, setDraggedToMs] = useState<number | null>(null);

  useEffect(() => {
    if (!connectionId) return;
    openLibrary(connectionId);
    return () => closeLibrary(connectionId);
  }, [connectionId, openLibrary, closeLibrary]);

  const active = session && session.connectionId === connectionId ? session : null;
  const isDownloading = active?.status === 'downloading';
  const isPlaying = active?.status === 'playing';
  const shownPositionMs = draggedToMs ?? positionMs;
  const fraction = useMemo(() => {
    if (!active) return 0;
    if (active.status === 'downloading') return downloadProgress;
    return active.durationMs > 0 ? shownPositionMs / active.durationMs : 0;
  }, [active, downloadProgress, shownPositionMs]);

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
                {active.kind === 'pattern' && (
                  <PatternCanvas
                    pattern={active.pattern}
                    durationMs={active.durationMs}
                    progress={fraction}
                  />
                )}

                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {active.name}
                </ThemedText>
                <View style={Margins.marginTop1X}>
                  <MediaScrubber
                    positionMs={positionMs}
                    durationMs={active.durationMs}
                    color={isDownloading ? NAVY : SKY}
                    disabled={isDownloading || active.status === 'error'}
                    onScrub={setDraggedToMs}
                    onSeek={seek}
                  />
                </View>
                <ThemedText style={styles.meta}>
                  {sessionStatusText(active, downloadProgress, shownPositionMs)}
                </ThemedText>

                {!isDownloading && active.status !== 'error' && (
                  <View style={[styles.transport, Margins.marginTop3X]}>
                    <Button
                      label={isPlaying ? 'Pause' : 'Play'}
                      showIcon={isPlaying ? 'stop' : 'play'}
                      style={styles.transportPrimary}
                      // A confirmation chip would fight the pattern this press starts.
                      disableHaptics
                      onClick={() => (isPlaying ? pause() : playFromPlayhead())}
                    />
                    <TouchableOpacity
                      onPress={stop}
                      disabled={!isPlaying && positionMs === 0}
                      style={[
                        styles.stopButton,
                        !isPlaying && positionMs === 0 && styles.stopButtonDisabled,
                      ]}
                      accessibilityLabel="Stop"
                    >
                      <Icon name="square" size={20} color={RED} />
                    </TouchableOpacity>
                  </View>
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
                  Nothing yet. Play a preset from Studio and it appears here.
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
          <Icon name={KIND_ICON[record.kind]} size={18} color={NAVY} />
          <View style={styles.resourceInfo}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {record.name}
            </ThemedText>
            <ThemedText style={styles.meta} numberOfLines={1}>
              {KIND_LABEL[record.kind]} · {formatMs(record.durationMs)}
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
  transport: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  transportPrimary: {
    flex: 1,
  },
  stopButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: RED,
    boxShadow: '-3px 3px 0px #FF6259',
  },
  stopButtonDisabled: {
    opacity: 0.4,
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
