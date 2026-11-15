import { defineConfig } from 'vite';
import { normalizeSiteBasePath } from './src/remark-note-links.mjs';

const siteBasePath = normalizeSiteBasePath(process.env.SITE_BASE_PATH || '/notes/');
const mainSiteUrl = new URL(process.env.MAIN_SITE_URL || 'https://weiknight0.github.io/');
if (!['https:', 'http:'].includes(mainSiteUrl.protocol) || mainSiteUrl.search || mainSiteUrl.hash) {
  throw new Error('MAIN_SITE_URL must be an HTTP(S) URL with no query or fragment');
}
if (!mainSiteUrl.pathname.endsWith('/')) mainSiteUrl.pathname += '/';

export default defineConfig({
  base: `${siteBasePath}notes-reader/`,
  define: {
    'import.meta.env.SITE_BASE_PATH': JSON.stringify(siteBasePath),
    'import.meta.env.MAIN_SITE_URL': JSON.stringify(mainSiteUrl.href),
  },
  // Vite only rewrites asset URLs to BASE_URL; navigation uses the site base.
  plugins: [{
    name: 'notes-site-base',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_BASE_PATH%', siteBasePath)
        .replaceAll('%MAIN_SITE_URL%', mainSiteUrl.href),
    },
  }],
});
