import Card from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';
import type { Connection } from '@/contexts/ConnectionsContext';

import ConnectionRow from './ConnectionRow';

export default function ConnectionList({
  connections,
  onRemove,
  onReconnect,
  onOpenPreview,
  onEdit,
  emptyLabel = 'No connections yet.',
}: {
  connections: Connection[];
  onRemove: (id: string) => void;
  onReconnect: (id: string) => void;
  // Open the live preview for a connection that advertised a preview token.
  onOpenPreview: (token: string) => void;
  // Long-press a row to edit its name / view details.
  onEdit?: (id: string) => void;
  emptyLabel?: string;
}) {
  if (connections.length === 0) {
    return (
      <Card style={Margins.marginTop2X}>
        <ThemedText>{emptyLabel}</ThemedText>
      </Card>
    );
  }

  return (
    <>
      {connections.map((c) => (
        <ConnectionRow
          key={c.id}
          connection={c}
          onRemove={() => onRemove(c.id)}
          onReconnect={() => onReconnect(c.id)}
          onOpenPreview={c.previewToken ? () => onOpenPreview(c.previewToken as string) : undefined}
          onEdit={onEdit ? () => onEdit(c.id) : undefined}
        />
      ))}
    </>
  );
}
