import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';

import type { AddByCodeOptions, Track } from './types';

// Deep links carrying a pairing `code` (`pulsarapp://connect?code=…` or the
// unified `pulsarapp://figma?token=…&code=…`) add a connection. The `token` for
// the preview is consumed separately by the Figma route.
export function useDeepLinkPairing(
  addByCode: (code: string, opts?: AddByCodeOptions) => void,
  track: Track,
) {
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const handle = (url: string) => {
      if (!url || lastUrl.current === url) return;
      lastUrl.current = url;

      const { queryParams } = Linking.parse(url);
      const code = queryParams?.code;
      if (!code) return;

      // A `token` means this is the unified Figma link — capture it as the
      // connection's preview token + Figma type so the row reopens the preview.
      const previewToken = queryParams?.token?.toString();
      addByCode(code.toString(), {
        name: queryParams?.name?.toString(),
        ...(previewToken ? { previewToken, producerType: 'figma' as const } : {}),
      });
      track('deep_link_connection_initiated', { has_code: true });
    };

    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    Linking.getInitialURL().then((url) => {
      if (url) handle(url);
    });
    return () => sub.remove();
  }, [addByCode, track]);
}
