import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMarkdown } from './render-markdown.mjs';

test('Markdown and HTML images defer later downloads and preserve explicit loading choices', async () => {
  const html = await renderMarkdown('CS224N/example.md', [
    '![First](figures/first.png)',
    '![Second](figures/second.png)',
    '<img src="figures/third.png" loading="eager" decoding="sync">',
    '<img src="figures/fourth.png">',
  ].join('\n\n'), '/notes/');
  const images = html.match(/<img\b[^>]*>/g);
  assert.equal(images.length, 4);
  assert.match(images[0], /loading="eager"/);
  assert.match(images[0], /decoding="async"/);
  assert.match(images[1], /loading="lazy"/);
  assert.match(images[2], /loading="eager"/);
  assert.match(images[2], /decoding="sync"/);
  assert.match(images[3], /loading="lazy"/);
  assert.match(images[3], /src="\/notes\/CS224N\/figures\/fourth.png"/);
});


test('Local image sizes reserve space without changing lazy loading or authored sizes', async () => {
  const html = await renderMarkdown('CS224N/example.md', [
    '![First](figures/first.png)',
    '![Second](figures/second.png)',
    '<img src="figures/second.png" width="320" height="180">',
  ].join('\n\n'), '/notes/', {
    '/notes/CS224N/figures/first.png': { width: 800, height: 600 },
    '/notes/CS224N/figures/second.png': { width: 1280, height: 720 },
  });
  const images = html.match(/<img\b[^>]*>/g);
  assert.match(images[0], /width="800" height="600"/);
  assert.match(images[1], /loading="lazy"/);
  assert.match(images[1], /width="1280" height="720"/);
  assert.match(images[2], /width="320" height="180"/);
});
