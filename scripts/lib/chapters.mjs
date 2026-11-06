// Chapter files: YAML frontmatter plus the Markdown body, and the mapping
// between frontmatter fields and the data-* attributes the engine reads.
import YAML from 'yaml';

// Order matters: it is the attribute order of every chapter in the source.
export const FIELDS = [
  { key: 'id', attr: 'data-id', kind: 'string' },
  { key: 'book', attr: 'data-book', kind: 'integer' },
  { key: 'order', attr: 'data-order', kind: 'quoted' },
  { key: 'title', attr: 'data-title', kind: 'string' },
  { key: 'level', attr: 'data-level', kind: 'string' },
  { key: 'stability', attr: 'data-stability', kind: 'string' },
  { key: 'reviewed', attr: 'data-reviewed', kind: 'quoted' },
  { key: 'status', attr: 'data-status', kind: 'string' },
  { key: 'tags', attr: 'data-tags', kind: 'inline-list' },
  { key: 'visuals', attr: 'data-visuals', kind: 'block-list' }
];

// Values that a YAML 1.1 reader would not read back as plain strings.
const AMBIGUOUS = /^(?:y|yes|n|no|true|false|on|off|null|~|[-+]?[0-9][0-9_.:eE+-]*)$/i;

function scalar(value) {
  const s = String(value);
  if (AMBIGUOUS.test(s)) return JSON.stringify(s);
  return YAML.stringify(s, { lineWidth: 0 }).replace(/\n$/, '');
}

export function emitFrontmatter(meta) {
  const lines = ['---'];
  for (const f of FIELDS) {
    const v = meta[f.key];
    if (f.kind === 'integer') lines.push(`${f.key}: ${v}`);
    else if (f.kind === 'quoted') lines.push(`${f.key}: ${JSON.stringify(String(v))}`);
    else if (f.kind === 'inline-list') lines.push(`${f.key}: [${v.map(scalar).join(', ')}]`);
    else if (f.kind === 'block-list') lines.push(v.length ? `${f.key}:\n${v.map((x) => `  - ${scalar(x)}`).join('\n')}` : `${f.key}: []`);
    else lines.push(`${f.key}: ${scalar(v)}`);
  }
  for (const [k, v] of Object.entries(meta)) {
    if (!FIELDS.some((f) => f.key === k)) lines.push(YAML.stringify({ [k]: v }, { lineWidth: 0 }).replace(/\n$/, ''));
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

// Returns { meta, body, bodyLine } where bodyLine is the 1-based file line on
// which the body starts, so validation errors can point at the right line.
export function parseChapterFile(text, file) {
  if (!text.startsWith('---\n')) throw new Error(`${file}: must start with a "---" frontmatter line`);
  const end = text.indexOf('\n---\n', 3);
  if (end < 0) throw new Error(`${file}: frontmatter is not closed with "---"`);
  let meta;
  try {
    meta = YAML.parse(text.slice(4, end + 1));
  } catch (e) {
    throw new Error(`${file}: frontmatter is not valid YAML (${e.message})`);
  }
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new Error(`${file}: frontmatter must be a mapping`);
  const body = text.slice(end + 5);
  const bodyLine = text.slice(0, end + 5).split('\n').length;
  return { meta, body, bodyLine };
}

// Attribute string -> frontmatter value, and back.
export function fromAttr(f, raw) {
  if (f.kind === 'integer') return Number.parseInt(raw, 10);
  if (f.kind === 'inline-list' || f.kind === 'block-list') return raw.split(',').filter(Boolean);
  return raw;
}

export function toAttr(f, value) {
  if (f.kind === 'inline-list' || f.kind === 'block-list') return (value || []).join(',');
  return String(value);
}
