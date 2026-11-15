import assert from 'node:assert/strict';
import test from 'node:test';
import { isMainSiteUrl, normalizeBase, noteRoute, publicPath } from './site.mjs';

test('Pages accepts both user and project site bases', () => {
  assert.equal(normalizeBase(''), '/');
  assert.equal(normalizeBase('/'), '/');
  assert.equal(normalizeBase('wkn-personal-site'), '/wkn-personal-site/');
  assert.equal(normalizeBase('/wkn-personal-site/'), '/wkn-personal-site/');
  assert.throws(() => normalizeBase('/../private/'));
  assert.throws(() => normalizeBase('https://example.com/'));
});

test('note routes map directory indexes and files to stable URLs', () => {
  assert.equal(noteRoute('index.md'), '');
  assert.equal(noteRoute('AI/index.md'), 'AI');
  assert.equal(noteRoute('AI/models/transformer.md'), 'AI/models/transformer');
  assert.equal(noteRoute('my-index.md'), 'my-index');
});

test('public paths preserve base and encode non-ASCII source names', () => {
  assert.equal(publicPath('/notes/', '中文/图 1.png'), '/notes/%E4%B8%AD%E6%96%87/%E5%9B%BE%201.png');
});

test('only main-site routes are treated as cross-site links', () => {
  const origin = 'https://weiknight0.github.io';
  const mainSite = new URL(`${origin}/`);
  for (const route of ['/', '/about/', '/privacy/', '/projects/zh-cn/', '/ocs/', '/worldbuilding/']) {
    assert.equal(isMainSiteUrl(new URL(route, origin), mainSite, '/notes/'), true, route);
  }
  for (const route of ['/notes/', '/notes/CSAPP/', '/broken/', '/projects-broken/']) {
    assert.equal(isMainSiteUrl(new URL(route, origin), mainSite, '/notes/'), false, route);
  }
  const projectMain = new URL(`${origin}/wkn-personal-site/`);
  assert.equal(isMainSiteUrl(new URL(`${origin}/wkn-personal-site/projects/`), projectMain, '/notes/'), true);
  assert.equal(isMainSiteUrl(new URL(`${origin}/wkn-personal-site/broken/`), projectMain, '/notes/'), false);
});
