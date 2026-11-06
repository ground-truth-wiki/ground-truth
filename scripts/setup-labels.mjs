#!/usr/bin/env node
// Creates or updates the repository's issue and pull request labels with the
// GitHub CLI. Safe to run again: existing labels are updated, none deleted.
// Book labels (book-00, book-01, …) come from data/books.json.
//
//   node scripts/setup-labels.mjs [--dry-run]
import { spawnSync } from 'node:child_process';
import { readJSON, fail } from './lib/fsutil.mjs';
import { loadSite } from './lib/site.mjs';

const DRY = process.argv.includes('--dry-run');
const repo = loadSite().repository.replace('https://github.com/', '');

const labels = [
  ['good first issue', '7057ff', 'A small, well-defined task for a first contribution'],
  ['help wanted', '008672', 'Maintainers would welcome help with this'],
  ['wanted', 'fbca04', 'A wanted page: comment /claim to take it'],
  ['playbook', '1d76db', 'A playbook: an industry use case with its approach and results'],
  ['field-note', '5319e7', 'A field note: a real deployment, postmortem or failure'],
  ['glossary', 'c5def5', 'Glossary terms'],
  ['outdated', 'd93f0b', 'Content that is out of date or due for review'],
  ['needs-review', 'e4e669', 'Waiting for a steward or maintainer to look at it'],
  ['ai-assisted', 'bfdadc', 'AI tools helped write this change'],
  ['stale', 'ededed', 'No activity for a while']
];
for (const b of readJSON('data/books.json').books) {
  labels.push([`book-${String(b.n).padStart(2, '0')}`, '0e8a16', `Book ${b.n}: ${b.title}`.slice(0, 100)]);
}

let failed = 0;
for (const [name, color, description] of labels) {
  const args = ['label', 'create', name, '--repo', repo, '--color', color, '--description', description, '--force'];
  if (DRY) { console.log(`gh ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`); continue; }
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  if (r.status === 0) console.log(`ok  ${name}`);
  else { failed++; console.error(`failed  ${name}: ${(r.stderr || r.error?.message || '').trim()}`); }
}
if (failed) fail(`${failed} label(s) could not be created. Is the GitHub CLI installed and signed in (gh auth status)?`);
console.log(DRY ? `${labels.length} labels (dry run)` : `${labels.length} labels in ${repo}`);
