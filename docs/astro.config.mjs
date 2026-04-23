// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { BASE_PATH } from './config.ts';
import { articles } from './src/data/articles.ts';

export default defineConfig({
  site: 'https://docs.swmansion.com/',
  base: BASE_PATH,
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
  integrations: [
    starlight({
      title: 'Pulsar',
      customCss: [
        './src/styles/index.css',
        './src/content/docs/custom.css',
        // './src/content/docs/legacy-style.css',
        '@fontsource/bebas-neue/400.css',
      ],
      pagination: false,
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/software-mansion/pulsar' },
      ],
      sidebar: [
        {
          label: 'Getting started',
          slug: 'getting-started',
        },
        {
          label: 'Presets playground',
          slug: 'presets-playground',
        },
        // {
        //   label: 'AI Skills',
        //   slug: 'skills',
        // },
        {
          label: 'Pulsar Studio',
          slug: 'pulsar-studio',
          badge: {
            text: 'Soon',
            variant: 'note',
          },
        },
        {
          label: 'SDK',
          items: [
            { label: 'Overview', slug: 'sdk/overview' },
            { label: 'iOS', slug: 'sdk/ios' },
            { label: 'Android', slug: 'sdk/android' },
            { label: 'React Native', slug: 'sdk/react-native' },
          ],
        },
        {
          label: 'Articles',
          items: [
            { label: 'Overview', slug: 'articles' },
            ...articles.map((article) => ({
              label: article.shortTitle,
              link: article.url,
              attrs: {
                target: '_blank',
                rel: 'noreferrer',
              },
            })),
          ],
        },
      ],
      logo: {
        light: './src/assets/logo_label.svg',
        dark: './src/assets/logo_label.svg',
        alt: 'Pulsar Logo',
        replacesTitle: true,
      },
      favicon: '/logo.svg',
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
        Head: './src/components/Head.astro',
        PageFrame: './src/components/PageFrame.astro',
      },
    }),
    react(),
  ],
});
