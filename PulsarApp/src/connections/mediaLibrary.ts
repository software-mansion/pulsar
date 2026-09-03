import AsyncStorage from '@react-native-async-storage/async-storage';
// The legacy API is the progress-capable download surface (createDownloadResumable) and
// exposes documentDirectory directly. SDK 54 keeps it under this subpath.
import * as FileSystem from 'expo-file-system/legacy';
import type { Pattern } from 'react-native-pulsar';

/**
 * The phone's on-device library of haptics received from a Studio connection — a plain
 * pattern, or one scored to an audio clip or a Lottie animation.
 *
 * Two stores, kept in step:
 *   - an AsyncStorage INDEX, `connectionId -> ResourceRecord[]` (small metadata), and
 *   - the CLIP FILES under documentDirectory (persistent — survives restarts, unlike the
 *     cache directory the OS may evict).
 *
 * Clip paths are stored relative to the media root because iOS moves the app container
 * between installs, which strands every absolute uri written before the move.
 *
 * Retention is scoped to the connection: a connection's clips live as long as the
 * connection row does (`purgeConnection` on remove), plus a per-resource manual delete.
 */

/** A `pattern` record is haptics only — it has none of the clip fields below. */
export type MediaKind = 'audio' | 'animation' | 'pattern';

export interface ResourceRecord {
  /** Stable identity = the Studio preset id. A re-push with a new version replaces it. */
  resourceId: string;
  name: string;
  kind: MediaKind;
  /** Content hash from Studio; the dedupe key that decides re-download vs reuse. */
  version: string;
  /** Addresses the delivered bytes (content hash / source id) — the on-disk filename. */
  clipId?: string;
  /** Relative to the media root, e.g. `conn-1/abc123.json`. */
  clipPath?: string;
  /** Derived from `clipPath` on read, never stored. */
  localUri?: string;
  contentType?: string;
  sizeBytes?: number;
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
const MEDIA_DIR = 'pulsar-media/';

const mediaRoot = () => `${FileSystem.documentDirectory ?? ''}${MEDIA_DIR}`;

type LibraryIndex = Record<string, ResourceRecord[]>;

function clipPathWithinAbsoluteUri(uri: string | undefined): string | undefined {
  const at = uri?.indexOf(MEDIA_DIR);
  return uri != null && at != null && at >= 0 ? uri.slice(at + MEDIA_DIR.length) : undefined;
}

function clipPathOf(record: ResourceRecord): string | undefined {
  return record.clipPath ?? clipPathWithinAbsoluteUri(record.localUri);
}

function withUriForThisInstall(record: ResourceRecord): ResourceRecord {
  const clipPath = clipPathOf(record);
  return clipPath
    ? { ...record, clipPath, localUri: clipUri(clipPath) }
    : { ...record, localUri: undefined };
}

function withoutDerivedUri(record: ResourceRecord): ResourceRecord {
  const { localUri: _derived, ...stored } = record;
  return stored;
}

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

export function clipPathFor(connectionId: string, clipId: string, ext: string): string {
  return `${connectionId}/${clipId}.${ext}`;
}

export function clipUri(clipPath: string): string {
  return `${mediaRoot()}${clipPath}`;
}

/** Create a connection's media directory if it isn't there yet. Idempotent. */
async function ensureConnectionDir(connectionId: string): Promise<void> {
  const dir = `${mediaRoot()}${connectionId}/`;
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

export async function clipIsOnDisk(record: ResourceRecord): Promise<boolean> {
  const clipPath = clipPathOf(record);
  return clipPath ? fileExists(clipUri(clipPath)) : false;
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
  return [...(index[connectionId] ?? [])]
    .sort((a, b) => b.receivedAt - a.receivedAt)
    .map(withUriForThisInstall);
}

/** The cached record for a resource, or undefined. */
export async function getResource(
  connectionId: string,
  resourceId: string,
): Promise<ResourceRecord | undefined> {
  const index = await readIndex();
  const record = (index[connectionId] ?? []).find((r) => r.resourceId === resourceId);
  return record && withUriForThisInstall(record);
}

/** Downloads to the clip's persistent path, or reuses the file already there. */
export async function downloadClip(
  connectionId: string,
  clipId: string,
  ext: string,
  url: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  await ensureConnectionDir(connectionId);
  const clipPath = clipPathFor(connectionId, clipId, ext);
  const dest = clipUri(clipPath);
  if (await fileExists(dest)) {
    onProgress?.(1);
    return clipPath;
  }
  const task = FileSystem.createDownloadResumable(url, dest, {}, (p) => {
    if (p.totalBytesExpectedToWrite > 0) {
      onProgress?.(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  });
  const result = await task.downloadAsync();
  if (!result) throw new Error('Download did not complete');
  return clipPath;
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
  const previousClipPath = previous && clipPathOf(previous);
  if (previousClipPath && previousClipPath !== record.clipPath) {
    await deleteFile(clipUri(previousClipPath));
  }
  index[connectionId] = [
    ...list.filter((r) => r.resourceId !== record.resourceId),
    withoutDerivedUri(record),
  ];
  await writeIndex(index);
}

/** Remove one resource: its file and its index entry. */
export async function removeResource(connectionId: string, resourceId: string): Promise<void> {
  const index = await readIndex();
  const list = index[connectionId] ?? [];
  const target = list.find((r) => r.resourceId === resourceId);
  const targetClipPath = target && clipPathOf(target);
  if (targetClipPath) await deleteFile(clipUri(targetClipPath));
  index[connectionId] = list.filter((r) => r.resourceId !== resourceId);
  await writeIndex(index);
}

/** Drop everything for a connection — its whole directory and all its index entries. */
export async function purgeConnection(connectionId: string): Promise<void> {
  await deleteFile(`${mediaRoot()}${connectionId}/`);
  const index = await readIndex();
  if (index[connectionId]) {
    delete index[connectionId];
    await writeIndex(index);
  }
}
