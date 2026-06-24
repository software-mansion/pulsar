import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import type { Connection, ConnectionStatus } from '@/contexts/ConnectionsContext';

function statusColor(status: ConnectionStatus): string {
  if (status === 'connected') return '#57B495';
  if (status === 'connecting' || status === 'waiting') return '#38ACDD';
  return '#FF6259';
}

function statusLabel(status: ConnectionStatus): string {
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

export default function ConnectionRow({
  connection,
  onRemove,
  onReconnect,
  onOpenPreview,
}: {
  connection: Connection;
  onRemove: () => void;
  onReconnect: () => void;
  onOpenPreview?: () => void;
}) {
  const { name, status, token } = connection;
  // Retry reinitialises the link (tears the socket down and re-opens from the
  // token). Only meaningful once a token exists — i.e. the pairing succeeded
  // at least once; a brand-new connection still negotiating has nothing to reuse.
  const canRetry = !!token;

  return (
    <Card style={styles.connCard}>
      <View style={styles.connRow}>
        <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
        <View style={styles.connInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {name}
          </ThemedText>
          {status !== 'connected' && (
            <ThemedText style={styles.statusTextSmall} numberOfLines={1}>
              {statusLabel(status)}
            </ThemedText>
          )}
        </View>
        {onOpenPreview && (
          <TouchableOpacity onPress={onOpenPreview} hitSlop={8} style={styles.iconBtn}>
            <Icon name="figma" size={20} color="#001A72" />
          </TouchableOpacity>
        )}
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connInfo: {
    flex: 1,
    marginRight: 8,
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
