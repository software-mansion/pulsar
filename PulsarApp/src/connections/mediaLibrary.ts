import AsyncStorage from '@react-native-async-storage/async-storage';
// The legacy API is the progress-capable download surface (createDownloadResumable) and
// exposes documentDirectory directly. SDK 54 keeps it under this subpath.
import * as FileSystem from 'expo-file-system/legacy';
import type { Pattern } from 'react-native-pulsar';

/**
 * The phone's on-device library of media-backed haptics received from a Studio connection.
 *
 * Two stores, kept in step:
 *   - an AsyncStorage INDEX, `connectionId -> ResourceRecord[]` (small metadata), and
 *   - the CLIP FILES under documentDirectory (persistent — survives restarts, unlike the
 *     cache directory the OS may evict).
 *
 * Retention is scoped to the connection: a connection's clips live as long as the
 * connection row does (`purgeConnection` on remove), plus a per-resource manual delete.
 */

export type MediaKind = 'audio' | 'animation';

export interface ResourceRecord {
  /** Stable identity = the Studio preset id. A re-push with a new version replaces it. */
  resourceId: string;
  name: string;
  kind: MediaKind;
  /** Content hash from Studio; the dedupe key that decides re-download vs reuse. */
  version: string;
  /** Addresses the delivered bytes (content hash / source id) — the on-disk filename. */
  clipId: string;
  /** `file://` path to the downloaded clip. */
  localUri: string;
  contentType: string;
  sizeBytes: number;
  durationMs: number;
  /** The haptic pattern to play. */
  pattern: Pattern;
  volume?: number;
  offset?: number;
  /** Trim window into the audio file, ms (absent = whole file). Played by the SDK natively. */
  soundStartMs?: number;
  soundDurationMs?: number;
  receivedAt: number;
}

const STORAGE_KEY = 'pulsar:media-library';
const MEDIA_ROOT = `${FileSystem.documentDirectory ?? ''}pulsar-media/`;

type LibraryIndex = Record<string, ResourceRecord[]>;

async function readIndex(): Promise<LibraryIndex> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as LibraryIndex) : {};
  } catch {
    return {};
  }
}

async function writeIndex(index: LibraryIndex): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(index));
  } catch {
    // Storage disabled/full — the session still works in memory this run.
  }
}

/** Map a stored content-type to a filename extension for the on-disk clip. */
export function extForContentType(contentType: string): string {
  if (/wav/i.test(contentType)) return 'wav';
  if (/mpeg|mp3/i.test(contentType)) return 'mp3';
  if (/zip/i.test(contentType)) return 'lottie';
  if (/json/i.test(contentType)) return 'json';
  return 'bin';
}

const connectionDir = (connectionId: string) => `${MEDIA_ROOT}${connectionId}/`;

export function localPathFor(connectionId: string, clipId: string, ext: string): string {
  return `${connectionDir(connectionId)}${clipId}.${ext}`;
}

/** Create a connection's media directory if it isn't there yet. Idempotent. */
async function ensureConnectionDir(connectionId: string): Promise<void> {
  const dir = connectionDir(connectionId);
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

async function fileExists(uri: string): Promise<boolean> {
  try {
    return (await FileSystem.getInfoAsync(uri)).exists;
  } catch {
    return false;
  }
}

async function deleteFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Already gone is fine.
  }
}

/** The resources cached for a connection, most-recent first. */
export async function listResources(connectionId: string): Promise<ResourceRecord[]> {
  const index = await readIndex();
  return [...(index[connectionId] ?? [])].sort((a, b) => b.receivedAt - a.receivedAt);
}

/** The cached record for a resource, or undefined. */
export async function getResource(
  connectionId: string,
  resourceId: string,
): Promise<ResourceRecord | undefined> {
  const index = await readIndex();
  return (index[connectionId] ?? []).find((r) => r.resourceId === resourceId);
}

/**
 * Download a clip to its persistent path, reporting progress, and return the local uri.
 * Skips the network entirely when a file for this exact clip already exists on disk.
 */
export async function downloadClip(
  connectionId: string,
  clipId: string,
  ext: string,
  url: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  await ensureConnectionDir(connectionId);
  const dest = localPathFor(connectionId, clipId, ext);
  if (await fileExists(dest)) {
    onProgress?.(1);
    return dest;
  }
  const task = FileSystem.createDownloadResumable(url, dest, {}, (p) => {
    if (p.totalBytesExpectedToWrite > 0) {
      onProgress?.(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  });
  const result = await task.downloadAsync();
  if (!result) throw new Error('Download did not complete');
  return result.uri;
}

/**
 * Insert or replace a resource by (connectionId, resourceId). If a record with the same
 * resourceId but a DIFFERENT clip already existed, its stale file is deleted so an edited
 * design doesn't leave the old clip on disk forever.
 */
export async function upsertResource(
  connectionId: string,
  record: ResourceRecord,
): Promise<void> {
  const index = await readIndex();
  const list = index[connectionId] ?? [];
  const previous = list.find((r) => r.resourceId === record.resourceId);
  if (previous && previous.localUri !== record.localUri) {
    await deleteFile(previous.localUri);
  }
  index[connectionId] = [...list.filter((r) => r.resourceId !== record.resourceId), record];
  await writeIndex(index);
}

/** Remove one resource: its file and its index entry. */
export async function removeResource(connectionId: string, resourceId: string): Promise<void> {
  const index = await readIndex();
  const list = index[connectionId] ?? [];
  const target = list.find((r) => r.resourceId === resourceId);
  if (target) await deleteFile(target.localUri);
  index[connectionId] = list.filter((r) => r.resourceId !== resourceId);
  await writeIndex(index);
}

/** Drop everything for a connection — its whole directory and all its index entries. */
export async function purgeConnection(connectionId: string): Promise<void> {
  await deleteFile(connectionDir(connectionId));
  const index = await readIndex();
  if (index[connectionId]) {
    delete index[connectionId];
    await writeIndex(index);
  }
}
