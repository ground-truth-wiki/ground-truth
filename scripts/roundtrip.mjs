#!/usr/bin/env node
// Builds the page and compares it with source/bible-v2.0.0.html.
//
// The goal is a byte-identical page. If the bytes differ, a structural
// comparison prints every difference: chapter set, attributes and bodies,
// data (deep-equal), styles, engine and segment order.
//
//   node scripts/roundtrip.mjs
import crypto from 'node:crypto';
import fs from 'node:fs';
import { abs, readJSON, writeText, fail } from './lib/fsutil.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage } from './lib/page.mjs';
import { scanSegments, isChapter, isData, isEngine } from './lib/segments.mjs';

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

let built;
try {
  built = renderPage(loadProject());
} catch (e) {
  fail(e.message);
}
writeText('dist/ground-truth.html', built);

const manifest = readJSON('build/manifest.json');
const expected = fs.readFileSync(abs(manifest.source.file), 'utf8');

if (built === expected) {
  console.log(`round trip: byte-identical (${Buffer.byteLength(built)} bytes, sha256 ${sha(built)})`);
  process.exit(0);
}

// ----- Structural comparison -----
const diffs = [];
const note = (msg) => diffs.push(msg);
const A = scanSegments(expected), B = scanSegments(built);
const label = (s) => isChapter(s) ? `chapter:${s.attrs['data-id']}` : isData(s) ? `data:${s.attrs.id}` : isEngine(s) ? 'engine' : s.kind === 'style' ? 'style' : s.kind === 'script' ? `script:${s.attrs.src}` : 'html';

const orderA = A.map(label).filter((l) => l !== 'html'), orderB = B.map(label).filter((l) => l !== 'html');
if (orderA.join() !== orderB.join()) {
  const i = orderA.findIndex((l, k) => l !== orderB[k]);
  note(`segment order differs at position ${i}: expected ${orderA[i]}, built ${orderB[i]}`);
}
const chapters = (segs) => new Map(segs.filter(isChapter).map((s) => [s.attrs['data-id'], s]));
const ca = chapters(A), cb = chapters(B);
for (const id of ca.keys()) if (!cb.has(id)) note(`chapter ${id}: missing from the build`);
for (const id of cb.keys()) if (!ca.has(id)) note(`chapter ${id}: not in the source`);
for (const [id, a] of ca) {
  const b = cb.get(id);
  if (!b) continue;
  if (a.openTag !== b.openTag) note(`chapter ${id}: attributes differ\n    expected ${a.openTag}\n    built    ${b.openTag}`);
  if (a.body !== b.body) {
    const i = [...a.body].findIndex((ch, k) => ch !== b.body[k]);
    note(`chapter ${id}: body differs at character ${i}\n    expected ${JSON.stringify(a.body.slice(Math.max(0, i - 30), i + 50))}\n    built    ${JSON.stringify(b.body.slice(Math.max(0, i - 30), i + 50))}`);
  }
}
const datas = (segs) => new Map(segs.filter(isData).map((s) => [s.attrs.id, s.body]));
const da = datas(A), db = datas(B);
for (const [id, a] of da) {
  const b = db.get(id);
  if (b === undefined) { note(`data ${id}: missing from the build`); continue; }
  if (a === b) continue;
  const deep = JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(b));
  note(`data ${id}: ${deep ? 'deep-equal, but serialized differently' : 'values differ'}`);
}
for (const id of db.keys()) if (!da.has(id)) note(`data ${id}: not in the source`);
const one = (segs, f) => segs.find(f);
for (const [name, f] of [['style', (s) => s.kind === 'style'], ['engine', isEngine]]) {
  const a = one(A, f), b = one(B, f);
  if (!a || !b) { note(`${name}: missing`); continue; }
  if (a.body !== b.body) note(`${name}: differs (${a.body.length} vs ${b.body.length} characters)`);
}
const htmlA = A.filter((s) => s.kind === 'html').map((s) => s.text).join('\u0000');
const htmlB = B.filter((s) => s.kind === 'html').map((s) => s.text).join('\u0000');
if (htmlA !== htmlB) note('static HTML between elements differs');

console.log(`round trip: NOT byte-identical (expected ${Buffer.byteLength(expected)} bytes, built ${Buffer.byteLength(built)})`);
console.log(diffs.length ? diffs.map((d) => '  - ' + d).join('\n') : '  - no structural difference found; the bytes differ only in whitespace or ordering outside elements');
process.exit(1);
