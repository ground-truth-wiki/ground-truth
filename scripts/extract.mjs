#!/usr/bin/env node
// Splits source/bible-v2.0.0.html into content/, data/, engine/ and
// build/manifest.json. Reads nothing else.
//
// Every piece is checked before it is written: frontmatter must parse back to
// the original attributes, data must re-serialize to the original bytes, and
// the chapter and data regions must regenerate exactly.
//
// Safe to re-run: identical files are left alone. A file that differs from
// what the source would produce (for example, content edited after the
// migration) stops the run, unless --force is given.
//
//   node scripts/extract.mjs [--force]
import crypto from 'node:crypto';
import fs from 'node:fs';
import { abs, readText, writeText, exists, fail } from './lib/fsutil.mjs';
import { prettyJSON, serializeData, unescapeChapterBody } from './lib/format.mjs';
import { FIELDS, emitFrontmatter, parseChapterFile, fromAttr, toAttr } from './lib/chapters.mjs';
import { scanSegments, isChapter, isData, isEngine } from './lib/segments.mjs';

const SOURCE = 'source/bible-v2.0.0.html';
const FORCE = process.argv.includes('--force');

// Folder names for the 21 books, from the book titles in data-books.
const BOOK_SLUGS = {
  0: 'start-here', 1: 'foundations', 2: 'transformer', 3: 'building-llms', 4: 'model-landscape',
  5: 'prompt-and-context', 6: 'retrieval-rag', 7: 'data', 8: 'multimodal', 9: 'agents',
  10: 'agent-archetypes', 11: 'harnesses', 12: 'protocols', 13: 'frameworks', 14: 'evaluation',
  15: 'inference', 16: 'llmops', 17: 'security-safety', 18: 'system-design', 19: 'frontier',
  20: 'reference-career'
};
const bookDir = (n) => `content/${String(n).padStart(2, '0')}-${BOOK_SLUGS[n]}`;

// Where each data block goes. Order is the order of the blocks in the source.
const DATA_LAYOUT = {
  'data-meta': { file: 'data/meta.json' },
  'data-books': { file: 'data/books.json' },
  'data-glossary': { dir: 'data/glossary', wrap: 'terms', split: 'id' },
  'data-timeline': { file: 'data/timeline.json' },
  'data-quizzes': { dir: 'data/quizzes', wrap: 'questions', split: 'chapter' },
  'data-paths': { file: 'data/paths.json' },
  'data-matrices': { file: 'data/matrices.json' },
  'data-cheatsheets': { file: 'data/cheatsheets.json' },
  'data-presets': { file: 'data/presets.json' },
  'data-wizards': { file: 'data/wizards.json' },
  'data-apocrypha': { file: 'data/apocrypha.json' },
  'data-didyouknow': { file: 'data/didyouknow.json' },
  'data-changelog': { file: 'data/changelog.json' },
  'data-aliases': { file: 'data/aliases.json' }
};

const PLACEHOLDER = {
  styles: '<!-- @styles -->', chapters: '<!-- @chapters -->', data: '<!-- @data -->', engine: '<!-- @engine -->',
  fonts: '<!-- @fonts -->', marked: '<!-- @lib:marked -->', highlight: '<!-- @lib:highlight -->', lazy: '<!-- @lib:lazy -->',
  head: '<!-- @head -->', main: '<!-- @main -->'
};

const assert = (cond, message) => { if (!cond) fail(message); };

const html = fs.readFileSync(abs(SOURCE), 'utf8');
const sha256 = crypto.createHash('sha256').update(html).digest('hex');
const segments = scanSegments(html);
const files = new Map(); // relative path -> text, written at the end

// ----- Styles and engine -----
const styles = segments.filter((s) => s.kind === 'style');
const engines = segments.filter(isEngine);
assert(styles.length === 1, `expected 1 <style> block, found ${styles.length}`);
assert(engines.length === 1, `expected 1 inline engine <script>, found ${engines.length}`);
const [style] = styles;
const [engine] = engines;
const lead = (s) => s.match(/^\n*/)[0];
assert(style.openTag === '<style>' && style.closeTag === '</style>', 'unexpected <style> tag form');
assert(engine.openTag === '<script>' && engine.closeTag === '</script>', 'unexpected engine <script> tag form');
files.set('engine/styles.css', style.body.slice(lead(style.body).length));
files.set('engine/engine.js', engine.body.slice(lead(engine.body).length));

// ----- Chapters -----
const chapterSegs = segments.filter(isChapter);
const order = {};
for (const seg of chapterSegs) {
  const keys = Object.keys(seg.attrs);
  const expected = ['type', ...FIELDS.map((f) => f.attr)];
  assert(keys.join() === expected.join(), `chapter at offset ${seg.start}: attributes are not the standard set`);
  const meta = {};
  for (const f of FIELDS) meta[f.key] = fromAttr(f, seg.attrs[f.attr]);
  for (const f of FIELDS) assert(toAttr(f, meta[f.key]) === seg.attrs[f.attr], `${meta.id}: ${f.attr} does not round-trip`);
  assert(BOOK_SLUGS[meta.book] !== undefined, `${meta.id}: unknown book ${meta.book}`);
  assert(seg.body.startsWith('\n'), `${meta.id}: body does not start with a newline`);
  const body = unescapeChapterBody(seg.body.slice(1));
  const file = `${bookDir(meta.book)}/${meta.id}.md`;
  const text = emitFrontmatter(meta) + body;
  const back = parseChapterFile(text, file);
  for (const f of FIELDS) assert(JSON.stringify(back.meta[f.key]) === JSON.stringify(meta[f.key]), `${file}: frontmatter field "${f.key}" does not parse back`);
  assert(back.body === body, `${file}: body does not parse back`);
  assert(!files.has(file), `duplicate chapter id ${meta.id}`);
  files.set(file, text);
  (order[meta.book] ||= []).push(meta.id);
}

// The chapter region is: per book "<!-- BOOK n START -->", its chapters, and
// "<!-- BOOK n END -->", all joined by single newlines.
const regionStart = html.indexOf('<!-- BOOK 0 START -->');
const lastBook = Math.max(...Object.keys(order).map(Number));
const endMarker = `<!-- BOOK ${lastBook} END -->`;
const regionEnd = html.indexOf(endMarker) + endMarker.length;
const byId = new Map(chapterSegs.map((s) => [s.attrs['data-id'], s]));
const regenerated = Object.keys(order).map(Number).sort((a, b) => a - b).map((n) =>
  [`<!-- BOOK ${n} START -->`, ...order[n].map((id) => html.slice(byId.get(id).start, byId.get(id).end)), `<!-- BOOK ${n} END -->`].join('\n')
).join('\n');
assert(html.slice(regionStart, regionEnd) === regenerated, 'the chapter region does not follow the START, chapters, END pattern');

// ----- Data -----
const dataSegs = segments.filter(isData);
const dataManifest = [];
for (const seg of dataSegs) {
  const id = seg.attrs.id;
  const layout = DATA_LAYOUT[id];
  assert(layout, `no layout for data block ${id}`);
  assert(seg.openTag === `<script type="application/json" id="${id}">`, `${id}: unexpected tag form`);
  const value = JSON.parse(seg.body);
  const style = ['compact', 'spaced'].find((s) => serializeData(value, s) === seg.body);
  assert(style, `${id}: no known serializer reproduces this block`);
  const entry = { id, style, ...layout };
  if (layout.file) {
    files.set(layout.file, prettyJSON(value));
  } else {
    assert(Object.keys(value).join() === layout.wrap, `${id}: expected a single "${layout.wrap}" key`);
    const items = value[layout.wrap];
    if (layout.split === 'id') {
      for (const item of items) files.set(`${layout.dir}/${item.id}.json`, prettyJSON(item));
    } else {
      const groups = {};
      for (const item of items) (groups[item[layout.split]] ||= []).push(item);
      for (const [key, list] of Object.entries(groups)) files.set(`${layout.dir}/${key}.json`, prettyJSON(list));
    }
    files.set(`${layout.dir}/_index.json`, prettyJSON(items.map((i) => i.id)));
  }
  dataManifest.push(entry);
}
const dataStart = dataSegs[0].start;
const dataEnd = dataSegs[dataSegs.length - 1].end;
assert(html.slice(dataStart, dataEnd) === dataSegs.map((s) => html.slice(s.start, s.end)).join('\n'), 'data blocks are not separated by single newlines');

// ----- Shell -----
// The font links and the two CDN scripts become placeholders too, so a build
// can self-host them. "--cdn" builds put the original tags back (manifest.cdn).
const fontsStart = html.indexOf('<link rel="preconnect" href="https://fonts.googleapis.com">');
const fontsSheet = html.indexOf('<link rel="stylesheet" href="https://fonts.googleapis.com/');
assert(fontsStart > 0 && fontsSheet > fontsStart, 'font links not found');
const fontsEnd = html.indexOf('>', fontsSheet) + 1;
const cdnScript = (needle) => {
  const s = segments.filter((x) => x.kind === 'script' && typeof x.attrs.src === 'string' && x.attrs.src.includes(needle));
  assert(s.length === 1, `expected one <script src> for ${needle}`);
  return s[0];
};
const markedTag = cdnScript('marked@');
const highlightTag = cdnScript('highlight.js/');
const cdn = {
  note: 'The original CDN tags, emitted by "--cdn" builds so the round trip can compare with the source.',
  fonts: html.slice(fontsStart, fontsEnd),
  marked: html.slice(markedTag.start, markedTag.end),
  highlight: html.slice(highlightTag.start, highlightTag.end)
};
const cut = [
  [fontsStart, fontsEnd, PLACEHOLDER.fonts],
  [style.start, style.end, PLACEHOLDER.styles],
  [regionStart, regionEnd, PLACEHOLDER.chapters],
  [dataStart, dataEnd, PLACEHOLDER.data],
  [markedTag.start, markedTag.end, PLACEHOLDER.marked],
  [highlightTag.start, highlightTag.end, PLACEHOLDER.highlight],
  [engine.start, engine.end, PLACEHOLDER.lazy + PLACEHOLDER.engine]
];
let shell = '';
let at = 0;
for (const [s, e, ph] of cut) {
  assert(s >= at, 'segments overlap');
  shell += html.slice(at, s) + ph;
  at = e;
}
shell += html.slice(at);
// Two insertion points for site pages: extra head tags after the description,
// and pre-rendered content at the start of <main>. Empty in single-file builds.
const insertAfter = (s, needle, ph) => { assert(s.split(needle).length === 2, `shell: expected one ${needle}`); return s.replace(needle, () => needle + ph); };
shell = insertAfter(shell, shell.match(/<meta name="description" content="[^"]*">/)[0], PLACEHOLDER.head);
shell = insertAfter(shell, '<main id="main" tabindex="-1">', PLACEHOLDER.main);
files.set('engine/shell.html', shell);

// ----- Manifest -----
const manifest = {
  note: 'Generated by scripts/extract.mjs. Records what the build needs to reproduce the source page exactly.',
  source: { file: SOURCE, sha256, bytes: Buffer.byteLength(html) },
  placeholders: PLACEHOLDER,
  styles: { file: 'engine/styles.css', open: style.openTag, close: style.closeTag, lead: lead(style.body) },
  engine: { file: 'engine/engine.js', open: engine.openTag, close: engine.closeTag, lead: lead(engine.body) },
  chapters: {
    attributes: ['type="text/markdown"', ...FIELDS.map((f) => f.attr)],
    bodyLead: '\n',
    separator: '\n',
    bookStart: '<!-- BOOK {n} START -->',
    bookEnd: '<!-- BOOK {n} END -->'
  },
  data: { separator: '\n', blocks: dataManifest },
  cdn
};
files.set('build/manifest.json', prettyJSON(manifest));

// ----- Write -----
const conflicts = [];
let written = 0;
for (const [file, text] of files) {
  if (exists(file)) {
    const current = readText(file);
    if (current === text) continue;
    if (!FORCE) { conflicts.push(file); continue; }
  }
  writeText(file, text);
  written++;
}
if (conflicts.length) {
  fail(`${conflicts.length} file(s) differ from what the source produces and were not overwritten:\n  ${conflicts.slice(0, 20).join('\n  ')}${conflicts.length > 20 ? '\n  ...' : ''}\nRe-run with --force to overwrite them.`);
}
const count = (prefix) => [...files.keys()].filter((f) => f.startsWith(prefix)).length;
console.log(`extracted ${chapterSegs.length} chapters, ${dataSegs.length} data blocks, styles, engine and shell`);
console.log(`files: content ${count('content/')}, data ${count('data/')}, engine ${count('engine/')}, build ${count('build/')} (${written} written, ${files.size - written} unchanged)`);
