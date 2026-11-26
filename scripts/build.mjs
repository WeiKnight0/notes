import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { renderDirectory } from './directory-pages.mjs';
import { directoryPages } from '../notes/directory-pages.mjs';
import { imageDimensions } from './image-dimensions.mjs';
import { escapeHtml, filesUnder, normalizeBase, noteRoute, output, publicPath, root } from './site.mjs';

const base = normalizeBase(process.env.SITE_BASE_PATH || '/notes/');
const site = new URL(process.env.SITE_URL || 'https://weiknight0.github.io/');
if (!['https:', 'http:'].includes(site.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
if (site.pathname !== '/' || site.search || site.hash) {
  throw new Error('Use SITE_URL for the origin and SITE_BASE_PATH for the repository path');
}
const notesRoot = path.join(root, 'notes/content');
let noteFiles;
try {
  noteFiles = await filesUnder(notesRoot);
} catch (error) {
  throw new Error('Cannot read notes/content. Restore the notes/content directory from the website repository.', { cause: error });
}
if (!directoryPages.some((page) => page.route === '')) {
  throw new Error('The directory configuration must include a home page.');
}

const notes = [];
const routes = new Set();
for (const source of noteFiles.filter((file) => /\.md$/i.test(file))) {
  const route = noteRoute(source);
  if (['_sources', 'algorithm-templates'].includes(route.split('/')[0])) {
    throw new Error(`Note uses a reserved route: ${source}`);
  }
  if (routes.has(route)) throw new Error(`Duplicate note route: ${route} (${source})`);
  routes.add(route);
  const markdown = await fs.readFile(path.join(notesRoot, source), 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  const metadata = frontmatter && YAML.parse(frontmatter[1]);
  if (typeof metadata?.title !== 'string' || !metadata.title.trim() || !metadata.date
      || Number.isNaN(Date.parse(String(metadata.date)))) {
    throw new Error(`Note needs a title and valid date in front matter: ${source}`);
  }
  notes.push({ ...metadata, source, route, body: markdown.slice(frontmatter[0].length) });
}

const mainSiteUrl = new URL(process.env.MAIN_SITE_URL || 'https://weiknight0.github.io/');
if (!['https:', 'http:'].includes(mainSiteUrl.protocol) || mainSiteUrl.search || mainSiteUrl.hash) {
  throw new Error('MAIN_SITE_URL must be an HTTP(S) URL with no query or fragment');
}
if (!mainSiteUrl.pathname.endsWith('/')) mainSiteUrl.pathname += '/';
const environment = { ...process.env, SITE_URL: site.origin, SITE_BASE_PATH: base, MAIN_SITE_URL: mainSiteUrl.href };
for (const workspace of ['notes/reader', 'notes/algorithm-templates']) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build', '--workspace', workspace], {
    cwd: root, env: environment, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.copyFile(path.join(root, 'favicon.ico'), path.join(output, 'favicon.ico'));
await fs.copyFile(path.join(root, 'notes-mark.svg'), path.join(output, 'notes-mark.svg'));
const readerRoot = path.join(root, 'notes/reader/dist');
await fs.cp(readerRoot, path.join(output, 'notes-reader'), { recursive: true });
const reader = await fs.readFile(path.join(readerRoot, 'index.html'), 'utf8');
await fs.rm(path.join(output, 'notes-reader/index.html'));
for (const note of notes) {
  const sourceUrl = publicPath(base, `_sources/${note.source}`);
  const head = `<meta name="note-source" content="${escapeHtml(sourceUrl)}">\n`
    + `<meta name="note-path" content="${escapeHtml(note.source)}">\n`;
  let html = reader.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(note.title)} | WeiKnight Notes</title>`)
    .replace('</head>', `${head}</head>`);
  const destination = path.join(output, note.route, 'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, html);
  const sourceDestination = path.join(output, '_sources', note.source);
  await fs.mkdir(path.dirname(sourceDestination), { recursive: true });
  await fs.copyFile(path.join(notesRoot, note.source), sourceDestination);
}

for (const page of directoryPages) {
  if (routes.has(page.route)) throw new Error(`Duplicate directory route: ${page.route}`);
  routes.add(page.route);
  const html = reader.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)} | WeiKnight Notes</title>`)
    .replace('<body>', '<body class="catalog-page">')
    .replace(/<main\b[\s\S]*?<\/main>/, renderDirectory(page, notes, base))
    .replace('</head>', `<link rel="stylesheet" href="${publicPath(base, 'notes-reader/catalog.css')}"></head>`);
  const destination = path.join(output, page.route, 'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, html);
}

const dimensions = {};
for (const asset of noteFiles.filter((file) => !/\.md$/i.test(file) && path.posix.basename(file) !== 'directory.mjs')) {
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(asset)) {
    const size = imageDimensions(await fs.readFile(path.join(notesRoot, asset)));
    if (size?.width > 0 && size?.height > 0) dimensions[publicPath(base, asset)] = size;
  }
  if (['_sources', 'algorithm-templates'].includes(asset.split('/')[0])) {
    throw new Error(`Note asset uses a reserved path: ${asset}`);
  }
  const destination = path.join(output, asset);
  try {
    await fs.access(destination);
    throw new Error(`Note asset collides with a page: ${asset}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(path.join(notesRoot, asset), destination);
}
await fs.writeFile(path.join(output, 'image-dimensions.json'), JSON.stringify(dimensions));
await fs.cp(path.join(root, 'notes/algorithm-templates/dist'), path.join(output, 'algorithm-templates'), { recursive: true });
const redirects = JSON.parse(await fs.readFile(path.join(root, 'notes/redirects.json'), 'utf8'));
for (const [oldRoute, target] of Object.entries(redirects)) {
  if (routes.has(oldRoute)) continue;
  const [targetRoute, fragment] = target.split('#');
  const targetUrl = publicPath(base, targetRoute + '/') + (fragment ? `#${fragment}` : '');
  const destination = path.join(output, oldRoute, 'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>笔记已迁移</title><link rel="canonical" href="' + escapeHtml(targetUrl) + '"><script>location.replace(' + JSON.stringify(targetUrl) + ')</script><p><a href="' + escapeHtml(targetUrl) + '">前往笔记</a></p></html>');
}
await fs.writeFile(path.join(output, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found | Notes</title><meta name="viewport" content="width=device-width,initial-scale=1"><main><h1>Page not found</h1><p><a href="' + escapeHtml(base) + '">Return to Notes</a></p></main></html>');
await fs.writeFile(path.join(output, '.nojekyll'), '');
await fs.writeFile(path.join(output, 'site-build.json'), `${JSON.stringify({ base, site: site.origin, mainSite: mainSiteUrl.href, notes: notes.length }, null, 2)}\n`);

const pages = (await filesUnder(output)).filter((file) => file.endsWith('.html') && file !== '404.html');
const urls = pages.map((file) => {
  const route = file.endsWith('index.html') ? file.slice(0, -10) : file;
  return new URL(publicPath(base, route), site).href;
});
await fs.writeFile(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join('\n') + '\n</urlset>\n');
await fs.writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL(publicPath(base, 'sitemap.xml'), site).href}\n`);
console.log(`Built static site: ${pages.length} pages including ${notes.length} notes; base=${base}; output=dist/`);
