import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Card from '@/components/Card';
import { Icon } from '@/components/Icon';
import Input from '@/components/Input';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import {
  connectionDisplayName,
  connectionType,
  useConnections,
} from '@/contexts/ConnectionsContext';
import { statusLabel } from '@/components/home/ConnectionRow';

function formatCreatedAt(ms: number): string {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '—';
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.detailValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function EditConnectionModal() {
  const params = useLocalSearchParams<{ connectionId?: string }>();
  const connectionId = typeof params.connectionId === 'string' ? params.connectionId : '';
  const { connections, rename } = useConnections();
  const connection = connections.find((c) => c.id === connectionId);

  // Seed the field with whatever is currently shown for this connection.
  const [name, setName] = useState(connection ? connectionDisplayName(connection) : '');

  const handleSave = () => {
    if (connection) rename(connection.id, name);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Connection</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Icon name="x" size={28} color="#001A72" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!connection ? (
          <Card style={Margins.marginTop2X}>
            <ThemedText>This connection is no longer available.</ThemedText>
          </Card>
        ) : (
          <>
            <Card>
              <ThemedText type="defaultSemiBold">Name</ThemedText>
              <ThemedText style={[styles.help, Margins.marginTop2X]}>
                Choose a label for this connection. Leave blank to use the default name.
              </ThemedText>
              <Input
                placeholder="Connection name"
                style={Margins.marginTop3X}
                value={name}
                onChangeText={setName}
                keyboardType="default"
                autoCapitalize="sentences"
                autoCorrect
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Button label="Save" style={Margins.marginTop3X} onClick={handleSave} />
            </Card>

            <Card style={Margins.marginTop4X}>
              <ThemedText type="defaultSemiBold">Details</ThemedText>
              <View style={Margins.marginTop2X}>
                <DetailRow
                  label="Type"
                  value={connectionType(connection) === 'figma' ? 'Figma' : 'Browser'}
                />
                <DetailRow label="Status" value={statusLabel(connection.status)} />
                <DetailRow label="Created" value={formatCreatedAt(connection.createdAt)} />
                <DetailRow
                  label="Live preview"
                  value={connection.previewToken ? 'Available' : 'Not available'}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  closeButton: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  help: {
    fontSize: 14,
    color: '#496695',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEEF5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#496695',
    marginRight: 12,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
