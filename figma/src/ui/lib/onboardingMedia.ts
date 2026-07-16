// Remote-hosted onboarding / explanation clips. Loaded over the network (see
// manifest.json → networkAccess.allowedDomains) rather than imported into the
// bundle, so the single-file plugin UI stays ~1 MB instead of inlining ~37 MB
// of video as base64.
//
// NOTE: these are GitHub user-attachment URLs. They work (public, video/mp4,
// range-request-able), but GitHub is NOT a supported CDN - the asset is tied to
// the comment it was uploaded in, the underlying S3 URL is short-signed, and it
// can be rate-limited or removed. Move these to a durable host (e.g.
// pulsar-server.swmansion.com, already allowlisted) before a public release.
export const ONBOARDING_VIDEOS = {
  bind: 'https://github.com/user-attachments/assets/371b8423-5a60-46dc-8499-e8e17131550a',
  link: 'https://github.com/user-attachments/assets/b97a471c-c4c2-42f3-a7f4-4af8bd4afbd9',
  livePreview: 'https://github.com/user-attachments/assets/14e64152-4e44-4b8d-b379-22deaf731b62',
  previewOnDevice: 'https://github.com/user-attachments/assets/9be36fb7-a1fd-496f-b1ad-57061e58d1f3',
  resize: 'https://github.com/user-attachments/assets/70fb5f00-92d2-47fe-a1c2-d1a272d57065',
  share: 'https://github.com/user-attachments/assets/08d240de-60b6-4486-9adf-a7f0154876b0'
} as const;
