// Assembles the single-file page from a loaded project.
import { FIELDS, toAttr } from './chapters.mjs';
import { escapeAttr, escapeChapterBody, serializeData } from './format.mjs';
import { scanSegments } from './segments.mjs';

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

export function renderPage(project) {
  const { manifest, shell, styles, engine, data } = project;
  const ph = manifest.placeholders;
  let html = shell;
  html = replaceOnce(html, ph.styles, manifest.styles.open + manifest.styles.lead + styles + manifest.styles.close);
  html = replaceOnce(html, ph.chapters, chaptersRegion(project, bookNumbers(project)));
  html = replaceOnce(html, ph.data, data.map(dataElement).join(manifest.data.separator));
  html = replaceOnce(html, ph.engine, manifest.engine.open + manifest.engine.lead + engine + manifest.engine.close);
  assertWellFormed(html, project);
  return html;
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
