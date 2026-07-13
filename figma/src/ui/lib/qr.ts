// Shared QR styling for the pairing code and the app-store codes. The hex is
// hardcoded (not CSS vars) because QR generation renders to a canvas: #001a72 is
// --color-primary, #e1f3fa is --color-blue-10.
export const QR_COLORS = { dark: '#001a72', light: '#e1f3fa' } as const;
