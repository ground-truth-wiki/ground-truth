// Who shaped each file, from the git history: commit authors and human
// co-authors, never AI tools or bots, and never an email address. The result
// depends only on the commit, so builds stay deterministic.
//
// GitHub handles come from GitHub's no-reply addresses, or, when a token is
// available (the deploy workflow), from the GitHub API, one lookup per author.
import { spawnSync } from 'node:child_process';
import { ROOT } from './fsutil.mjs';

const AI_OR_BOT = /(\[bot\]|noreply@anthropic\.com|noreply@openai\.com|copilot|dependabot|github-actions)/i;
const NOREPLY = /^(?:\d+\+)?([A-Za-z0-9-]+)@users\.noreply\.github\.com$/i;

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

// Map<file, { people: Map<key, {name, email, sha}>, updated: 'YYYY-MM-DD' }>
export function gitHistory(paths) {
  const out = new Map();
  const log = git(['log', '--no-merges', '--format=%x1e%H%x1f%aN%x1f%aE%x1f%cs%x1f%(trailers:key=Co-authored-by,valueonly,separator=%x1d)', '--name-only', '--', ...paths]);
  if (log === null) return { files: out, available: false };
  for (const rec of log.split('\x1e').slice(1)) {
    const [head, ...rest] = rec.split('\n');
    const [sha, name, email, date, trailers] = head.split('\x1f');
    const files = rest.join('\n').split('\n').map((l) => l.trim()).filter(Boolean);
    const people = [{ name, email }];
    for (const t of (trailers || '').split('\x1d').filter(Boolean)) {
      const m = t.trim().match(/^(.*?)\s*<([^>]+)>$/);
      if (m) people.push({ name: m[1], email: m[2] });
    }
    for (const f of files) {
      if (!out.has(f)) out.set(f, { people: new Map(), updated: date });
      const entry = out.get(f);
      for (const p of people) {
        if (AI_OR_BOT.test(p.email) || AI_OR_BOT.test(p.name)) continue;
        const key = p.email.toLowerCase();
        if (!entry.people.has(key)) entry.people.set(key, { name: p.name, email: p.email, sha });
      }
    }
  }
  return { files: out, available: true };
}

// email -> GitHub login, for authors whose address is not a no-reply one.
// Only used with --github (a token in GH_TOKEN, as in the deploy workflow).
export function resolveHandles(people, repo) {
  const handles = new Map();
  for (const p of people) {
    const m = p.email.match(NOREPLY);
    if (m) { handles.set(p.email.toLowerCase(), m[1]); continue; }
    if (!repo) continue;
    const r = spawnSync('gh', ['api', `repos/${repo}/commits/${p.sha}`, '--jq', '.author.login // empty'], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) handles.set(p.email.toLowerCase(), r.stdout.trim());
  }
  return handles;
}

// The public credit of one person: a handle when known, otherwise the name.
export const creditOf = (p, handles) => {
  const handle = handles.get(p.email.toLowerCase()) || (p.email.match(NOREPLY) || [])[1];
  return handle ? { handle } : { name: p.name };
};
