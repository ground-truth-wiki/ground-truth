#!/usr/bin/env node
// Builds the published site into dist/site/:
//
//   index.html               the full interactive app
//   <chapter-id>/index.html  one page per chapter, with its own title, summary,
//                            canonical URL, link-preview tags and pre-rendered
//                            text; it loads the same shared engine and content
//   404.html                 the app, routing unknown and old addresses
//   impressum/, privacy/, contributors/
//   assets/, vendor/         shared, content-hashed and versioned files
//   sitemap.xml, robots.txt, llms.txt, llms-full.txt, og.png, _headers, _redirects
//   ground-truth.html        the offline single file
//
//   node scripts/build-site.mjs [--github]
//
// --github resolves contributors' GitHub handles through the GitHub API (the
// deploy workflow passes it). Without it, contributors whose commits do not
// use a GitHub no-reply address are credited by name.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { abs, readText, writeText, fail } from './lib/fsutil.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage, contentScript } from './lib/page.mjs';
import { fillTokens } from './lib/site.mjs';
import { LIBRARIES, FONTS_DIR, libraryFile, fontFaces, fontCSS, licensesText } from './lib/vendor.mjs';
import { gitHistory, resolveHandles, creditOf } from './lib/credits.mjs';
import { chapterHTML, tldrText, shorten } from './lib/prerender.mjs';
import { parseChapterFile } from './lib/chapters.mjs';
import { Marked } from 'marked';

const OUT = 'dist/site';
const GITHUB = process.argv.includes('--github');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
let written = 0;
const put = (rel, data) => { const p = path.join(abs(OUT), ...rel.split('/')); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); written++; };
const copy = (rel, from) => put(rel, fs.readFileSync(from));

let project;
try { project = loadProject(); } catch (e) { fail(e.message); }
const { site, chapters } = project;
const base = site.siteUrl;
const repo = site.repository;
const repoSlug = repo.replace('https://github.com/', '');
const books = project.data.find((d) => d.id === 'data-books').value;
const chapterIds = new Set(chapters.map((c) => c.meta.id));

// Clean the output folder (generated files only).
fs.rmSync(abs(OUT), { recursive: true, force: true });

// ----- Credits from the git history -----
const history = gitHistory(['content', 'data/quizzes']);
const everyone = [...new Map([...history.files.values()].flatMap((e) => [...e.people.entries()])).values()];
const handles = resolveHandles(everyone, GITHUB ? repoSlug : null);
const credits = {};
const updated = {};
const pagesByPerson = new Map();
for (const c of chapters) {
  const files = [c.file, `data/quizzes/${c.meta.id}.json`].map((f) => history.files.get(f)).filter(Boolean);
  const people = new Map();
  for (const f of files) for (const [k, p] of f.people) if (!people.has(k)) people.set(k, p);
  credits[c.meta.id] = [...people.values()].map((p) => creditOf(p, handles));
  for (const p of people.values()) {
    const who = JSON.stringify(creditOf(p, handles));
    if (!pagesByPerson.has(who)) pagesByPerson.set(who, new Set());
    pagesByPerson.get(who).add(c.meta.id);
  }
  const dates = files.map((f) => f.updated).sort();
  if (dates.length) updated[c.meta.id] = dates[dates.length - 1];
}
const siteData = (linkBase) => ({
  repository: repo,
  contributing: `${repo}/blob/main/CONTRIBUTING.md`,
  contributors: `${linkBase}/contributors/`,
  files: Object.fromEntries(chapters.map((c) => [c.meta.id, c.file])),
  credits,
  links: [
    { text: 'Contributors', href: `${linkBase}/contributors/` },
    { text: 'Impressum', href: `${linkBase}/impressum/` },
    { text: 'Privacy', href: `${linkBase}/privacy/` },
    { text: 'GitHub', href: repo }
  ]
});

// ----- Shared files -----
const assets = {};
const addAsset = (name, ext, text) => { const rel = `assets/${name}.${hash(text)}.${ext}`; put(rel, text); return `/${rel}`; };
assets.content = addAsset('content', 'js', contentScript(project, siteData('')));
assets.engine = addAsset('engine', 'js', project.engine);
assets.styles = addAsset('styles', 'css', project.styles);
const faces = fontFaces();
for (const f of faces) copy(`${FONTS_DIR}/${f.name}`, f.file);
assets.fonts = addAsset('fonts', 'css', fontCSS(faces, (f) => `/${FONTS_DIR}/${f.name}`) + '\n');
for (const name of Object.keys(LIBRARIES)) copy(LIBRARIES[name].site, libraryFile(name));
put('vendor/LICENSES.txt', licensesText());
copy('og.png', abs('docs/assets/social-preview.png'));

// ----- Page heads -----
function head({ url, title, description, type = 'website', robots }) {
  return [
    '',
    `<link rel="canonical" href="${esc(url)}">`,
    robots ? `<meta name="robots" content="${robots}">` : null,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(base)}/og.png">`,
    '<meta property="og:image:width" content="1280">',
    '<meta property="og:image:height" content="640">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="18" width="12" height="9" rx="4.5" fill="none" stroke="#171A21" stroke-width="2"/><rect x="18" y="18" width="12" height="9" rx="4.5" fill="#171A21"/><path d="M8 15.5C8 5.5 24 5.5 24 15.5" fill="none" stroke="#3B5BDB" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="15.5" r="2.2" fill="#3B5BDB"/></svg>')}">`
  ].filter((x) => x !== null).join('\n');
}
const sitePage = (page) => renderPage(project, { mode: 'site', page, assets });

// ----- The app and one page per chapter -----
put('index.html', sitePage({ head: head({ url: `${base}/`, title: site.name, description: site.description }) }));
for (const c of chapters) {
  const title = `${c.meta.title} · ${site.name}`;
  const description = shorten(tldrText(c.body) || site.description);
  const url = `${base}/${c.meta.id}/`;
  put(`${c.meta.id}/index.html`, sitePage({
    title, description, route: c.meta.id,
    head: head({ url, title, description, type: 'article' }),
    main: chapterHTML(c, { isChapter: (id) => chapterIds.has(id) })
  }));
}
// Unknown addresses and old ids (data/aliases.json) open in the app, which
// resolves aliases and shows its own "no such page" message.
put('404.html', renderPage(project, { mode: 'site', assets, page: {
  head: head({ url: `${base}/`, title: site.name, description: site.description, robots: 'noindex' }) + '\n<script>window.GT_ROUTE = decodeURIComponent(location.pathname.replace(/^\\/+|\\/+$/g, ""));</script>'
} }));

// ----- Static pages -----
const staticTemplate = readText('engine/static.html');
const marked = new Marked({ gfm: true });
function staticPage(rel, { title, description, bodyHTML, robots }) {
  let html = fillTokens(staticTemplate, { site, page: { title, description, fonts: assets.fonts, styles: assets.styles } }, 'engine/static.html');
  html = html.replace('<!-- @head -->', () => head({ url: `${base}/${rel}`, title: `${title} · ${site.name}`, description, robots }));
  html = html.replace('<!-- @main -->', () => bodyHTML);
  put(`${rel}index.html`, html);
}
for (const name of ['impressum', 'privacy']) {
  const { meta, body } = parseChapterFile(readText(`content/legal/${name}.md`), `content/legal/${name}.md`);
  staticPage(`${name}/`, { title: meta.title, description: meta.description, bodyHTML: `<article class="prose">${marked.parse(body)}</article>` });
}
const people = [...pagesByPerson.entries()].map(([k, ids]) => ({ ...JSON.parse(k), pages: ids.size }))
  .sort((a, b) => b.pages - a.pages || (a.handle || a.name).localeCompare(b.handle || b.name));
const personHTML = (p) => (p.handle ? `<a href="https://github.com/${esc(p.handle)}">@${esc(p.handle)}</a>` : esc(p.name)) + ` <span class="muted">(${p.pages} page${p.pages === 1 ? '' : 's'})</span>`;
staticPage('contributors/', {
  title: 'Contributors',
  description: `Everyone who wrote or reviewed a page of ${site.name}.`,
  bodyHTML: `<article class="prose"><h1>Contributors</h1><p>Everyone who wrote or reviewed a page of ${esc(site.name)}, from the public history of the project. AI tools are not listed: a named human stands behind every contribution. Each chapter names its own contributors at its end.</p>`
    + (people.length ? `<ul class="people">${people.map((p) => `<li>${personHTML(p)}</li>`).join('')}</ul>` : '<p>The history of the project is not available in this build.</p>')
    + `<p><a href="${esc(repo)}/blob/main/CONTRIBUTING.md">Become a contributor</a>.</p></article>`
});

// ----- For search engines and language models -----
const chapterURL = (c) => `${base}/${c.meta.id}/`;
const extraPages = ['contributors/', 'impressum/', 'privacy/'];
put('sitemap.xml', ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>${esc(base)}/</loc></url>`,
  ...chapters.map((c) => `  <url><loc>${esc(chapterURL(c))}</loc>${updated[c.meta.id] ? `<lastmod>${updated[c.meta.id]}</lastmod>` : ''}</url>`),
  ...extraPages.map((p) => `  <url><loc>${esc(base)}/${p}</loc></url>`), '</urlset>', ''].join('\n'));
put('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
const byBook = books.books.map((b) => ({ b, list: chapters.filter((c) => c.meta.book === b.n) })).filter((x) => x.list.length);
put('llms.txt', [`# ${site.name}`, '', `> ${site.description}`, '',
  `Every chapter is open under CC BY-SA 4.0 and written and reviewed in public at ${repo}. The full text of all chapters is in ${base}/llms-full.txt.`, '',
  ...byBook.flatMap(({ b, list }) => [`## Book ${b.n}: ${b.title}`, '', ...list.map((c) => `- [${c.meta.order} ${c.meta.title}](${chapterURL(c)}): ${tldrText(c.body)}`), ''])].join('\n'));
put('llms-full.txt', [`# ${site.name}`, '', `> ${site.description}`, '', `License: CC BY-SA 4.0. Source: ${repo}`, '',
  ...chapters.flatMap((c) => ['---', '', `# ${c.meta.order} ${c.meta.title}`, '', `URL: ${chapterURL(c)}`, `Book ${c.meta.book}. Level: ${c.meta.level}. Stability: ${c.meta.stability}. Reviewed: ${c.meta.reviewed}.`, '', c.body.trim(), ''])].join('\n'));

// ----- The offline single file -----
put('ground-truth.html', renderPage(project, { mode: 'offline', siteData: siteData(base) }));

// ----- Old chapter ids redirect permanently to their new address -----
const aliases = project.data.find((d) => d.id === 'data-aliases').value;
put('_redirects', Object.entries(aliases).filter(([, to]) => chapterIds.has(to)).map(([from, to]) => `/${from}/ /${to}/ 301\n/${from} /${to}/ 301`).join('\n') + '\n');

// ----- Headers for the host (Cloudflare Pages) -----
put('_headers', [
  '/*',
  "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'",
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()',
  '/assets/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '/vendor/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  ''
].join('\n'));

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`built ${OUT}: ${chapters.length + 1} app pages, 3 static pages, ${written} files, ${(size(abs(OUT)) / 1e6).toFixed(1)} MB${history.available ? '' : ' (no git history: credits omitted)'}`);
