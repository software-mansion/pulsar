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