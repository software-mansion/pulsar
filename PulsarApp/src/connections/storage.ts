import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Connection, PersistedConnection } from './types';

// Where the list of paired producers is persisted. Replaces the single-token
// `connectionToken` key the pre-multi-connection app used; that legacy key is
// migrated into this list once on first launch (see `loadPersistedConnections`).
const STORAGE_KEY = 'connections';
const LEGACY_TOKEN_KEY = 'connectionToken';

export async function loadPersistedConnections(newId: () => string): Promise<Connection[]> {
  let persisted: PersistedConnection[] = [];
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) persisted = JSON.parse(raw);
  } catch {
    persisted = [];
  }

  if (persisted.length === 0) {
    // One-time migration from the pre-multi-connection single token, so an
    // already-paired install keeps working after the update.
    try {
      const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
      if (legacy && legacy.length > 0) {
        persisted = [{ id: newId(), token: legacy, name: 'Saved device', createdAt: Date.now() }];
      }
    } catch {
      // ignore — nothing to migrate
    }
  }

  return persisted.map((p) => ({
    id: p.id,
    token: p.token,
    name: p.name,
    previewToken: p.previewToken,
    producerType: p.producerType,
    figmaProjectName: p.figmaProjectName,
    customName: p.customName,
    createdAt: p.createdAt ?? Date.now(),
    status: 'connecting',
  }));
}

export function persistConnections(connections: Connection[]): void {
  const toPersist: PersistedConnection[] = connections
    .filter((c) => c.token)
    .map((c) => ({
      id: c.id,
      token: c.token as string,
      name: c.name,
      createdAt: c.createdAt,
      ...(c.previewToken ? { previewToken: c.previewToken } : {}),
      ...(c.producerType ? { producerType: c.producerType } : {}),
      ...(c.figmaProjectName ? { figmaProjectName: c.figmaProjectName } : {}),
      ...(c.customName ? { customName: c.customName } : {}),
    }));
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist)).catch(() => {});
}
