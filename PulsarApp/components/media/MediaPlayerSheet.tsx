import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import LottieCanvas from '@/components/media/LottieCanvas';
import { ThemedText } from '@/components/themed-text';
import { useMediaSession } from '@/contexts/MediaSessionContext';
import { connectionDisplayName, useConnections } from '@/contexts/ConnectionsContext';
import type { ResourceRecord } from '@/src/connections/mediaLibrary';

const NAVY = '#001A72';
const SKY = '#38ACDD';
const SUBTLE = '#496695';

function formatMs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** A neo-brutalist progress/scrubber bar; `fraction` 0..1. */
function ProgressBar({ fraction, color = SKY }: { fraction: number; color?: string }) {
  const pct = `${Math.max(0, Math.min(1, fraction)) * 100}%` as const;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: pct, backgroundColor: color }]} />
    </View>
  );
}

function RoundButton({
  icon,
  onPress,
  label,
  tint = NAVY,
  disabled,
}: {
  icon: 'play' | 'stop' | 'refresh-cw' | 'x' | 'download' | 'arrow';
  onPress: () => void;
  label: string;
  tint?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityLabel={label}
      style={[styles.roundBtn, disabled && styles.roundBtnDisabled]}
    >
      <Icon name={icon} size={20} color={tint} />
    </TouchableOpacity>
  );
}

/**
 * The device player for media-backed haptics received from Studio. Two faces of one
 * component (see MediaSessionContext): a pinned mini-player that appears on an incoming
 * push, and — when a Studio connection is tapped — a full-screen library sheet listing
 * that connection's cached resources, each replayable/deletable. Non-blocking, dismissible.
 */
export default function MediaPlayerSheet() {
  const {
    session,
    downloadProgress,
    positionMs,
    openConnectionId,
    library,
    openConnection,
    collapse,
    closeSheet,
    playResource,
    repeat,
    stop,
    removeResource,
  } = useMediaSession();
  const { connections } = useConnections();
  const insets = useSafeAreaInsets();

  const connectionName = useMemo(() => {
    const c = connections.find((x) => x.id === openConnectionId);
    return c ? connectionDisplayName(c) : 'Connection';
  }, [connections, openConnectionId]);

  const isDownloading = session?.status === 'downloading';
  const isPlaying = session?.status === 'playing';
  const fraction = isDownloading
    ? downloadProgress
    : session && session.durationMs > 0
      ? positionMs / session.durationMs
      : 0;

  const statusText = session
    ? session.status === 'downloading'
      ? `Downloading… ${Math.round(downloadProgress * 100)}%`
      : session.status === 'error'
        ? session.error ?? 'Could not load'
        : `${formatMs(isPlaying ? positionMs : session.durationMs)} / ${formatMs(session.durationMs)}`
    : '';

  if (!session && !openConnectionId) return null;

  const onTogglePlay = () => {
    if (isPlaying) stop();
    else repeat(); // replay the current record from the top
  };

  return (
    <>
      {/* Mini-player: pinned above the tab bar, shown whenever there's an active session
          and the full library isn't open. */}
      {session && !openConnectionId && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={[styles.miniWrap, { bottom: insets.bottom + 64 }]}
        >
          <Pressable style={styles.mini} onPress={() => openConnection(session.connectionId)}>
            <View style={styles.miniMain}>
              <View style={styles.miniHeader}>
                <Icon name={isDownloading ? 'download' : 'play'} size={16} color={NAVY} />
                <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.miniTitle}>
                  {session.name}
                </ThemedText>
              </View>
              <ProgressBar fraction={fraction} color={isDownloading ? NAVY : SKY} />
              <ThemedText style={styles.miniStatus} numberOfLines={1}>
                {statusText}
              </ThemedText>
            </View>
            {!isDownloading && session.status !== 'error' && (
              <>
                <RoundButton icon={isPlaying ? 'stop' : 'play'} onPress={onTogglePlay} label="Play/stop" />
                <RoundButton icon="refresh-cw" onPress={repeat} label="Repeat" />
              </>
            )}
            <RoundButton icon="x" onPress={closeSheet} label="Close" tint="#FF6259" />
          </Pressable>
        </Animated.View>
      )}

      {/* Library: full-screen sheet listing the connection's cached resources. */}
      <Modal
        visible={!!openConnectionId}
        transparent
        animationType="slide"
        onRequestClose={collapse}
      >
        <Pressable style={styles.backdrop} onPress={collapse} />
        <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <ThemedText type="subtitle">Haptics library</ThemedText>
              <ThemedText style={styles.panelSubtitle}>{connectionName}</ThemedText>
            </View>
            <RoundButton icon="x" onPress={collapse} label="Collapse" />
          </View>

          {/* The Lottie canvas, for an animation resource that's downloaded — its
              playhead is driven by the same clock as the haptics. */}
          {session?.kind === 'animation' && session.localUri && (
            <LottieCanvas uri={session.localUri} progress={fraction} />
          )}

          {/* The active player, when something is loaded. */}
          {session && (
            <View style={styles.nowPlaying}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {session.name}
              </ThemedText>
              <ProgressBar fraction={fraction} color={isDownloading ? NAVY : SKY} />
              <View style={styles.nowPlayingRow}>
                <ThemedText style={styles.miniStatus}>{statusText}</ThemedText>
                <View style={styles.controls}>
                  {!isDownloading && session.status !== 'error' && (
                    <>
                      <RoundButton icon={isPlaying ? 'stop' : 'play'} onPress={onTogglePlay} label="Play/stop" />
                      <RoundButton icon="refresh-cw" onPress={repeat} label="Repeat" />
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          <ThemedText style={styles.listLabel}>Saved on this device</ThemedText>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {library.length === 0 ? (
              <ThemedText style={styles.empty}>
                Nothing yet. Play an audio- or animation-based haptic from Studio and it appears here.
              </ThemedText>
            ) : (
              library.map((record) => (
                <ResourceRow
                  key={record.resourceId}
                  record={record}
                  active={session?.resourceId === record.resourceId}
                  onPlay={() =>
                    openConnectionId && playResource(openConnectionId, record.resourceId)
                  }
                  onDelete={() =>
                    openConnectionId && removeResource(openConnectionId, record.resourceId)
                  }
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
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
    <View style={[styles.resourceRow, active && styles.resourceRowActive]}>
      <Icon name={record.kind === 'animation' ? 'sparkles' : 'play'} size={16} color={NAVY} />
      <View style={styles.resourceInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {record.name}
        </ThemedText>
        <ThemedText style={styles.resourceMeta}>
          {record.kind === 'animation' ? 'Animation' : 'Audio'} · {formatMs(record.durationMs)}
        </ThemedText>
      </View>
      <RoundButton icon="play" onPress={onPlay} label="Play" />
      <RoundButton icon="x" onPress={onDelete} label="Delete" tint="#FF6259" />
    </View>
  );
}

const brutalist = {
  borderWidth: 2,
  borderColor: NAVY,
  shadowColor: SKY,
  shadowOffset: { width: -3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
} as const;

const styles = StyleSheet.create({
  miniWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...brutalist,
  },
  miniMain: { flex: 1 },
  miniHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  miniTitle: { flexShrink: 1, fontSize: 15, lineHeight: 20 },
  miniStatus: { fontSize: 12, color: SUBTLE, marginTop: 4 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5E6F2',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FB',
    borderWidth: 2,
    borderColor: NAVY,
  },
  roundBtnDisabled: { opacity: 0.4 },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,26,114,0.25)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    backgroundColor: '#E1F3FA',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 2,
    borderColor: NAVY,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelHeaderText: { flex: 1 },
  panelSubtitle: { fontSize: 13, color: SUBTLE, marginTop: 2 },
  nowPlaying: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    ...brutalist,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controls: { flexDirection: 'row', gap: 8 },
  listLabel: { fontSize: 13, color: SUBTLE, marginTop: 18, marginBottom: 6 },
  list: { marginBottom: 4 },
  listContent: { gap: 8, paddingBottom: 8 },
  empty: { color: SUBTLE, fontSize: 14, lineHeight: 20, paddingVertical: 12 },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: NAVY,
  },
  resourceRowActive: { backgroundColor: '#F0F8FF', borderColor: SKY },
  resourceInfo: { flex: 1 },
  resourceMeta: { fontSize: 12, color: SUBTLE, marginTop: 2 },
});
