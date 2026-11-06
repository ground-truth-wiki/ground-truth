#!/usr/bin/env node
// The maintainer "status" command: coverage by book, visuals per chapter,
// the freshness backlog and the pull requests waiting for review. Read-only.
//
//   node scripts/status.mjs [--no-github]
import { spawnSync } from 'node:child_process';
import { readJSON, readText, exists, fail } from './lib/fsutil.mjs';
import { loadChapters, orderChapters } from './lib/project.mjs';
import { loadSite } from './lib/site.mjs';
import { reviewSchedule, ym } from './lib/freshness.mjs';

let chapters, site;
try { chapters = orderChapters(loadChapters()); site = loadSite(); } catch (e) { fail(e.message); }
const books = readJSON('data/books.json').books;
const planned = new Map();
if (exists('docs/COVERAGE_MAP.md')) {
  for (const l of readText('docs/COVERAGE_MAP.md').split('\n')) {
    const m = l.match(/^\| ([0-9]+)\.[0-9.]+ \| [^|]*\(`([a-z0-9-]+)`\) \| planned \|/);
    if (m) planned.set(m[2], Number(m[1]));
  }
}
const visuals = (c) => c.meta.visuals.length;
const schedule = reviewSchedule(chapters);
const due = schedule.filter((r) => r.overdue >= 0);
const soon = schedule.filter((r) => r.overdue === -1);

const out = [`# Status of ${site.name}`, '', `${chapters.length} chapters: ${chapters.filter((c) => c.meta.status === 'full').length} full, ${chapters.filter((c) => c.meta.status === 'seed').length} seed, and ${planned.size} planned topics. ${chapters.reduce((a, c) => a + visuals(c), 0)} visuals.`, '',
  '| Book | Title | Full | Seed | Planned | Visuals per chapter | Due for review |', '|---|---|---|---|---|---|---|'];
for (const b of books) {
  const list = chapters.filter((c) => c.meta.book === b.n);
  const v = list.map(visuals);
  const range = v.length ? (Math.min(...v) === Math.max(...v) ? `${v[0]}` : `${Math.min(...v)} to ${Math.max(...v)}`) : '';
  const d = due.filter((r) => r.chapter.meta.book === b.n).length;
  out.push(`| ${b.n} | ${b.title} | ${list.filter((c) => c.meta.status === 'full').length} | ${list.filter((c) => c.meta.status === 'seed').length} | ${[...planned.values()].filter((n) => n === b.n).length} | ${range} | ${d || ''} |`);
}
out.push('', `**Freshness:** ${due.length} chapter(s) due for review now, ${soon.length} next month${soon.length ? ` (from ${ym(soon[0].due)})` : ''}. Details: \`npm run freshness\`.`);
const thin = chapters.filter((c) => c.meta.status === 'full' && (visuals(c) < 2 || visuals(c) > 4));
if (thin.length) out.push('', `**Visuals outside 2 to 4:** ${thin.map((c) => c.meta.id).join(', ')}.`);

if (!process.argv.includes('--no-github')) {
  const repo = site.repository.replace('https://github.com/', '');
  const r = spawnSync('gh', ['pr', 'list', '--repo', repo, '--state', 'open', '--limit', '50', '--json', 'number,title,author,isDraft,reviewDecision,createdAt'], { encoding: 'utf8' });
  if (r.status === 0) {
    const prs = JSON.parse(r.stdout).filter((p) => !p.isDraft);
    out.push('', `## Pull requests waiting for review (${prs.length})`, '');
    if (prs.length) out.push('| # | Title | Author | Opened | Review |', '|---|---|---|---|---|', ...prs.map((p) => `| #${p.number} | ${p.title.replace(/\|/g, '\\|')} | @${p.author.login} | ${p.createdAt.slice(0, 10)} | ${p.reviewDecision || 'none yet'} |`));
    else out.push('None.');
  } else out.push('', '_Pull requests: not listed, because the GitHub CLI is not available or not signed in._');
}
console.log(out.join('\n'));
