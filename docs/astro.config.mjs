// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]',
      },
    },
    ssr: {
      external: ['react', 'react-dom'],
    },
  },
  integrations: [starlight({
    title: 'Pulsar',
    customCss: [
      './src/pages/index.css',
      './src/content/docs/custom.css',
      // './src/content/docs/legacy-style.css',
      '@fontsource/bebas-neue/400.css',
    ],
    pagination: false,
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/swmansion/pulsar' }],
    sidebar: [
      {
        label: 'Getting started',
        slug: 'getting-started'
      },
      {
        label: 'Playground',
        items: [
          { label: 'Presets', slug: 'playground/presets' },
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
      light: './src/assets/logo_label.svg',
      dark: './src/assets/logo_label.svg',
      alt: 'Pulsar Logo',
      replacesTitle: true,
    },
    components: {
      ThemeSelect: './src/components/ThemeSelect.astro',
    },
  }),
  react()
],
});