#!/usr/bin/env node
// Builds dist/ground-truth.html, one self-contained page like the original.
//
//   node scripts/build.mjs [--out <file>]
import crypto from 'node:crypto';
import { writeText, fail } from './lib/fsutil.mjs';
import { loadProject } from './lib/project.mjs';
import { renderPage } from './lib/page.mjs';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args[outAt + 1] : 'dist/ground-truth.html';

try {
  const project = loadProject();
  const html = renderPage(project);
  writeText(out, html);
  const sha = crypto.createHash('sha256').update(html).digest('hex');
  console.log(`built ${out}: ${project.chapters.length} chapters, ${project.data.length} data blocks, ${Buffer.byteLength(html)} bytes, sha256 ${sha.slice(0, 12)}`);
} catch (e) {
  fail(e.message);
}
