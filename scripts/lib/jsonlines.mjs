// Maps JSON pointers ("/terms/3/def") to 1-based line numbers in the text
// they came from, so errors can point at the right line.
export function jsonLines(text) {
  const lines = new Map();
  let i = 0, line = 1;
  const ws = () => { while (i < text.length && /\s/.test(text[i])) { if (text[i] === '\n') line++; i++; } };
  const str = () => { i++; let s = ''; while (text[i] !== '"') { if (text[i] === '\\') { s += text[i] + text[i + 1]; i += 2; } else s += text[i++]; } i++; return JSON.parse(`"${s}"`); };
  const esc = (k) => String(k).replace(/~/g, '~0').replace(/\//g, '~1');
  function value(ptr) {
    ws();
    lines.set(ptr, line);
    const c = text[i];
    if (c === '{') {
      i++; ws();
      if (text[i] === '}') { i++; return; }
      for (;;) { ws(); const k = str(); ws(); i++; value(`${ptr}/${esc(k)}`); ws(); if (text[i] === ',') { i++; continue; } i++; return; }
    }
    if (c === '[') {
      i++; ws();
      if (text[i] === ']') { i++; return; }
      for (let n = 0; ; n++) { value(`${ptr}/${n}`); ws(); if (text[i] === ',') { i++; continue; } i++; return; }
    }
    if (c === '"') { str(); return; }
    while (i < text.length && !/[\s,\]}]/.test(text[i])) i++;
  }
  try { value(''); } catch { /* invalid JSON is reported elsewhere */ }
  return (ptr) => {
    let p = ptr;
    while (p && !lines.has(p)) p = p.slice(0, p.lastIndexOf('/'));
    return lines.get(p) || 1;
  };
}
