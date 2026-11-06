#!/usr/bin/env node
// Wanted pages: planned topics in docs/COVERAGE_MAP.md that nobody has
// written yet. Each one gets a GitHub issue labeled "wanted" that people can
// claim with /claim.
//
//   node scripts/wanted.mjs                      list the wanted pages
//   node scripts/wanted.mjs --sync               rebuild data/wanted.json from the map
//   node scripts/wanted.mjs --issues [--dry-run] open an issue for every page without one
import { spawnSync } from 'node:child_process';
import { readJSON, readText, writeText, exists, fail } from './lib/fsutil.mjs';
import { loadChapters } from './lib/project.mjs';
import { loadSite } from './lib/site.mjs';

const FILE = 'data/wanted.json';
const args = process.argv.slice(2);
const current = exists(FILE) ? readJSON(FILE) : { pages: [] };
const save = (pages) => writeText(FILE, JSON.stringify({ pages }, null, 2) + '\n');

if (args.includes('--sync')) {
  // Planned rows look like: | 12.15 | Agent payment protocols (`agent-payments`) | planned | What it must cover |
  const existing = new Set(loadChapters().map((c) => c.meta.id));
  const issues = new Map(current.pages.map((p) => [p.id, p.issue]));
  const pages = [];
  for (const line of readText('docs/COVERAGE_MAP.md').split('\n')) {
    const m = line.match(/^\| ([0-9]+)\.([0-9.]+) \| (.+?) \(`([a-z0-9-]+)`\) \| planned \| (.+?) \|$/);
    if (!m) continue;
    const [, book, rest, title, id, covers] = m;
    if (existing.has(id)) { console.log(`skipped ${id}: the chapter exists now; set its row to its status`); continue; }
    const page = { id, title: title.trim(), book: Number(book), order: `${book}.${rest}`, covers: covers.trim().replace(/\\\|/g, '|') };
    if (issues.get(id)) page.issue = issues.get(id);
    pages.push(page);
  }
  save(pages);
  console.log(`${FILE}: ${pages.length} wanted page(s)`);
} else if (args.includes('--issues')) {
  const dry = args.includes('--dry-run');
  const site = loadSite();
  const repo = site.repository.replace('https://github.com/', '');
  const pages = current.pages.map((p) => ({ ...p }));
  let opened = 0;
  for (const p of pages) {
    if (p.issue) continue;
    const label = `book-${String(p.book).padStart(2, '0')}`;
    const body = [
      `**Wanted page:** ${p.title}, in Book ${p.book}${p.order ? ` at position ${p.order}` : ''}, with the id \`${p.id}\`.`,
      '', `**What it must cover:** ${p.covers}`, '',
      'Want to write it? Comment `/claim` on this issue first, so nobody else starts the same page. A claim without a pull request is released after 14 days.',
      '', 'Then give your coding agent this prompt (see CONTRIBUTING.md):', '',
      '```text', `Contribute to ${site.name}: ${site.repository.replace('https://', '')}. Read AGENTS.md first and follow it exactly. What I want to contribute: the wanted chapter "${p.title}" (id ${p.id}, book ${p.book}), as described in its wanted issue.`, '```', '',
      `The chapter starts from \`npm run new -- chapter ${p.id} --book ${p.book} --title "${p.title}"\`. Write "Closes #<this issue>" in the pull request.`
    ].join('\n');
    const ghArgs = ['issue', 'create', '--repo', repo, '--title', `Wanted: ${p.title}`, '--label', 'wanted', '--label', label, '--body', body];
    if (dry) { console.log(`would open: Wanted: ${p.title} [wanted, ${label}]`); continue; }
    const r = spawnSync('gh', ghArgs, { encoding: 'utf8' });
    if (r.status !== 0) fail(`could not open the issue for ${p.id}: ${(r.stderr || '').trim()}`);
    p.issue = Number((r.stdout.trim().match(/\/issues\/(\d+)/) || [])[1]);
    opened++;
    console.log(`opened #${p.issue}: Wanted: ${p.title}`);
    save(pages);
  }
  console.log(dry ? 'dry run: nothing opened' : `${opened} issue(s) opened; ${pages.filter((p) => p.issue).length} of ${pages.length} wanted pages have one`);
} else {
  if (!current.pages.length) console.log('No wanted pages. Add planned rows to docs/COVERAGE_MAP.md, then run: npm run wanted -- --sync');
  for (const p of current.pages) console.log(`${p.id}  Book ${p.book}  ${p.title}  ${p.issue ? `#${p.issue}` : '(no issue yet)'}`);
}
