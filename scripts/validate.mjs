#!/usr/bin/env node
// Checks every chapter, data file and the engine contract before anything is
// published. Errors fail the run; warnings point at content that falls short
// of the style guide but does not break anything.
//
//   node scripts/validate.mjs [--all-warnings] [--strict]
//
// Output lines read "file:line: error: message", so editors and agents can
// jump straight to the problem.
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { abs, exists, listFiles, readText } from './lib/fsutil.mjs';
import { parseChapterFile } from './lib/chapters.mjs';
import { jsonLines } from './lib/jsonlines.mjs';
import { engineInfo, engineCalculator } from './lib/engine-info.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage } from './lib/page.mjs';

const args = process.argv.slice(2);
const ALL_WARNINGS = args.includes('--all-warnings');
const STRICT = args.includes('--strict');

const errors = [], warnings = [];
const err = (file, line, msg) => errors.push({ file, line, msg });
const warn = (file, line, msg, rule) => warnings.push({ file, line, msg, rule });

// ----- Schemas -----
const ajv = new Ajv({ allErrors: true, strict: true });
for (const f of listFiles('schemas', '.schema.json')) ajv.addSchema(JSON.parse(readText(f)));
function schemaCheck(schema, value, file, lineOf) {
  const v = ajv.getSchema(schema);
  if (v(value)) return true;
  for (const e of v.errors) err(file, lineOf(e.instancePath), `${e.instancePath || '(top level)'} ${e.message}${e.params && e.params.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}${e.params && e.params.additionalProperty ? ` ("${e.params.additionalProperty}")` : ''}`);
  return false;
}
function loadJSONFile(file, schema) {
  let text;
  try { text = readText(file); } catch { err(file, 1, 'file is missing'); return null; }
  let value;
  try { value = JSON.parse(text); } catch (e) { err(file, 1, `invalid JSON: ${e.message}`); return null; }
  const lineOf = jsonLines(text);
  if (schema) schemaCheck(schema, value, file, lineOf);
  return { value, lineOf, text };
}

// ----- Engine contract -----
let engine;
try { engine = engineInfo(); } catch (e) { err('engine/engine.js', 1, e.message); engine = { components: [], models: [], widgets: [], callouts: [], pages: [], prefixes: [], interactive: [] }; }
let calc = null;
try { calc = engineCalculator(); } catch (e) { err('engine/engine.js', 1, e.message); }

// ----- Site and data -----
const site = loadJSONFile('site.config.json', 'site-config.schema.json');
const manifest = JSON.parse(readText('build/manifest.json'));
const SCHEMA_FOR = {
  'data-meta': 'meta.schema.json', 'data-books': 'books.schema.json', 'data-timeline': 'timeline.schema.json', 'data-paths': 'paths.schema.json',
  'data-matrices': 'matrices.schema.json', 'data-cheatsheets': 'cheatsheets.schema.json', 'data-presets': 'presets.schema.json', 'data-wizards': 'wizards.schema.json',
  'data-apocrypha': 'apocrypha.schema.json', 'data-didyouknow': 'didyouknow.schema.json', 'data-changelog': 'changelog.schema.json', 'data-aliases': 'aliases.schema.json',
  'data-glossary': 'glossary-term.schema.json', 'data-quizzes': 'quiz-file.schema.json'
};
const D = {};
const glossaryFiles = [], quizFiles = [];
for (const block of manifest.data.blocks) {
  const key = block.id.slice(5);
  if (block.file) { D[key] = loadJSONFile(block.file, SCHEMA_FOR[block.id]); continue; }
  D[key + 'Index'] = loadJSONFile(`${block.dir}/_index.json`, 'index.schema.json');
  for (const f of listFiles(block.dir, '.json')) {
    if (f.endsWith('/_index.json')) continue;
    const loaded = loadJSONFile(f, SCHEMA_FOR[block.id]);
    if (loaded) (key === 'glossary' ? glossaryFiles : quizFiles).push({ file: f, ...loaded });
  }
}
const val = (k, fallback) => (D[k] && D[k].value) || fallback;
const books = val('books', { parts: [], books: [] });
const aliases = val('aliases', {});
const terms = glossaryFiles.map((g) => ({ ...g.value, _file: g.file, _line: 1 }));
const questions = quizFiles.flatMap((q) => (Array.isArray(q.value) ? q.value : []).map((x, i) => ({ ...x, _file: q.file, _line: q.lineOf(`/${i}`) })));
const wanted = exists('data/wanted.json') ? loadJSONFile('data/wanted.json', 'wanted.schema.json') : null;
const wantedIds = new Set(((wanted && wanted.value && wanted.value.pages) || []).map((w) => w.id));

// ----- Chapters -----
const chapters = [];
for (const file of listFiles('content', '.md')) {
  if (file.startsWith('content/legal/')) continue;
  const text = readText(file);
  let parsed;
  try { parsed = parseChapterFile(text, file); } catch (e) { err(file, 1, e.message.replace(`${file}: `, '')); continue; }
  const fmLines = text.slice(0, text.indexOf('\n---\n') + 1).split('\n');
  const fmLine = (ptr) => { const key = (ptr || '').split('/')[1]; const i = fmLines.findIndex((l) => l.startsWith(`${key}:`)); return i >= 0 ? i + 1 : 1; };
  if (!schemaCheck('chapter.schema.json', parsed.meta, file, fmLine)) continue;
  chapters.push({ file, text, ...parsed, fmLine });
}
const chapterIds = new Map();
for (const c of chapters) {
  if (chapterIds.has(c.meta.id)) err(c.file, c.fmLine('/id'), `duplicate chapter id "${c.meta.id}" (also ${chapterIds.get(c.meta.id).file})`);
  else chapterIds.set(c.meta.id, c);
}
const bookNums = new Set(books.books.map((b) => b.n));
const isChapterId = (id) => chapterIds.has(id) || (aliases[id] && chapterIds.has(aliases[id]));

// Where a "#target" link may point.
const prefixCheck = {
  'book-': (x) => bookNums.has(Number(x)) || books.books.some((b) => b.id === `book-${x}`),
  'term-': (x) => terms.some((t) => t.id === x),
  'tool-': (x) => val('presets', { tools: [] }).tools.some((t) => t.id === x) || val('wizards', { wizards: [] }).wizards.some((w) => w.id === x),
  'path-': (x) => val('paths', { paths: [] }).paths.some((p) => p.id === x),
  'boss-': (x) => bookNums.has(Number(x)),
  'matrix-': (x) => val('matrices', { matrices: [] }).matrices.some((m) => m.id === x),
  'cmd-': (x) => val('cheatsheets', { sheets: [] }).sheets.some((s) => s.id === x)
};
function resolveRoute(target) {
  if (isChapterId(target) || engine.pages.includes(target)) return 'ok';
  if (aliases[target] && engine.pages.includes(aliases[target])) return 'ok';
  const p = engine.prefixes.find((x) => target.startsWith(x));
  if (p && prefixCheck[p] && prefixCheck[p](target.slice(p.length))) return 'ok';
  if (wantedIds.has(target)) return 'wanted';
  return null;
}
const termKey = new Map();
for (const t of terms) for (const n of [t.term, ...(t.aliases || [])]) {
  const k = String(n).toLowerCase();
  if (termKey.has(k) && termKey.get(k) !== t.id) warn(t._file, 1, `"${n}" is also a name of term "${termKey.get(k)}"; the engine links only the first`, 'glossary name collision');
  else termKey.set(k, t.id);
}
const resolveTerm = (ref) => terms.some((t) => t.id === ref) || termKey.has(ref.toLowerCase());

const MERMAID_TYPES = { flowchart: 'flowchart', graph: 'flowchart', sequenceDiagram: 'sequence', stateDiagram: 'state', 'stateDiagram-v2': 'state', classDiagram: 'class', erDiagram: 'er', gantt: 'gantt', pie: 'pie', mindmap: 'mindmap', timeline: 'timeline', journey: 'journey', gitGraph: 'git', quadrantChart: 'quadrant', 'xychart-beta': 'xychart', 'sankey-beta': 'sankey', 'block-beta': 'block', requirementDiagram: 'requirement' };
const FENCE = /^(```+|~~~+)[ \t]*([^\n]*)\n([\s\S]*?)\n\1[ \t]*$/gm;
const parseInfo = (info) => { const o = {}; String(info || '').replace(/([a-z_]+)=(?:"([^"]*)"|(\S+))/gi, (m, k, a, b) => { o[k] = a != null ? a : b; return ''; }); return o; };
const TEMPLATE_HEADINGS = ['Why it matters', 'Intuition', 'How it works', 'In practice', 'Numbers to know', 'Pitfalls', 'Talk like an expert', 'Check yourself', 'Go deeper', 'Related'];

const visualOwner = new Map();
const inbound = new Map();
const today = new Date();
const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const ordersByBook = new Map();
let visualCount = 0;

for (const c of chapters) {
  const { file, meta, body, bodyLine } = c;
  const lineAt = (index) => bodyLine + body.slice(0, index).split('\n').length - 1;
  // place and order
  const folder = path.posix.basename(path.posix.dirname(file));
  if (Number.parseInt(folder, 10) !== meta.book) err(file, c.fmLine('/book'), `book is ${meta.book} but the file is in ${folder}/`);
  if (!bookNums.has(meta.book)) err(file, c.fmLine('/book'), `book ${meta.book} is not in data/books.json`);
  if (meta.order.split('.')[0] !== String(meta.book)) err(file, c.fmLine('/order'), `order "${meta.order}" must start with the book number ${meta.book}`);
  const key = `${meta.book}|${meta.order}`;
  if (ordersByBook.has(key)) err(file, c.fmLine('/order'), `order "${meta.order}" is also used by ${ordersByBook.get(key)}`);
  else ordersByBook.set(key, meta.id);
  if (meta.reviewed > thisMonth) err(file, c.fmLine('/reviewed'), `reviewed "${meta.reviewed}" is in the future`);

  // fenced blocks
  const blocks = [];
  let prose = body;
  for (const m of body.matchAll(FENCE)) {
    blocks.push({ lang: (m[2].trim().split(/\s+/)[0] || '').toLowerCase(), info: m[2].trim(), body: m[3], line: lineAt(m.index) });
    prose = prose.slice(0, m.index) + m[0].replace(/[^\n]/g, ' ') + prose.slice(m.index + m[0].length);
  }
  for (const m of prose.matchAll(/^[ \t]*(```|~~~)/gm)) err(file, lineAt(m.index), 'code fence is not closed (or is closed with a different fence)');

  const listed = new Set(meta.visuals);
  const found = new Set();
  let interactive = 0;
  const linksInSpec = [];
  for (const b of blocks) {
    if (b.lang === 'viz') {
      let spec;
      try { spec = JSON.parse(b.body); } catch (e) { err(file, b.line, `viz block is not valid JSON: ${e.message}`); continue; }
      schemaCheck('viz.schema.json', spec, file, () => b.line);
      if (!spec.id) continue;
      found.add(`${spec.id}:${spec.component}`);
      if (!engine.components.includes(spec.component)) err(file, b.line, `viz "${spec.id}": unknown component "${spec.component}" (the engine has ${engine.components.join(', ')})`);
      if (spec.component === 'explorer' && spec.model && !engine.models.includes(spec.model)) err(file, b.line, `viz "${spec.id}": unknown explorer model "${spec.model}"`);
      if (engine.interactive.includes(spec.component)) interactive++;
      if (visualOwner.has(spec.id)) err(file, b.line, `visual id "${spec.id}" is also used in ${visualOwner.get(spec.id)}`);
      visualOwner.set(spec.id, file);
      if (spec.component === 'calculator') {
        const tests = Array.isArray(spec.tests) ? spec.tests : [];
        if (tests.length < 2) err(file, b.line, `calculator "${spec.id}" needs at least two tests (has ${tests.length})`);
        if (calc) tests.forEach((t, i) => {
          try { if (!calc.calcCheck(spec, t)) err(file, b.line, `calculator "${spec.id}": test ${i + 1} fails: expected ${JSON.stringify(t.expect ?? t.expect_bytes)}, got ${JSON.stringify(calc.calcRun(spec, t.inputs).res)}`); }
          catch (e) { err(file, b.line, `calculator "${spec.id}": test ${i + 1} cannot run: ${e.message}`); }
        });
      }
      JSON.stringify(spec, (k, v) => { if (typeof v === 'string' && /^#[a-z0-9-]+$/.test(v)) linksInSpec.push({ target: v.slice(1), line: b.line }); return v; });
    } else if (b.lang === 'mermaid' || b.lang === 'svg') {
      const info = parseInfo(b.info);
      for (const k of ['id', 'title', 'caption', 'alt']) if (!info[k]) err(file, b.line, `${b.lang} block needs ${k}="…" in its info string`);
      if (!info.id) continue;
      const first = b.body.trim().split(/\s+/)[0];
      const form = b.lang === 'svg' ? 'svg' : MERMAID_TYPES[first];
      if (!form) err(file, b.line, `mermaid "${info.id}": unknown diagram type "${first}"`);
      found.add(`${info.id}:${form}`);
      if (visualOwner.has(info.id)) err(file, b.line, `visual id "${info.id}" is also used in ${visualOwner.get(info.id)}`);
      visualOwner.set(info.id, file);
    } else if (b.lang === 'widget') {
      if (!engine.widgets.includes(b.body.trim())) err(file, b.line, `unknown widget "${b.body.trim()}" (the engine has ${engine.widgets.join(', ')})`);
    } else if (b.lang === 'quiz') {
      const target = b.body.trim() || meta.id;
      if (!questions.some((q) => q.chapter === target)) err(file, b.line, `quiz block points to "${target}", which has no questions in data/quizzes/`);
    }
  }
  visualCount += found.size;
  for (const v of found) if (!listed.has(v)) err(file, c.fmLine('/visuals'), `visual "${v}" is in the body but not in the frontmatter visuals list`);
  for (const v of listed) if (!found.has(v)) err(file, c.fmLine('/visuals'), `visual "${v}" is listed in the frontmatter but not in the body`);

  // callouts, tldr, quiz
  for (const m of prose.matchAll(/^>\s*\[!([A-Za-z]+)\]/gm)) if (!engine.callouts.includes(m[1].toLowerCase())) err(file, lineAt(m.index), `unknown callout "[!${m[1]}]" (the engine has ${engine.callouts.join(', ')})`);
  if (!/^\s*>\s*\[!tldr\]/i.test(body)) err(file, bodyLine, 'the chapter must open with a > [!tldr] callout');
  const own = questions.filter((q) => q.chapter === meta.id);
  if (meta.status === 'full') {
    if (!blocks.some((b) => b.lang === 'quiz')) err(file, bodyLine, 'a full chapter needs a ```quiz block');
    if (own.length < 2) err(file, bodyLine, `a full chapter needs 2 to 4 quiz questions in data/quizzes/${meta.id}.json (has ${own.length})`);
    else if (own.length > 4) warn(file, bodyLine, `${own.length} quiz questions; the template asks for 2 to 4`, 'quiz length');
    if (found.size < 2 || found.size > 4) warn(file, c.fmLine('/visuals'), `${found.size} visuals; full chapters have 2 to 4`, 'visuals per chapter');
    if (!interactive) warn(file, c.fmLine('/visuals'), 'no interactive or animated visual', 'interactive visual');
    for (const h of TEMPLATE_HEADINGS) if (!new RegExp(`^## ${h}`, 'm').test(prose)) warn(file, bodyLine, `no "## ${h}" section`, 'template section');
  }

  // links
  const links = [...[...prose.matchAll(/\]\(#([^)\s]+)\)/g)].map((m) => ({ target: m[1], line: lineAt(m.index) })), ...linksInSpec];
  const linkedHere = new Set();
  for (const l of links) {
    const r = resolveRoute(l.target);
    if (r === 'wanted') warn(file, l.line, `link to wanted page #${l.target}`, 'wanted page link');
    else if (!r) err(file, l.line, `link #${l.target} does not resolve to a chapter, alias or page`);
    const to = aliases[l.target] || l.target;
    if (chapterIds.has(to) && to !== meta.id) linkedHere.add(to);
  }
  for (const to of linkedHere) inbound.set(to, (inbound.get(to) || 0) + 1);
  for (const m of prose.matchAll(/\[\[([^\]\n]+?)\]\]/g)) {
    const parts = m[1].split('|');
    const ref = (parts[1] || parts[0]).trim();
    if (!resolveTerm(ref)) err(file, lineAt(m.index), `glossary link [[${m[1]}]] matches no term or alias`);
  }
}
for (const c of chapters) {
  const n = inbound.get(c.meta.id) || 0;
  if (n < 2) warn(c.file, 1, `linked from ${n} other chapter(s); every chapter should be reachable from at least two`, 'inbound links');
}

// ----- Template text left behind -----
for (const file of [...chapters.map((c) => c.file), ...glossaryFiles.map((g) => g.file), ...quizFiles.map((q) => q.file)]) {
  readText(file).split('\n').forEach((l, i) => { if (/\bTODO:/.test(l)) err(file, i + 1, 'template text "TODO:" is still here; replace it with real content'); });
}

// ----- Data cross-references -----
const refCheck = (file, lineOf, ptr, id, what = 'chapter') => { if (!isChapterId(id) && !wantedIds.has(id)) err(file, lineOf(ptr), `${what} "${id}" does not exist`); };
const unique = (file, lineOf, list, ptrOf, label) => { const seen = new Set(); list.forEach((x, i) => { if (seen.has(x.id)) err(file, lineOf(ptrOf(i)), `duplicate ${label} id "${x.id}"`); seen.add(x.id); }); };

if (D.meta && site && D.meta.value.title !== site.value.name) err('data/meta.json', D.meta.lineOf('/title'), `title "${D.meta.value.title}" must equal the name in site.config.json ("${site.value.name}")`);
if (D.books) {
  const { lineOf } = D.books;
  const inParts = new Map();
  books.parts.forEach((p, i) => p.books.forEach((n, j) => { if (!bookNums.has(n)) err('data/books.json', lineOf(`/parts/${i}/books/${j}`), `part "${p.id}" lists book ${n}, which does not exist`); inParts.set(n, (inParts.get(n) || 0) + 1); }));
  books.books.forEach((b, i) => { if (inParts.get(b.n) !== 1) err('data/books.json', lineOf(`/books/${i}`), `book ${b.n} must belong to exactly one part`); });
}
for (const g of glossaryFiles) {
  const t = g.value;
  if (path.posix.basename(g.file, '.json') !== t.id) err(g.file, g.lineOf('/id'), `file name must equal the id "${t.id}"`);
  (t.chapters || []).forEach((id, i) => refCheck(g.file, g.lineOf, `/chapters/${i}`, id));
  if (t.practice === '') warn(g.file, g.lineOf('/practice'), 'empty "practice": the glossary template asks for one line on what the term means in practice', 'glossary practice line');
}
for (const q of quizFiles) {
  const name = path.posix.basename(q.file, '.json');
  if (!isChapterId(name)) err(q.file, 1, `no chapter "${name}" for this quiz file`);
  (Array.isArray(q.value) ? q.value : []).forEach((x, i) => {
    if (x.chapter !== name) err(q.file, q.lineOf(`/${i}/chapter`), `question "${x.id}" belongs to "${x.chapter}" but the file is ${name}.json`);
    if (Array.isArray(x.options) && (x.answer >= x.options.length)) err(q.file, q.lineOf(`/${i}/answer`), `question "${x.id}": answer ${x.answer} but only ${x.options.length} options (counting from 0)`);
  });
}
{
  const seen = new Map();
  for (const q of questions) { if (seen.has(q.id)) err(q._file, q._line, `duplicate question id "${q.id}" (also in ${seen.get(q.id)})`); else seen.set(q.id, q._file); }
}
for (const [key, list, label] of [['glossaryIndex', terms, 'term'], ['quizzesIndex', questions, 'question']]) {
  const idx = D[key];
  if (!idx) continue;
  const ids = new Set(list.map((x) => x.id));
  idx.value.forEach((id, i) => { if (!ids.has(id)) warn(key === 'glossaryIndex' ? 'data/glossary/_index.json' : 'data/quizzes/_index.json', idx.lineOf(`/${i}`), `lists ${label} "${id}", which no longer exists`, 'stale index entry'); });
}
if (D.timeline) {
  const { value: T, lineOf } = D.timeline, f = 'data/timeline.json';
  const tracks = new Set(T.tracks.map((t) => t.id));
  unique(f, lineOf, T.events, (i) => `/events/${i}`, 'event');
  T.events.forEach((e, i) => { if (!tracks.has(e.track)) err(f, lineOf(`/events/${i}/track`), `event "${e.id}": unknown track "${e.track}"`); e.chapters.forEach((id, j) => refCheck(f, lineOf, `/events/${i}/chapters/${j}`, id)); });
  T.eras.forEach((e, i) => e.chapters.forEach((id, j) => refCheck(f, lineOf, `/eras/${i}/chapters/${j}`, id)));
}
if (D.paths) {
  const { value: P, lineOf } = D.paths, f = 'data/paths.json';
  P.paths.forEach((p, i) => {
    p.steps.forEach((id, j) => refCheck(f, lineOf, `/paths/${i}/steps/${j}`, id));
    if (p.weeks && p.weeks.length !== p.steps.length) err(f, lineOf(`/paths/${i}/weeks`), `path "${p.id}": ${p.weeks.length} weeks for ${p.steps.length} steps`);
  });
  P.ladder.forEach((l, i) => l.chapters.forEach((id, j) => refCheck(f, lineOf, `/ladder/${i}/chapters/${j}`, id)));
}
if (D.matrices) {
  const { value: M, lineOf } = D.matrices, f = 'data/matrices.json';
  unique(f, lineOf, M.matrices, (i) => `/matrices/${i}`, 'matrix');
  M.matrices.forEach((m, i) => {
    refCheck(f, lineOf, `/matrices/${i}/chapter`, m.chapter);
    const cols = new Set(m.columns.map((c) => c.id));
    m.rows.forEach((r, j) => Object.keys(r).forEach((k) => { if (!cols.has(k)) warn(f, lineOf(`/matrices/${i}/rows/${j}`), `matrix "${m.id}": row ${j + 1} has "${k}", which is not a column`, 'matrix columns'); }));
  });
}
if (D.cheatsheets) { const { value: C, lineOf } = D.cheatsheets; unique('data/cheatsheets.json', lineOf, C.sheets, (i) => `/sheets/${i}`, 'sheet'); C.sheets.forEach((s, i) => refCheck('data/cheatsheets.json', lineOf, `/sheets/${i}/chapter`, s.chapter)); }
if (D.presets) {
  const { value: P, lineOf } = D.presets, f = 'data/presets.json';
  unique(f, lineOf, P.tools, (i) => `/tools/${i}`, 'tool');
  P.tools.forEach((t, i) => {
    refCheck(f, lineOf, `/tools/${i}/chapter`, t.chapter);
    if (t.viz && !visualOwner.has(t.viz)) err(f, lineOf(`/tools/${i}/viz`), `tool "${t.id}": no visual with id "${t.viz}"`);
    if (t.spec) { schemaCheck('viz.schema.json', t.spec, f, () => lineOf(`/tools/${i}/spec`)); if (!engine.components.includes(t.spec.component)) err(f, lineOf(`/tools/${i}/spec`), `tool "${t.id}": unknown component "${t.spec.component}"`); }
  });
}
if (D.wizards) {
  const { value: W, lineOf } = D.wizards, f = 'data/wizards.json';
  W.wizards.forEach((w, i) => {
    if (!w.nodes[w.start]) err(f, lineOf(`/wizards/${i}/start`), `wizard "${w.id}": start node "${w.start}" does not exist`);
    for (const [nid, n] of Object.entries(w.nodes)) {
      (n.options || []).forEach((o, j) => { if (!w.nodes[o[1]]) err(f, lineOf(`/wizards/${i}/nodes/${nid}/options/${j}`), `wizard "${w.id}": option "${o[0]}" leads to missing node "${o[1]}"`); });
      (n.links || []).forEach((id, j) => refCheck(f, lineOf, `/wizards/${i}/nodes/${nid}/links/${j}`, id));
    }
  });
}
if (D.apocrypha) D.apocrypha.value.takes.forEach((t, i) => t.chapters.forEach((id, j) => refCheck('data/apocrypha.json', D.apocrypha.lineOf, `/takes/${i}/chapters/${j}`, id)));
if (D.didyouknow) D.didyouknow.value.facts.forEach((x, i) => refCheck('data/didyouknow.json', D.didyouknow.lineOf, `/facts/${i}/chapter`, x.chapter));
if (D.changelog) D.changelog.value.entries.forEach((e, i) => e.chapters.forEach((id, j) => { if (!isChapterId(id)) warn('data/changelog.json', D.changelog.lineOf(`/entries/${i}/chapters/${j}`), `version ${e.version} lists "${id}", which no longer exists`, 'changelog reference'); }));
if (D.aliases) for (const [from, to] of Object.entries(aliases)) {
  const line = D.aliases.lineOf(`/${from}`);
  if (chapterIds.has(from)) err('data/aliases.json', line, `"${from}" is an existing chapter id and cannot also be an alias`);
  if (!chapterIds.has(to) && !engine.pages.includes(to)) err('data/aliases.json', line, `alias "${from}" points to "${to}", which does not exist`);
}

// ----- Coverage map -----
// docs/COVERAGE_MAP.md lists every chapter with its status; planned topics
// have no file yet. Warn when the map and the frontmatter drift apart.
if (exists('docs/COVERAGE_MAP.md')) {
  const MAP = 'docs/COVERAGE_MAP.md';
  const mapped = new Map();
  readText(MAP).split('\n').forEach((l, i) => {
    const m = l.match(/^\| ([0-9.]+) \| (?:\[[^\]]*\]\(\.\.\/content\/[^/]+\/([a-z0-9-]+)\.md\)|[^|]*\(`([a-z0-9-]+)`\)) \| (full|seed|planned) \|/);
    if (m) mapped.set(m[2] || m[3], { status: m[4], line: i + 1, order: m[1] });
  });
  for (const c of chapters) {
    const row = mapped.get(c.meta.id);
    if (!row) warn(MAP, 1, `chapter "${c.meta.id}" (${c.file}) is not in the coverage map`, 'coverage map');
    else if (row.status !== c.meta.status) warn(MAP, row.line, `"${c.meta.id}" is ${row.status} in the map but ${c.meta.status} in its frontmatter`, 'coverage map');
  }
  for (const [id, row] of mapped) if (row.status !== 'planned' && !chapterIds.has(id)) warn(MAP, row.line, `"${id}" is in the map as ${row.status}, but no such chapter exists`, 'coverage map');
}

// ----- The built page -----
if (!errors.length) {
  try { renderPage(loadProject(), { mode: 'cdn' }); }
  catch (e) { err('build', 1, e.message); }
}

// ----- Report -----
const sortKey = (x) => `${x.file}\u0000${String(x.line).padStart(6, '0')}`;
errors.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
for (const e of errors) console.log(`${e.file}:${e.line}: error: ${e.msg}`);
const byRule = new Map();
for (const w of warnings) (byRule.get(w.rule) || byRule.set(w.rule, []).get(w.rule)).push(w);
for (const [rule, list] of byRule) {
  console.log(`\nwarning: ${rule} (${list.length})`);
  for (const w of (ALL_WARNINGS ? list : list.slice(0, 5))) console.log(`  ${w.file}:${w.line}: ${w.msg}`);
  if (!ALL_WARNINGS && list.length > 5) console.log(`  … ${list.length - 5} more (run with --all-warnings)`);
}
const fail = errors.length > 0 || (STRICT && warnings.length > 0);
console.log(`\nvalidate: ${errors.length} error(s), ${warnings.length} warning(s). Checked ${chapters.length} chapters, ${visualCount} visuals, ${terms.length} glossary terms, ${questions.length} quiz questions.`);
process.exit(fail ? 1 : 0);
