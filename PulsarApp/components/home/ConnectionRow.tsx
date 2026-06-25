import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import {
  connectionDisplayName,
  connectionType,
  type Connection,
  type ConnectionStatus,
} from '@/contexts/ConnectionsContext';

function statusColor(status: ConnectionStatus): string {
  if (status === 'connected') return '#57B495';
  if (status === 'connecting' || status === 'waiting') return '#38ACDD';
  return '#FF6259';
}

export function statusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting…';
    case 'waiting':
      return 'Waiting for connection…';
    case 'offline':
      return 'Offline';
    case 'error':
      return 'Couldn’t connect';
  }
}

// A small text badge distinguishing a Figma producer from a plain browser one.
// Text-only (no icon): the row already carries a Figma glyph in its open-preview
// button, so an icon here would be a redundant second indicator.
function TypeChip({ type }: { type: 'figma' | 'browser' }) {
  const isFigma = type === 'figma';
  return (
    <View style={[styles.chip, isFigma ? styles.chipFigma : styles.chipBrowser]}>
      <ThemedText style={[styles.chipText, isFigma ? styles.chipTextFigma : styles.chipTextBrowser]}>
        {isFigma ? 'Figma' : 'Browser'}
      </ThemedText>
    </View>
  );
}

export default function ConnectionRow({
  connection,
  onRemove,
  onReconnect,
  onOpenPreview,
  onEdit,
}: {
  connection: Connection;
  onRemove: () => void;
  onReconnect: () => void;
  onOpenPreview?: () => void;
  // Long-press handler: opens the edit/details modal for this connection.
  onEdit?: () => void;
}) {
  const { status, token } = connection;
  const type = connectionType(connection);
  const name = connectionDisplayName(connection);
  // Retry reinitialises the link (tears the socket down and re-opens from the
  // token). Only meaningful once a token exists — i.e. the pairing succeeded
  // at least once; a brand-new connection still negotiating has nothing to reuse.
  const canRetry = !!token;
  const isFigma = type === 'figma';

  // Tapping the row body opens the Figma preview (when one is available). A
  // long-press anywhere on the body opens the edit modal. A Figma row that can
  // be opened advertises that in its subtitle in stable states (connected or
  // offline); transient/problem states show the status instead.
  const canOpenFigma = isFigma && !!onOpenPreview;
  const sublabel =
    canOpenFigma && (status === 'connected' || status === 'offline')
      ? 'Click to open figma preview'
      : status !== 'connected'
        ? statusLabel(status)
        : null;

  return (
    <Card style={styles.connCard}>
      <View style={styles.connRow}>
        <TouchableOpacity
          style={styles.pressArea}
          onPress={isFigma ? onOpenPreview : undefined}
          onLongPress={onEdit}
          delayLongPress={350}
          disabled={!onEdit && !(isFigma && onOpenPreview)}
          activeOpacity={0.6}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
          <View style={styles.connInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name}>
                {name}
              </ThemedText>
              <TypeChip type={type} />
            </View>
            {sublabel && (
              <ThemedText style={styles.statusTextSmall} numberOfLines={1}>
                {sublabel}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
        {canRetry && (
          <TouchableOpacity
            onPress={onReconnect}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Reload connection"
          >
            <Icon name="refresh-cw" size={20} color="#001A72" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.iconBtn}>
          <Icon name="x" size={22} color="#FF6259" />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  connCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chipFigma: {
    backgroundColor: '#E6ECFF',
  },
  chipBrowser: {
    backgroundColor: '#EAEEF5',
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14,
  },
  chipTextFigma: {
    color: '#001A72',
  },
  chipTextBrowser: {
    color: '#496695',
  },
  statusTextSmall: {
    fontSize: 13,
    color: '#496695',
    marginTop: 1,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
