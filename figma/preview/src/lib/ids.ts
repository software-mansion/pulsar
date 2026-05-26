// Figma node ids appear as "123:456" in plugin data but "123-456" in embed URLs
// and (sometimes) in events. Canonicalise everything to the dash form.
export const normalizeId = (id: unknown): string =>
  id == null ? '' : String(id).replace(/:/g, '-');
