// Accept either a raw file key or a full Figma URL and return the key.
export function extractFileKey(input: string): string {
  const m = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/);
  return (m ? m[1] : input).trim();
}

// Whether the input resolves to something that looks like a real Figma file key
// (a Figma URL, or a raw base62 key). Used to gate the Live preview configurator's
// first step and the Presets-tab "finish configuration" reminder. Lenient on
// length so we don't reject valid keys, strict enough to reject pasted prose.
export function isFileKeyValid(input: string): boolean {
  return /^[A-Za-z0-9]{8,128}$/.test(extractFileKey(input));
}
