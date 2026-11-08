// Assembles the single-file page from a loaded project.
import { FIELDS, toAttr } from './chapters.mjs';
import { escapeAttr, escapeChapterBody, serializeData } from './format.mjs';
import { scanSegments } from './segments.mjs';
import { LIBRARIES, readLibrary, fontFaces, facesForText, fontCSS, fontDataURL, inlineScriptSafe } from './vendor.mjs';

// String.replace would interpret "$&" and friends inside the engine source,
// so placeholders are swapped by position.
function replaceOnce(text, token, value) {
  const at = text.indexOf(token);
  if (at < 0) throw new Error(`engine/shell.html: placeholder ${token} is missing`);
  if (text.indexOf(token, at + token.length) >= 0) throw new Error(`engine/shell.html: placeholder ${token} appears twice`);
  return text.slice(0, at) + value + text.slice(at + token.length);
}

export function chapterElement(chapter, manifest) {
  const attrs = FIELDS.map((f) => `${f.attr}="${escapeAttr(toAttr(f, chapter.meta[f.key]))}"`).join(' ');
  const body = chapter.body.replace(/^\n+/, '').replace(/\s*$/, '\n');
  return `<script type="text/markdown" ${attrs}>${manifest.chapters.bodyLead}${escapeChapterBody(body)}</script>`;
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

export function renderPage(project, { mode = 'offline', vendor = '/vendor/' } = {}) {
  if (!MODES.includes(mode)) throw new Error(`unknown build mode "${mode}"`);
  const { manifest, shell, styles, engine, data } = project;
  const opts = { manifest, vendor };
  const ph = manifest.placeholders;
  let html = shell;
  html = replaceOnce(html, ph.styles, manifest.styles.open + manifest.styles.lead + styles + manifest.styles.close);
  html = replaceOnce(html, ph.chapters, chaptersRegion(project, bookNumbers(project)));
  html = replaceOnce(html, ph.data, data.map(dataElement).join(manifest.data.separator));
  html = replaceOnce(html, ph.engine, manifest.engine.open + manifest.engine.lead + engine + manifest.engine.close);
  html = replaceOnce(html, ph.marked, libraryTag('marked', mode, opts));
  html = replaceOnce(html, ph.highlight, libraryTag('highlight', mode, opts));
  html = replaceOnce(html, ph.lazy, lazyLibraries(mode, opts));
  // Fonts last: the offline build embeds only the subsets this page uses.
  html = replaceOnce(html, ph.fonts, fontsTag(html, mode, opts, manifest));
  assertWellFormed(html, project);
  return html;
}

// ----- Build modes -----
// cdn:     the original CDN tags, used by the round trip.
// offline: everything inlined; the file opens without a network.
// site:    local files under /vendor/ (opts.vendor is the URL prefix).
const MODES = ['cdn', 'offline', 'site'];

function libraryTag(name, mode, opts) {
  if (mode === 'cdn') return opts.manifest.cdn[name];
  if (mode === 'site') return `<script src="${opts.vendor}${LIBRARIES[name].site.replace(/^vendor\//, '')}"></script>`;
  return `<script>${inlineScriptSafe(readLibrary(name))}</script>`;
}

function lazyLibraries(mode, opts) {
  if (mode === 'cdn') return '';
  if (mode === 'site') {
    const url = (n) => JSON.stringify(opts.vendor + LIBRARIES[n].site.replace(/^vendor\//, ''));
    return `<script>window.GT_LIBS = { mathjax: ${url('mathjax')}, mermaid: ${url('mermaid')} };</script>\n`;
  }
  // Offline: the code sits in inert text blocks and becomes a blob: URL only
  // when the engine first asks for it.
  const blocks = ['mathjax', 'mermaid'].map((n) => `<script type="text/plain" id="gt-lib-${n}">${inlineScriptSafe(readLibrary(n))}</script>`).join('\n');
  const boot = "(function () {\n  var cache = {};\n  function url(name) {\n    if (!cache[name]) { var n = document.getElementById('gt-lib-' + name); cache[name] = n ? URL.createObjectURL(new Blob([n.textContent], { type: 'text/javascript' })) : ''; }\n    return cache[name];\n  }\n  window.GT_LIBS = { get mathjax() { return url('mathjax'); }, get mermaid() { return url('mermaid'); } };\n})();";
  return `${blocks}\n<script>/* gt: self-hosted libraries for the offline build */\n${boot}\n</script>\n`;
}

function fontsTag(html, mode, opts, manifest) {
  if (mode === 'cdn') return manifest.cdn.fonts;
  const faces = fontFaces();
  if (mode === 'site') return `<link rel="stylesheet" href="${opts.vendor}fonts/fonts.css">`;
  return `<style>\n${fontCSS(facesForText(faces, html), fontDataURL)}\n</style>`;
}

// If any body contained an unescaped "</script", the page would split into
// more elements than we put in. Catch that before anyone opens the file.
function assertWellFormed(html, project) {
  const segs = scanSegments(html);
  const chapters = segs.filter((s) => s.kind === 'script' && s.attrs.type === 'text/markdown').length;
  const data = segs.filter((s) => s.kind === 'script' && s.attrs.type === 'application/json').length;
  if (chapters !== project.chapters.length || data !== project.data.length) {
    throw new Error(`built page is malformed: expected ${project.chapters.length} chapters and ${project.data.length} data blocks, found ${chapters} and ${data}. A body probably contains an unescaped closing script tag.`);
  }
}
