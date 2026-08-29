import { StyleSheet, View } from 'react-native';

import type { MediaSession } from '@/contexts/MediaSessionContext';

const SKY = '#38ACDD';

export function formatMs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function sessionStatusText(
  session: MediaSession,
  downloadProgress: number,
  positionMs: number,
): string {
  if (session.status === 'downloading') {
    return `Downloading… ${Math.round(downloadProgress * 100)}%`;
  }
  if (session.status === 'error') {
    return session.error ?? 'Could not load';
  }
  return `${formatMs(positionMs)} / ${formatMs(session.durationMs)}`;
}

export function MediaProgressBar({ fraction, color = SKY }: { fraction: number; color?: string }) {
  const pct = `${Math.max(0, Math.min(1, fraction)) * 100}%` as const;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: pct, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5E6F2',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});
