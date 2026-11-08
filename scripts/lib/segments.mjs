// Splits a page into its top-level <script> and <style> elements and the
// static HTML between them. The first "</script" after an opening tag closes
// it, exactly as an HTML parser would.
import { unescapeAttr } from './format.mjs';

export function scanSegments(html) {
  const segments = [];
  const open = /<(script|style)\b([^>]*)>/gi;
  const lower = html.toLowerCase();
  let pos = 0;
  let m;
  while ((m = open.exec(html))) {
    const tag = m[1].toLowerCase();
    const bodyStart = m.index + m[0].length;
    const closeAt = lower.indexOf(`</${tag}`, bodyStart);
    if (closeAt < 0) throw new Error(`unclosed <${tag}> at offset ${m.index}`);
    const end = html.indexOf('>', closeAt) + 1;
    if (m.index > pos) segments.push({ kind: 'html', start: pos, end: m.index, text: html.slice(pos, m.index) });
    const attrs = {};
    for (const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] === undefined ? true : unescapeAttr(a[2]);
    segments.push({
      kind: tag,
      attrs,
      start: m.index,
      end,
      openTag: m[0],
      body: html.slice(bodyStart, closeAt),
      closeTag: html.slice(closeAt, end)
    });
    pos = end;
    open.lastIndex = end;
  }
  if (pos < html.length) segments.push({ kind: 'html', start: pos, end: html.length, text: html.slice(pos) });
  return segments;
}

export const isChapter = (s) => s.kind === 'script' && s.attrs.type === 'text/markdown';
export const isData = (s) => s.kind === 'script' && s.attrs.type === 'application/json';
export const isEngine = (s) => s.kind === 'script' && !s.attrs.type && !s.attrs.src;
