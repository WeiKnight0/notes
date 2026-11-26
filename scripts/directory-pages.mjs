import { directoryPages } from '../notes/directory-pages.mjs';
import { escapeHtml, publicPath } from './site.mjs';

export function subjectArt(subject, id) {
  const line = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const node = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--art-paper)" stroke="currentColor" stroke-width="2.4"/>`;
  let drawing;
  switch (subject.art) {
    case 'chip': drawing = `<g ${line}><rect x="170" y="70" width="140" height="140" rx="12"/><rect x="198" y="98" width="84" height="84" rx="5"/>${[100,125,155,180].map((v) => `<path d="M${v+90} 45v25m0 140v25M145 ${v}h25m140 0h25"/>`).join('')}<path d="M220 125h40m-40 25h25"/></g>`; break;
    case 'layers': drawing = `<g ${line}><path d="m120 95 120-55 120 55-120 55Z" fill="var(--art-paper)"/><path d="m120 130 120 55 120-55M120 165l120 55 120-55M120 200l120 55 120-55"/></g>`; break;
    case 'language': drawing = `<g ${line}><rect x="85" y="55" width="210" height="100" rx="12" fill="var(--art-paper)"/><path d="m115 155-10 25 45-25M115 85h150m-150 25h95"/><rect x="210" y="170" width="185" height="55" rx="10" fill="var(--art-paper)"/><path d="M235 197h60m20 0h55"/><path d="M310 80h50v65m-10-10 10 10 10-10"/></g>`; break;
    case 'graph': drawing = `<path ${line} d="M240 65 150 130 330 130M150 130 100 200M150 130 200 200M330 130 290 200M330 130 390 200"/>${[[240,65],[150,130],[330,130],[100,200],[200,200],[290,200],[390,200]].map(([x,y]) => node(x,y,14)).join('')}`; break;
    case 'network': drawing = `<path ${line} d="M240 130 105 65M240 130 105 205M240 130 375 65M240 130 375 205M105 65H375M105 205H375" stroke-dasharray="5 7"/>${[[105,65],[105,205],[375,65],[375,205]].map(([x,y]) => `<rect x="${x-26}" y="${y-18}" width="52" height="36" rx="7" fill="var(--art-paper)" stroke="currentColor" stroke-width="2.4"/>`).join('')}${node(240,130,29)}`; break;
    case 'neural': drawing = `<g ${line}>${[65,135,205].flatMap((y) => [45,105,165,225].map((z) => `<path d="M135 ${y} 240 ${z} 345 ${y}" opacity=".45"/>`)).join('')}</g>${[135,345].flatMap((x) => [65,135,205].map((y) => node(x,y,12))).join('')}${[45,105,165,225].map((y) => node(240,y,12)).join('')}`; break;
    default: drawing = `<g ${line}><rect x="95" y="55" width="290" height="180" rx="12" fill="var(--art-paper)"/><path d="M95 88h290"/><circle cx="113" cy="72" r="2"/><circle cx="127" cy="72" r="2"/><circle cx="141" cy="72" r="2"/>${subject.art === 'code' ? '<path d="m175 125-30 30 30 30m130-60 30 30-30 30m-45-75-32 90"/>' : '<path d="m128 120 23 20-23 20m47 0h100m-147 35h185"/>'}</g>`;
  }
  return `<svg class="subject-art" viewBox="0 0 480 280" role="img" aria-labelledby="art-${id}"><title id="art-${id}">${escapeHtml(subject.title)}主题插图</title><defs><pattern id="grid-${id}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" opacity=".09"/></pattern></defs><rect width="480" height="280" fill="url(#grid-${id})"/><circle cx="240" cy="140" r="115" fill="currentColor" opacity=".045"/>${drawing}</svg>`;
}


export function renderDirectory(page, notes, base) {
  const href = (route) => publicPath(base, route ? `${route}/` : '');
  const subjects = directoryPages.filter((item) => item.route);
  const count = (route) => notes.filter((item) => item.route.startsWith(`${route}/`)).length;
  const updated = `<time datetime="${escapeHtml(page.date)}">${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(page.date))}</time>`;
  const tags = (page.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  if (!page.route) {
    const cards = subjects.map((item, i) => `<a class="subject-card" style="--subject-color:${item.color}" href="${href(item.route)}"><div class="subject-cover">${subjectArt(item, `home-${i}`)}</div><div class="subject-card-copy"><p class="catalog-eyebrow">${escapeHtml(item.label)}</p><h2>${escapeHtml(item.title)}</h2><p class="subject-description">${escapeHtml(item.description)}</p><div class="subject-card-bottom"><span>${count(item.route)} notes</span><span class="card-action">Explore <span aria-hidden="true">→</span></span></div></div></a>`).join('');
    const resources = (page.resources || []).map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.title)} ↗</a>`).join('');
    return `<main class="catalog-main home-catalog"><header class="home-intro"><p class="catalog-eyebrow">WEIKNIGHT / STUDY NOTES</p><h1>${escapeHtml(page.title)}<span>${escapeHtml(page.subtitle)}</span></h1><p>${escapeHtml(page.description)}</p><div class="catalog-meta"><span>${subjects.length} subjects</span><span>${notes.length} notes</span><span>Updated ${updated}</span></div></header><section aria-labelledby="subjects-heading"><div class="catalog-section-heading"><h2 id="subjects-heading">Subjects</h2><span>Choose a subject to start reading</span></div><div class="subject-grid">${cards}</div></section>${resources ? `<aside class="catalog-resources"><span class="catalog-eyebrow">ELSEWHERE</span><h2>Code & resources</h2>${resources}</aside>` : ''}</main>`;
  }
  const groups = page.groups.map((group, i) => {
    const entries = (group.entries || []).map((entry) => `<li><a href="${href(entry.route)}"><span>${escapeHtml(entry.title)}</span><span class="note-arrow" aria-hidden="true">→</span></a></li>`).join('');
    const prose = group.html ? `<div class="catalog-prose">${group.html.replaceAll('{{base}}', base)}</div>` : '';
    const art = { title: group.title, art: group.art || page.art };
    return `<section class="catalog-module" id="${escapeHtml(group.id)}" aria-labelledby="module-${i}"><div class="module-heading"><div class="module-art">${subjectArt(art, `module-${i}`)}</div><h2 id="module-${i}">${escapeHtml(group.title)}</h2>${group.entries ? `<p class="module-count">${group.entries.length} notes</p>` : ''}</div><div class="module-content">${prose}${entries ? `<ul class="module-notes">${entries}</ul>` : ''}</div></section>`;
  }).join('');
  return `<main class="catalog-main" style="--subject-color:${page.color}"><nav class="catalog-breadcrumb" aria-label="Breadcrumb"><a class="catalog-back" href="${base}">← All subjects</a><span>${escapeHtml(page.title)}</span></nav><header class="subject-intro"><div class="subject-intro-copy"><p class="catalog-eyebrow">${escapeHtml(page.label)}</p><h1>${escapeHtml(page.title)}</h1><p class="subject-description">${escapeHtml(page.description)}</p><div class="catalog-meta"><span>${count(page.route)} notes</span><span>Updated ${updated}</span>${tags}</div></div><div class="subject-hero-art">${subjectArt(page, 'hero')}</div></header><div class="catalog-section-heading"><h2>Contents</h2><span>Browse notes by topic</span></div><div class="catalog-modules">${groups}</div></main>`;
}
