#!/usr/bin/env node
// Finds what already exists before anyone writes something new. Ranks
// chapters (including playbooks and field notes) and glossary terms by
// matches in titles, tags, TL;DRs, headings and text.
//
//   npm run search -- <terms>            top 15 results
//   npm run search -- <terms> --all      every match
//   npm run search -- <terms> --json     machine-readable
import path from 'node:path';
import { listFiles, readJSON, fail } from './lib/fsutil.mjs';
import { loadChapters } from './lib/project.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const query = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!query) fail('usage: npm run search -- <terms>   (for example: npm run search -- prompt caching)');

const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'for', 'on', 'with', 'is', 'how', 'what', 'vs']);
const stem = (w) => w.replace(/(ies)$/, 'y').replace(/(?<=[a-z]{3})(es|s)$/, '');
const words = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter(Boolean).map(stem);
const terms = [...new Set(words(query).filter((w) => !STOP.has(w)))];
if (!terms.length) fail('the query has only stop words; add a more specific term');
const phrase = query.toLowerCase();

// A query that names a glossary term also matches the term's other names,
// so "model context protocol" finds chapters that only say "MCP".
const glossary = listFiles('data/glossary', '.json').filter((f) => !f.endsWith('/_index.json')).map((f) => ({ file: f, t: readJSON(f) }));
const synonyms = new Set();
for (const { t } of glossary) {
  const names = [t.term, t.abbr, ...(t.aliases || [])].filter(Boolean);
  if (names.some((n) => words(n).join(' ') === words(query).join(' '))) for (const n of names) for (const w of words(n)) if (!terms.includes(w) && !STOP.has(w)) synonyms.add(w);
}

// Field weights: a hit in the title counts most, a hit deep in the body least.
const WEIGHTS = { title: 10, alias: 8, tags: 6, tldr: 4, headings: 3, def: 3, body: 1 };
function score(fields) {
  let total = 0;
  const hits = new Set();
  for (const [field, text] of Object.entries(fields)) {
    if (!text) continue;
    const bag = words(text);
    for (const t of terms) {
      const n = bag.filter((w) => w === t).length;
      if (n) { hits.add(t); total += WEIGHTS[field] * Math.min(n, field === 'body' ? 5 : 2); }
    }
    for (const t of synonyms) {
      const n = bag.filter((w) => w === t).length;
      if (n) { terms.forEach((q) => hits.add(q)); total += WEIGHTS[field] * Math.min(n, field === 'body' ? 5 : 2); }
    }
    if (terms.length > 1 && String(text).toLowerCase().includes(phrase)) total += WEIGHTS[field] * 2;
  }
  // Results that match every term rank above results that match only some.
  return hits.size ? total * (hits.size / terms.length) ** 2 : 0;
}

const results = [];
let chapters;
try { chapters = loadChapters(); } catch (e) { fail(e.message); }
for (const c of chapters) {
  const body = c.body.replace(/^```[\s\S]*?^```/gm, ' ');
  const tldr = (c.body.match(/^>\s*\[!tldr\][^\n]*\n((?:>.*\n?)*)/im) || [])[1] || '';
  const headings = (c.body.match(/^#{2,3} .+$/gm) || []).join(' ');
  const s = score({ title: c.meta.title, tags: c.meta.tags.join(' '), tldr, headings, body });
  if (s) results.push({ score: s, type: c.meta.type || 'chapter', id: c.meta.id, title: `${c.meta.order} ${c.meta.title}`, file: c.file, status: c.meta.status });
}
for (const { file, t } of glossary) {
  const s = score({ title: t.term, alias: (t.aliases || []).join(' ') + ' ' + (t.abbr || ''), def: t.def, body: t.practice });
  if (s) results.push({ score: s, type: 'term', id: t.id, title: t.term, file });
}
results.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
const shown = flags.has('--all') ? results : results.slice(0, 15);

if (flags.has('--json')) {
  console.log(JSON.stringify({ query, results: shown.map(({ score: s, ...r }) => ({ ...r, score: Math.round(s * 10) / 10 })) }, null, 2));
} else if (!shown.length) {
  console.log(`No chapter or glossary term matches "${query}". Nothing similar exists yet.`);
} else {
  console.log(`${results.length} match(es) for "${query}"${results.length > shown.length ? `, top ${shown.length}` : ''}:\n`);
  const w = Math.max(...shown.map((r) => r.id.length));
  for (const r of shown) {
    const tag = r.type === 'chapter' ? (r.status === 'seed' ? 'seed' : 'chapter') : r.type;
    console.log(`${String(Math.round(r.score)).padStart(4)}  ${tag.padEnd(10)} ${r.id.padEnd(w)}  ${r.title}\n      ${''.padEnd(10)} ${path.posix.normalize(r.file)}`);
  }
}
