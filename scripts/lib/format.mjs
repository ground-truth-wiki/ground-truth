// Serialization rules that make the build reproduce the original file byte
// for byte. See docs/migration/MIGRATION_NOTES.md, section 5.

// Repository files: 2-space JSON, key order as in the source, final newline.
export const prettyJSON = (value) => JSON.stringify(value, null, 2) + '\n';

// Inside the page every "<" is written as <, so no data value can ever
// close its <script> element.
const escapeLt = (text) => text.replace(/</g, '\\u003c');

// "compact": JSON.stringify without spaces (13 of the 14 data blocks).
// "spaced": ", " and ": " separators, as written by Python's json.dumps
// (the data-meta block).
export function serializeData(value, style) {
  if (style === 'compact') return escapeLt(JSON.stringify(value));
  if (style === 'spaced') return escapeLt(spaced(value));
  throw new Error(`unknown data style "${style}"`);
}

function spaced(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(spaced).join(', ') + ']';
  return '{' + Object.entries(v).map(([k, x]) => JSON.stringify(k) + ': ' + spaced(x)).join(', ') + '}';
}

// The engine turns "<\/script" back into "</script" (engine.js, mdOf), and
// nothing else, so these two functions are exact inverses of each other.
export const escapeChapterBody = (md) => md.replace(/<\/script/gi, (m) => '<\\/' + m.slice(2));
export const unescapeChapterBody = (md) => md.replace(/<\\\/script/gi, (m) => '</' + m.slice(3));

// Attribute values in the source contain no "&" or '"'. Escaping both keeps
// future titles safe without changing any existing byte.
export const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
export const unescapeAttr = (s) =>
  String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
