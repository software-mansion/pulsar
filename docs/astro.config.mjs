// @ts-check
import { defineConfig } from 'astro/config';
import swmGeo, { structuredData } from './swm-geo.mjs';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { BASE_PATH } from './config.ts';
import { articles } from './src/data/articles.ts';

/**
 * Serves `public/web-app/index.html` for a bare `/web-app/` request in `astro dev`.
 *
 * The dev server hands out files from `public/` verbatim and does not resolve a
 * directory to its index, so `/pulsar/web-app/` 404s there while
 * `/pulsar/web-app/index.html` works. Static hosts do resolve it, so the built
 * site has always been fine — this only stops the dev server disagreeing with
 * production about a URL people actually type.
 */
function webAppDevIndex() {
  return {
    name: 'pulsar-web-app-dev-index',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '').split('?');
        // Vite strips the base before this point, but not in every arrangement,
        // so match either form and put back exactly the prefix that was there —
        // rewriting to the other one lands on a path nothing serves.
        const match = new RegExp(`^(${BASE_PATH})?/web-app/?$`).exec(path);
        if (match) {
          req.url = `${match[1] ?? ''}/web-app/index.html${query ? `?${query}` : ''}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  site: 'https://docs.swmansion.com/',
  base: BASE_PATH,
  // GitHub Pages 301-redirects directory URLs to their trailing-slash form, so
  // emit and link to that canonical form everywhere to avoid redirect hops.
  trailingSlash: 'always',
  redirects: {
    // The Studio page used to live under /pulsar-studio/ as a docs entry; it is
    // now the standalone /studio/ landing page. Keep the old URL working.
    '/pulsar-studio': '/pulsar/studio/',
  },
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
    plugins: [webAppDevIndex()],
  },
  integrations: [
    swmGeo({
      name: 'Pulsar',
      description: 'Haptic feedback library for Swift, Kotlin and React Native',
      repository: 'pulsar',
    }),
    starlight({
      title: 'Pulsar',
      customCss: [
        './src/styles/index.css',
        './src/content/docs/custom.css',
        // './src/content/docs/legacy-style.css',
        '@fontsource/bebas-neue/400.css',
      ],
      // Load DM Sans / DM Mono via a <head> <link> rather than a CSS @import.
      // In the production build, bundled @import rules get reordered below other
      // declarations and are then ignored by the browser (falling back to a
      // system font). A head <link> is order-independent and always applies.
      head: [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify(
            structuredData({
              name: 'Pulsar',
              description: 'Haptic feedback library for Swift, Kotlin and React Native',
              repository: 'pulsar',
            }),
          ),
        },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        {
          tag: 'link',
          attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap',
          },
        },
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
        {
          label: 'AI Skills',
          items: [
            { label: 'Overview', slug: 'skills' },
            { label: 'Figma MCP', slug: 'skills/figma-mcp' },
          ],
        },
        {
          label: 'Pulsar Studio',
          link: 'https://docs.swmansion.com/pulsar/studio/',
        },
        {
          label: 'Studio',
          items: [{ label: 'MCP', slug: 'studio/mcp' }],
        },
        // {
        //   label: 'Figma → code',
        //   slug: 'figma',
        // },
        {
          label: 'SDK',
          items: [
            { label: 'Overview', slug: 'sdk/overview' },
            { label: 'iOS', slug: 'sdk/ios' },
            { label: 'Android', slug: 'sdk/android' },
            { label: 'React Native', slug: 'sdk/react-native' },
            { label: 'Kotlin Multiplatform', slug: 'sdk/kmp' },
            { label: 'Flutter', slug: 'sdk/flutter' },
          ],
        },
        {
          label: 'Web',
          items: [
            { label: 'SDK', slug: 'sdk/web' },
            { label: 'Preset playground', slug: 'web-presets-playground' },
            // Standalone Vite bundle built by `npm run build:web-app` into
            // public/web-app/ — nothing of it loads until this link is opened.
            // Starlight prepends `base`, so this stays base-relative.
            { label: 'Pulsar Web App', link: '/web-app/' },
          ],
        },
        {
          label: 'Articles',
          items: [
            { label: 'Overview', slug: 'articles' },
            { label: 'Good to read', slug: 'articles/good-to-read' },
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
    sitemap({
      // figma-preview is now only a redirect stub pointing at the Studio
      // deployment that actually serves the preview — keep it out of the
      // sitemap so we don't invite Google to index a bounce page.
      filter: (page) => !page.includes('/figma-preview'),
    }),
  ],
});
