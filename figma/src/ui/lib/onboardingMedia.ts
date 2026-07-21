// Remote-hosted onboarding / explanation clips. Loaded over the network (see
// manifest.json → networkAccess.allowedDomains) rather than imported into the
// bundle, so the single-file plugin UI stays ~1 MB instead of inlining ~37 MB
// of video as base64.
//
// Hosted in the public `figma_plugin` bucket on Supabase storage.
const VIDEO_BASE = 'https://xhxogbcwlfdzhbojhtwe.supabase.co/storage/v1/object/public/figma_plugin';

export const ONBOARDING_VIDEOS = {
  bind: `${VIDEO_BASE}/select_preset.mp4`,
  link: `${VIDEO_BASE}/figma_link.mp4`,
  livePreview: `${VIDEO_BASE}/phone_connect.mp4`,
  previewOnDevice: `${VIDEO_BASE}/play_on_device.mp4`,
  resize: `${VIDEO_BASE}/resize.mp4`,
  share: `${VIDEO_BASE}/share.mp4`
} as const;
