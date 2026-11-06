#!/usr/bin/env node
// Builds dist/ground-truth.html, one self-contained page like the original.
//
//   node scripts/build.mjs             offline: libraries and fonts inlined,
//                                      no request to any other server
//   node scripts/build.mjs --cdn       the original CDN tags (what the round
//                                      trip compares with the source)
//   node scripts/build.mjs --out <file>
import crypto from 'node:crypto';
import { writeText, fail } from './lib/fsutil.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage } from './lib/page.mjs';

const args = process.argv.slice(2);
const mode = args.includes('--cdn') ? 'cdn' : 'offline';
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args[outAt + 1] : mode === 'cdn' ? 'dist/ground-truth-cdn.html' : 'dist/ground-truth.html';

try {
  const project = loadProject();
  const html = renderPage(project, { mode });
  writeText(out, html);
  const sha = crypto.createHash('sha256').update(html).digest('hex');
  const mb = (Buffer.byteLength(html) / 1e6).toFixed(1);
  console.log(`built ${out} (${mode}): ${project.chapters.length} chapters, ${project.data.length} data blocks, ${mb} MB, sha256 ${sha.slice(0, 12)}`);
} catch (e) {
  fail(e.message);
}
