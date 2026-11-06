// Assembles a page from a loaded project, in one of three modes:
//
//   cdn      the original CDN tags; what the round trip compares with the source
//   offline  one self-contained file: libraries, fonts and content inlined
//   site     a page of the published site: content, engine, styles and
//            libraries are shared files under /assets/ and /vendor/
import { FIELDS, toAttr } from './chapters.mjs';
import { escapeAttr, escapeChapterBody, serializeData } from './format.mjs';
import { scanSegments } from './segments.mjs';
import { fillTokens } from './site.mjs';
import { LIBRARIES, readLibrary, fontFaces, facesForText, fontCSS, fontDataURL, inlineScriptSafe } from './vendor.mjs';

const MODES = ['cdn', 'offline', 'site'];

// String.replace would interpret "$&" and friends inside the engine source,
// so placeholders are swapped by position.
function replaceOnce(text, token, value) {
  const at = text.indexOf(token);
  if (at < 0) throw new Error(`engine/shell.html: placeholder ${token} is missing`);
  if (text.indexOf(token, at + token.length) >= 0) throw new Error(`engine/shell.html: placeholder ${token} appears twice`);
  return text.slice(0, at) + value + text.slice(at + token.length);
}

const normalizeBody = (body) => body.replace(/^\n+/, '').replace(/\s*$/, '\n');

export function chapterElement(chapter, manifest) {
  const attrs = FIELDS.map((f) => `${f.attr}="${escapeAttr(toAttr(f, chapter.meta[f.key]))}"`).join(' ');
  return `<script type="text/markdown" ${attrs}>${manifest.chapters.bodyLead}${escapeChapterBody(normalizeBody(chapter.body))}</script>`;
}

export function chaptersRegion(project, books) {
  const { manifest, chapters } = project;
  const c = manifest.chapters;
  return books.map((n) => [
    c.bookStart.replace('{n}', n),
    ...chapters.filter((ch) => ch.meta.book === n).map((ch) => chapterElement(ch, manifest)),
    c.bookEnd.replace('{n}', n)
  ].join(c.separator)).join(c.separator);
}

export const dataElement = (block) => `<script type="application/json" id="${block.id}">${serializeData(block.value, block.style)}</script>`;

export function bookNumbers(project) {
  const books = project.data.find((d) => d.id === 'data-books').value.books.map((b) => b.n);
  for (const ch of project.chapters) if (!books.includes(ch.meta.book)) books.push(ch.meta.book);
  return [...new Set(books)].sort((a, b) => a - b);
}

// The shared content file of the site: the same chapters and data the single
// file carries, in the shape the engine reads from window.GT_CONTENT.
export function contentScript(project, siteData) {
  const chapters = project.chapters.map((ch) => ({
    dataset: Object.fromEntries(FIELDS.map((f) => [f.key, toAttr(f, ch.meta[f.key])])),
    textContent: project.manifest.chapters.bodyLead + normalizeBody(ch.body)
  }));
  const data = Object.fromEntries(project.data.map((d) => [d.id, d.value]));
  if (siteData) data['data-site'] = siteData;
  return `window.GT_CONTENT = ${JSON.stringify({ chapters, data })};\n`;
}

const vendorPath = (opts, name) => opts.vendor + LIBRARIES[name].site.replace(/^vendor\//, '');

function libraryTag(name, mode, opts) {
  if (mode === 'cdn') return opts.manifest.cdn[name];
  if (mode === 'site') return `<script src="${vendorPath(opts, name)}"></script>`;
  return `<script>${inlineScriptSafe(readLibrary(name))}</script>`;
}

function lazyLibraries(mode, opts) {
  if (mode === 'cdn') return '';
  if (mode === 'site') return `<script>window.GT_LIBS = { mathjax: ${JSON.stringify(vendorPath(opts, 'mathjax'))}, mermaid: ${JSON.stringify(vendorPath(opts, 'mermaid'))} };</script>\n`;
  // Offline: the code sits in inert text blocks and becomes a blob: URL only
  // when the engine first asks for it.
  const blocks = ['mathjax', 'mermaid'].map((n) => `<script type="text/plain" id="gt-lib-${n}">${inlineScriptSafe(readLibrary(n))}</script>`).join('\n');
  const boot = "(function () {\n  var cache = {};\n  function url(name) {\n    if (!cache[name]) { var n = document.getElementById('gt-lib-' + name); cache[name] = n ? URL.createObjectURL(new Blob([n.textContent], { type: 'text/javascript' })) : ''; }\n    return cache[name];\n  }\n  window.GT_LIBS = { get mathjax() { return url('mathjax'); }, get mermaid() { return url('mermaid'); } };\n})();";
  return `${blocks}\n<script>/* gt: self-hosted libraries for the offline build */\n${boot}\n</script>\n`;
}

function fontsTag(html, mode, opts) {
  if (mode === 'cdn') return opts.manifest.cdn.fonts;
  if (mode === 'site') return `<link rel="stylesheet" href="${opts.assets.fonts}">`;
  return `<style>\n${fontCSS(facesForText(fontFaces(), html), fontDataURL)}\n</style>`;
}

// opts.page:   { title, description, head, main, route } for one page
// opts.assets: URLs of the shared files (site mode)
// opts.siteData: the data-site block (repository links, files, credits)
export function renderPage(project, { mode = 'offline', vendor = '/vendor/', page = {}, assets = {}, siteData = null } = {}) {
  if (!MODES.includes(mode)) throw new Error(`unknown build mode "${mode}"`);
  const { manifest, shell, styles, engine, data, site } = project;
  const opts = { manifest, vendor, assets };
  const ph = manifest.placeholders;
  const values = { site, page: { title: page.title || site.name, description: page.description || site.description } };
  let html = fillTokens(shell, values, 'engine/shell.html');
  const blocks = siteData && mode !== 'cdn' ? [...data, { id: 'data-site', style: 'compact', value: siteData }] : data;
  if (mode === 'site') {
    html = replaceOnce(html, ph.styles, `<link rel="stylesheet" href="${assets.styles}">`);
    html = replaceOnce(html, ph.chapters, '');
    html = replaceOnce(html, ph.data, `<script src="${assets.content}"></script>`);
    html = replaceOnce(html, ph.engine, `<script src="${assets.engine}"></script>`);
  } else {
    html = replaceOnce(html, ph.styles, manifest.styles.open + manifest.styles.lead + styles + manifest.styles.close);
    html = replaceOnce(html, ph.chapters, chaptersRegion(project, bookNumbers(project)));
    html = replaceOnce(html, ph.data, blocks.map(dataElement).join(manifest.data.separator));
    html = replaceOnce(html, ph.engine, manifest.engine.open + manifest.engine.lead + engine + manifest.engine.close);
  }
  html = replaceOnce(html, ph.marked, libraryTag('marked', mode, opts));
  html = replaceOnce(html, ph.highlight, libraryTag('highlight', mode, opts));
  html = replaceOnce(html, ph.lazy, lazyLibraries(mode, opts));
  const route = page.route ? `\n<script>window.GT_ROUTE = ${JSON.stringify(page.route)};</script>` : '';
  html = replaceOnce(html, ph.head, mode === 'cdn' ? '' : (page.head || '') + route);
  html = replaceOnce(html, ph.main, mode === 'cdn' ? '' : page.main || '');
  // Fonts last: the offline build embeds only the subsets this page uses.
  html = replaceOnce(html, ph.fonts, fontsTag(html, mode, opts));
  if (mode !== 'site') assertWellFormed(html, project.chapters.length, blocks.length);
  return html;
}

// If any body contained an unescaped "</script", the page would split into
// more elements than we put in. Catch that before anyone opens the file.
function assertWellFormed(html, chapters, data) {
  const segs = scanSegments(html);
  const c = segs.filter((s) => s.kind === 'script' && s.attrs.type === 'text/markdown').length;
  const d = segs.filter((s) => s.kind === 'script' && s.attrs.type === 'application/json').length;
  if (c !== chapters || d !== data) {
    throw new Error(`built page is malformed: expected ${chapters} chapters and ${data} data blocks, found ${c} and ${d}. A body probably contains an unescaped closing script tag.`);
  }
}
