// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: 'Happytic',
    customCss: [
      './src/content/docs/custom.css',
      '@fontsource/bebas-neue/400.css',
    ],
    pagination: false,
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/swmansion' }],
    sidebar: [
      {
        label: 'Getting started',
        slug: 'getting-started'
      },
      {
        label: 'Playground',
        items: [
          { label: 'Presets', slug: 'playground/presets' },
          { label: 'Tags legend', slug: 'playground/tags-legend' },
          { label: 'Interactive mode', slug: 'playground/interactive-mode' },
        ],
      },
      {
        label: 'Pulsar studio',
        slug: 'haptic-studio',
        badge: { 
          text: 'Soon',
          variant: 'note'
        },
      },
      {
        label: 'SDK',
        items: [
          { label: 'iOS', slug: 'sdk/ios' },
          { label: 'Android', slug: 'sdk/android' },
          { label: 'React Native', slug: 'sdk/react-native' },
        ],
      },
      {
        label: 'Blog',
        items: [
          { label: 'Table of content', slug: 'blog/table-of-content' },
          { label: 'Do I need haptics?', slug: 'blog/why-haptics' },
          { label: 'How does haptics works', slug: 'blog/how-does-haptics-works' },
        ],
      },
    ],
    logo: {
      light: './src/assets/logo_v1.png',
      dark: './src/assets/logo_v1.png',
      alt: 'TypeGPU Logo',
      replacesTitle: true,
    },
  }),
  react()
],
});