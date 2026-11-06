// Loads the whole project from disk: chapters, data, engine and shell.
// Every error names the file it comes from.
import path from 'node:path';
import { readText, readJSON, listFiles, exists } from './fsutil.mjs';
import { parseChapterFile } from './chapters.mjs';
import { loadSite } from './site.mjs';

const orderKey = (o) => String(o).split('.').map((n) => Number.parseInt(n, 10) || 0);
export function compareOrder(a, b) {
  const x = orderKey(a), y = orderKey(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d;
  }
  return 0;
}
export const compareChapters = (a, b) => a.meta.book - b.meta.book || compareOrder(a.meta.order, b.meta.order);

export function loadChapters() {
  const chapters = [];
  for (const file of listFiles('content', '.md')) {
    if (file.startsWith('content/legal/')) continue;
    const { meta, body, bodyLine } = parseChapterFile(readText(file), file);
    if (typeof meta.id !== 'string' || !meta.id) throw new Error(`${file}: frontmatter needs an "id"`);
    if (path.posix.basename(file, '.md') !== meta.id) throw new Error(`${file}: file name must equal the id "${meta.id}"`);
    chapters.push({ file, meta, body, bodyLine });
  }
  const seen = new Map();
  for (const c of chapters) {
    if (seen.has(c.meta.id)) throw new Error(`${c.file}: duplicate id "${c.meta.id}" (also in ${seen.get(c.meta.id)})`);
    seen.set(c.meta.id, c.file);
  }
  return chapters;
}

// Chapter order inside the page: by book, then by order compared numerically
// part by part ("9.10" after "9.9"), exactly as the engine sorts them.
export const orderChapters = (chapters) => chapters.slice().sort(compareChapters);

function loadSplit(block, chapterOrder) {
  const files = listFiles(block.dir, '.json').filter((f) => !f.endsWith('/_index.json'));
  const index = exists(`${block.dir}/_index.json`) ? readJSON(`${block.dir}/_index.json`) : [];
  const items = [];
  for (const file of files) {
    const name = path.posix.basename(file, '.json');
    const value = readJSON(file);
    if (block.split === 'id') {
      if (value.id !== name) throw new Error(`${file}: file name must equal the id "${value.id}"`);
      items.push({ item: value, group: name, pos: 0 });
    } else {
      if (!Array.isArray(value)) throw new Error(`${file}: must be a JSON array`);
      value.forEach((q, pos) => {
        if (q[block.split] !== name) throw new Error(`${file}: item "${q.id}" has ${block.split} "${q[block.split]}", expected "${name}"`);
        items.push({ item: q, group: name, pos });
      });
    }
  }
  const ids = new Map();
  for (const x of items) {
    if (ids.has(x.item.id)) throw new Error(`${block.dir}: duplicate id "${x.item.id}"`);
    ids.set(x.item.id, x);
  }
  // Items listed in _index.json keep their place; new items follow in a
  // fixed order, so contributors never have to edit the index.
  const ordered = index.filter((id) => ids.has(id)).map((id) => ids.get(id));
  const rank = (g) => (chapterOrder.has(g) ? chapterOrder.get(g) : Number.MAX_SAFE_INTEGER);
  const rest = items.filter((x) => !ordered.includes(x)).sort((a, b) =>
    block.split === 'id' ? (a.group < b.group ? -1 : a.group > b.group ? 1 : 0)
      : rank(a.group) - rank(b.group) || (a.group < b.group ? -1 : a.group > b.group ? 1 : 0) || a.pos - b.pos
  );
  return { [block.wrap]: [...ordered, ...rest].map((x) => x.item) };
}

export function loadData(manifest, chapters) {
  const chapterOrder = new Map(chapters.map((c, i) => [c.meta.id, i]));
  const data = [];
  for (const block of manifest.data.blocks) {
    const value = block.file ? readJSON(block.file) : loadSplit(block, chapterOrder);
    data.push({ ...block, value });
  }
  return data;
}

export function loadProject() {
  const site = loadSite();
  const manifest = readJSON('build/manifest.json');
  const chapters = orderChapters(loadChapters());
  const data = loadData(manifest, chapters);
  const meta = data.find((d) => d.id === 'data-meta');
  if (meta && meta.value.title !== site.name) {
    throw new Error(`${meta.file}: "title" is "${meta.value.title}" but site.config.json names the site "${site.name}"; they must match`);
  }
  return {
    site,
    manifest,
    chapters,
    data,
    shell: readText('engine/shell.html'),
    styles: readText(manifest.styles.file),
    engine: readText(manifest.engine.file)
  };
}
