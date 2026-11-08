#!/usr/bin/env node
// Builds the page and compares it with source/bible-v2.0.0.html.
//
// The goal is a byte-identical page. Approved changes since the migration
// (the rename, marked engine changes) are listed in
// build/roundtrip-allowlist.json: each entry is an exact "from" -> "to"
// replacement inside one scope, with the number of times it must apply. The
// expected page is the source with those replacements, so any other
// difference still fails.
//
// If the bytes differ, the code (engine, styles, shell) must still match, and
// content changes since the source are listed. See the comment below.
//
//   node scripts/roundtrip.mjs [--strict]
import crypto from 'node:crypto';
import fs from 'node:fs';
import { abs, exists, readJSON, writeText, fail } from './lib/fsutil.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage } from './lib/page.mjs';
import { scanSegments, isChapter, isData, isEngine } from './lib/segments.mjs';

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

let built;
try {
  built = renderPage(loadProject(), { mode: 'cdn' });
} catch (e) {
  fail(e.message);
}
writeText('dist/ground-truth-cdn.html', built);

const manifest = readJSON('build/manifest.json');
const source = fs.readFileSync(abs(manifest.source.file), 'utf8');
const ALLOWLIST = 'build/roundtrip-allowlist.json';
const entries = exists(ALLOWLIST) ? readJSON(ALLOWLIST).entries : [];

const scopeOf = (s) => isChapter(s) ? ['chapters', `chapter:${s.attrs['data-id']}`]
  : isData(s) ? ['data', `data:${s.attrs.id}`]
  : isEngine(s) ? ['engine'] : s.kind === 'style' ? ['styles'] : ['shell'];

function applyAllowlist(html) {
  const segs = scanSegments(html).map((s) => ({ scopes: scopeOf(s), text: html.slice(s.start, s.end) }));
  const problems = [];
  entries.forEach((e, i) => {
    let n = 0;
    for (const s of segs) {
      if (!s.scopes.includes(e.scope)) continue;
      const parts = s.text.split(e.from);
      n += parts.length - 1;
      s.text = parts.join(e.to);
    }
    if (n !== e.count) problems.push(`allowlist entry ${i + 1} (${e.scope}): expected ${e.count} occurrence(s) of ${JSON.stringify(e.from.slice(0, 60))}, found ${n}`);
  });
  if (problems.length) fail(`${ALLOWLIST} no longer matches the source:\n  ${problems.join('\n  ')}`);
  return segs.map((s) => s.text).join('');
}
const expected = applyAllowlist(source);
const changes = entries.reduce((a, e) => a + e.count, 0);
const versus = entries.length ? `the source plus ${changes} approved replacement(s) from ${entries.length} allowlist entries` : 'the source';

if (built === expected) {
  console.log(`round trip: byte-identical to ${versus} (${Buffer.byteLength(built)} bytes, sha256 ${sha(built)})`);
  process.exit(0);
}

// ----- Structural comparison -----
// Code (engine, styles, the page shell and its CDN tags) must match exactly:
// a difference there is an unapproved engine change. Content (chapters and
// data) grows with every contribution, so additions and edits since the
// source are reported, and only a removal fails, because deleting content
// needs the owner's approval. --strict fails on any difference.
const code = [], content = [], removed = [];
const A = scanSegments(expected), B = scanSegments(built);
const one = (segs, f) => segs.find(f);
for (const [name, f] of [['styles', (s) => s.kind === 'style'], ['engine', isEngine]]) {
  const a = one(A, f), b = one(B, f);
  if (!a || !b) { code.push(`${name}: missing`); continue; }
  if (a.body !== b.body) {
    let i = [...a.body].findIndex((ch, k) => ch !== b.body[k]);
    if (i < 0) i = Math.min(a.body.length, b.body.length);
    code.push(`${name} differs at character ${i}\n      expected ${JSON.stringify(a.body.slice(Math.max(0, i - 40), i + 60))}\n      built    ${JSON.stringify(b.body.slice(Math.max(0, i - 40), i + 60))}`);
  }
}
const BOOK_MARKS = /<!-- BOOK \d+ (?:START|END) -->\n?/g;
const shellOf = (segs) => segs.filter((s) => s.kind === 'html' || (s.kind === 'script' && s.attrs.src)).map((s) => (s.text || s.openTag + s.closeTag).replace(BOOK_MARKS, '')).join('').replace(/\n+/g, '\n');
if (shellOf(A) !== shellOf(B)) code.push('the page shell (static HTML or CDN tags) differs');

const chapters = (segs) => new Map(segs.filter(isChapter).map((s) => [s.attrs['data-id'], s]));
const ca = chapters(A), cb = chapters(B);
const aliases = (() => { const d = one(B, (s) => isData(s) && s.attrs.id === 'data-aliases'); return d ? JSON.parse(d.body) : {}; })();
for (const id of ca.keys()) if (!cb.has(id)) (aliases[id] && cb.has(aliases[id]) ? content : removed).push(aliases[id] && cb.has(aliases[id]) ? `chapter ${id}: renamed to ${aliases[id]}` : `chapter ${id}: removed`);
const added = [...cb.keys()].filter((id) => !ca.has(id));
const changed = [...ca.keys()].filter((id) => cb.has(id) && (ca.get(id).openTag !== cb.get(id).openTag || ca.get(id).body !== cb.get(id).body));
if (added.length) content.push(`${added.length} chapter(s) added: ${added.join(', ')}`);
if (changed.length) content.push(`${changed.length} chapter(s) changed: ${changed.slice(0, 12).join(', ')}${changed.length > 12 ? ', …' : ''}`);
const datas = (segs) => new Map(segs.filter(isData).map((s) => [s.attrs.id, s.body]));
const da = datas(A), db = datas(B);
for (const [id, a] of da) {
  if (!db.has(id)) { removed.push(`data ${id}: removed`); continue; }
  if (a !== db.get(id)) content.push(`data ${id}: changed`);
}
for (const id of db.keys()) if (!da.has(id)) content.push(`data ${id}: added`);

const STRICT = process.argv.includes('--strict');
const failed = code.length || removed.length || STRICT;
console.log(`round trip: ${failed ? 'FAILED' : 'passed'}. The build is not byte-identical to ${versus}.`);
console.log(`  code (engine, styles, shell): ${code.length ? 'DIFFERS' : 'identical'}`);
for (const d of code) console.log(`    - ${d}`);
console.log(`  content: ${content.length || removed.length ? 'changed since the source' : 'identical'}`);
for (const d of [...removed.map((r) => r + ' (removing content needs the owner\'s approval)'), ...content]) console.log(`    - ${d}`);
if (code.length) console.log('  An engine change must be marked gt: and added to build/roundtrip-allowlist.json (engine/README.md).');
if (STRICT && !code.length && !removed.length) console.log('  --strict: every difference fails.');
process.exit(failed ? 1 : 0);
