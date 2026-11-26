import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseFragment } from 'parse5';
import { directoryPages } from '../notes/directory-pages.mjs';
import { renderDirectory } from './directory-pages.mjs';
import { filesUnder, noteRoute, root } from './site.mjs';

const content = path.join(root, 'notes/content');
const sources = (await filesUnder(content)).filter((file) => file.endsWith('.md'));
const notes = sources.map((source) => ({ source, route: noteRoute(source) }));
function collect(html, tag, attribute) {
  const values = [];
  const visit = (node) => {
    if (node.tagName === tag) values.push(node.attrs.find(({ name }) => name === attribute)?.value);
    (node.childNodes || []).forEach(visit);
  };
  visit(parseFragment(html));
  return values;
}

test('standalone directories cover every note with valid routes under both site bases', () => {
  const routes = new Set([...notes, ...directoryPages].map((item) => item.route));
  const linked = new Set();
  for (const base of ['/notes/', '/']) {
    for (const page of directoryPages) {
      const rendered = collect(renderDirectory(page, notes, base), 'a', 'href');
      for (const entry of (page.groups || []).flatMap((group) => group.entries || [])) {
        assert.ok(routes.has(entry.route), `Missing route: ${entry.route}`);
        assert.ok(rendered.includes(`${base}${entry.route}/`));
        linked.add(entry.route);
      }
    }
  }
  const unlisted = notes.filter((note) => !linked.has(note.route)).map((note) => note.route);
  assert.deepEqual(unlisted, ['AI/CS224N/progress']);
  assert.equal(new Set(directoryPages.map((page) => page.route)).size, directoryPages.length);
});

test('directories render aligned modules without duplicate numbering and retain prose', () => {
  const home = renderDirectory(directoryPages.find((page) => !page.route), notes, '/notes/');
  assert.equal(collect(home, 'svg', 'aria-labelledby').length, 8);
  for (const page of directoryPages.filter((page) => page.route)) {
    const html = renderDirectory(page, notes, '/notes/');
    const labels = collect(html, 'svg', 'aria-labelledby');
    assert.equal(new Set(labels).size, labels.length);
    assert.equal(collect(html, 'section', 'class').filter((value) => value === 'catalog-module').length, page.groups.length);
    assert.ok(!html.includes('group-number'));
    assert.ok(!html.includes('note-number'));
    assert.ok(!html.includes('{{base}}'));
  }
  const ai = renderDirectory(directoryPages.find((page) => page.route === 'AI'), notes, '/notes/');
  assert.ok(ai.includes('共同基础'));
  assert.ok(collect(ai, 'section', 'id').includes('机器学习基础'));
  const organization = renderDirectory(directoryPages.find((page) => page.route === 'Computer-Organization'), notes, '/notes/');
  assert.ok(organization.includes('许可说明'));
  assert.ok(organization.includes('/notes/Computer-Organization/SOURCE-LICENSE.txt'));
  assert.ok(!organization.includes('id="来源与许可"'));
  assert.ok(organization.indexOf('catalog-page-note') > organization.lastIndexOf('catalog-module"'));
  const c = renderDirectory(directoryPages.find((page) => page.route === 'C-Language'), notes, '/notes/');
  assert.ok(c.includes('C90'));
  assert.ok(c.indexOf('C90') < c.indexOf('Contents'));
  assert.ok(!c.includes('参考文献'));
  assert.ok(collect(ai, 'section', 'class').includes('catalog-supplement'));
  for (const page of directoryPages.filter((page) => page.route)) {
    assert.ok(page.groups.every((group) => group.entries?.length > 0), `${page.route} has a non-note module`);
  }
});

test('directory renderer and configuration do not import Markdown processing', async () => {
  const renderer = await fs.readFile(path.join(root, 'scripts/directory-pages.mjs'), 'utf8');
  assert.ok(!renderer.includes('renderMarkdown'));
  assert.ok(!renderer.includes('parseFragment'));
  assert.ok(!sources.includes('index.md'));
});
