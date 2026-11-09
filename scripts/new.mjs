#!/usr/bin/env node
// Creates a new file from templates/ with valid frontmatter, in the right
// folder, with the next free order number.
//
//   npm run new -- chapter <id> --book <n> --title "Title" [--level practitioner] [--stability moving] [--full]
//   npm run new -- playbook <id> --title "Title" [--stability moving] [--public-record]
//   npm run new -- field-note <id> --title "Title" [--stability moving] [--public-record]
//   npm run new -- term <id> --term "Name" [--abbr ABC]
//
// Every new file contains TODO: markers. npm run validate fails until all of
// them are replaced.
import fs from 'node:fs';
import { abs, exists, readJSON, readText, writeText, fail } from './lib/fsutil.mjs';
import { loadChapters, compareOrder } from './lib/project.mjs';
import { yamlScalar } from './lib/chapters.mjs';

// Chapter types. Playbooks and field notes live in their own books.
const KINDS = {
  chapter: { seed: 'seed-chapter.md', full: 'chapter.md' },
  playbook: { full: 'playbook.md', publicRecord: 'playbook-public-record.md', type: 'playbook' },
  'field-note': { full: 'field-note.md', publicRecord: 'field-note-public-record.md', type: 'field-note' }
};
const LEVELS = ['foundation', 'practitioner', 'expert', 'frontier'];
const STABILITIES = ['evergreen', 'moving', 'volatile'];

const [kind, id, ...rest] = process.argv.slice(2);
const opt = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const usage = 'usage: npm run new -- chapter|playbook|field-note|term <id> [options]; see the top of scripts/new.mjs';
if (!kind || !id) fail(usage);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(`"${id}" is not a valid id: use lowercase letters, digits and single hyphens, such as "prompt-caching"`);

const fill = (template, values) => template.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in values ? values[k] : m));
const month = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

if (kind === 'term') {
  const name = opt('term');
  if (!name) fail('a term needs --term "Name"');
  const file = `data/glossary/${id}.json`;
  if (exists(file)) fail(`${file} already exists; improve it instead`);
  const value = JSON.parse(fill(readText('templates/term.json'), { id, term: name.replace(/"/g, '\\"') }));
  if (opt('abbr')) value.abbr = opt('abbr');
  writeText(file, JSON.stringify(value, null, 2) + '\n');
  console.log(`created ${file}\nnext: write the definition and the practice line, list the chapters that use the term, then run npm run validate`);
  process.exit(0);
}

const spec = KINDS[kind];
if (!spec) fail(usage);
const title = opt('title');
if (!title) fail(`a ${kind} needs --title "Title"`);
const level = opt('level') || 'practitioner';
const stability = opt('stability') || 'moving';
if (!LEVELS.includes(level)) fail(`--level must be one of ${LEVELS.join(', ')}`);
if (!STABILITIES.includes(stability)) fail(`--stability must be one of ${STABILITIES.join(', ')}`);

let chapters;
try { chapters = loadChapters(); } catch (e) { fail(e.message); }
const aliases = readJSON('data/aliases.json');
if (chapters.some((c) => c.meta.id === id)) fail(`a chapter "${id}" already exists: ${chapters.find((c) => c.meta.id === id).file}; improve it instead`);
if (aliases[id]) fail(`"${id}" is an old id that now points to "${aliases[id]}"; choose another id`);

const books = readJSON('data/books.json').books;
let book;
if (spec.type) {
  const b = books.find((x) => x.type === spec.type);
  if (!b) fail(`no book in data/books.json has type "${spec.type}"`);
  book = b.n;
} else {
  book = Number(opt('book'));
  if (!Number.isInteger(book) || !books.some((b) => b.n === book)) fail(`--book must be a book number from data/books.json (0 to ${Math.max(...books.map((b) => b.n))})`);
}
const inBook = chapters.filter((c) => c.meta.book === book).sort((a, b) => compareOrder(a.meta.order, b.meta.order));
const lastMinor = inBook.length ? Number(inBook[inBook.length - 1].meta.order.split('.')[1]) : 0;
const order = `${book}.${lastMinor + 1}`;

const prefix = String(book).padStart(2, '0') + '-';
let folder = fs.readdirSync(abs('content')).find((d) => d.startsWith(prefix));
if (!folder) {
  const slug = books.find((b) => b.n === book).title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 3).join('-');
  folder = prefix + slug;
}
const file = `content/${folder}/${id}.md`;
// gt: --public-record starts from the template for pages built from an organization's own published account
if (rest.includes('--public-record') && !spec.publicRecord) fail('--public-record is only for playbooks and field notes');
const templateName = rest.includes('--public-record') ? spec.publicRecord : spec.type || rest.includes('--full') ? spec.full : spec.seed;
const templatePath = `templates/${templateName}`;
if (!exists(templatePath)) fail(`${templatePath} does not exist yet`);
let text = fill(readText(templatePath), { id, book: String(book), order, title: yamlScalar(title), level, stability, reviewed: month() });
writeText(file, text);
const made = [file];

// Full chapters need quiz questions: scaffold two.
if (/^status: full$/m.test(text) && /```quiz/.test(text)) {
  const quizFile = `data/quizzes/${id}.json`;
  if (!exists(quizFile)) {
    const q = readText('templates/quiz-question.json');
    const questions = [1, 2].map((n) => JSON.parse(fill(q, { id }).replace(`"${id}-1"`, `"${id}-${n}"`)));
    writeText(quizFile, JSON.stringify(questions, null, 2) + '\n');
    made.push(quizFile);
  }
}
console.log(`created ${made.join(' and ')} (${kind}, book ${book}, order ${order})`);
console.log('next: replace every TODO: (see STYLE_GUIDE.md), then run npm run validate and npm run build');
