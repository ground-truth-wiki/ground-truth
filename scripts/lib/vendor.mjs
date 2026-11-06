// Third-party libraries and fonts, self-hosted from node_modules at the exact
// versions the original page loaded from CDNs. Published builds never request
// anything from a third-party server.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from './fsutil.mjs';

const require = createRequire(path.join(ROOT, 'package.json'));
const resolvePkg = (spec) => require.resolve(spec);

export const LIBRARIES = {
  marked: { pkg: 'marked/marked.min.js', site: 'vendor/marked.min.js', license: 'marked/LICENSE.md' },
  highlight: { pkg: '@highlightjs/cdn-assets/highlight.min.js', site: 'vendor/highlight.min.js', license: '@highlightjs/cdn-assets/LICENSE' },
  // Loaded on demand by the engine (window.GT_LIBS).
  mathjax: { pkg: 'mathjax/es5/tex-svg.js', site: 'vendor/mathjax/tex-svg.js', license: 'mathjax/LICENSE', lazy: true },
  mermaid: { pkg: 'mermaid/dist/mermaid.min.js', site: 'vendor/mermaid.min.js', license: 'mermaid/LICENSE', lazy: true }
};

// Fontsource packages (SIL Open Font License). Families keep the names the
// engine's CSS asks for.
const FONT_SOURCES = [
  { family: 'Bricolage Grotesque', css: '@fontsource-variable/bricolage-grotesque/opsz.css', license: '@fontsource-variable/bricolage-grotesque/LICENSE' },
  { family: 'Literata', css: '@fontsource-variable/literata/opsz.css', license: '@fontsource-variable/literata/LICENSE' },
  { family: 'Literata', css: '@fontsource-variable/literata/opsz-italic.css' },
  { family: 'JetBrains Mono', css: '@fontsource/jetbrains-mono/400.css', license: '@fontsource/jetbrains-mono/LICENSE' },
  { family: 'JetBrains Mono', css: '@fontsource/jetbrains-mono/600.css' }
];

export const readLibrary = (name) => fs.readFileSync(resolvePkg(LIBRARIES[name].pkg), 'utf8');

function parseRanges(spec) {
  return spec.split(',').map((r) => {
    const [a, b] = r.trim().replace(/^U\+/i, '').split('-');
    return [parseInt(a, 16), parseInt(b || a, 16)];
  });
}

// Every @font-face of the selected sources, with its file and code point ranges.
export function fontFaces() {
  const faces = [];
  for (const src of FONT_SOURCES) {
    const cssPath = resolvePkg(src.css);
    const css = fs.readFileSync(cssPath, 'utf8');
    for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
      const get = (prop) => (block.match(new RegExp(`${prop}:\\s*([^;]+);`)) || [])[1];
      const url = (get('src').match(/url\(([^)]+)\)/) || [])[1];
      const file = path.join(path.dirname(cssPath), url.replace(/^\.\//, ''));
      faces.push({
        family: src.family,
        style: get('font-style'),
        weight: get('font-weight'),
        unicodeRange: get('unicode-range'),
        ranges: parseRanges(get('unicode-range')),
        file,
        name: path.basename(file)
      });
    }
  }
  return faces;
}

// Only the subsets whose ranges contain a character of the page, so the
// offline file stays small. Deterministic for a given page.
export function facesForText(faces, text) {
  const used = new Set();
  for (const ch of text) used.add(ch.codePointAt(0));
  const hits = (face) => face.ranges.some(([a, b]) => { for (const cp of used) if (cp >= a && cp <= b) return true; return false; });
  return faces.filter(hits);
}

export function fontCSS(faces, urlFor) {
  return faces.map((f) =>
    `@font-face{font-family:"${f.family}";font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(${urlFor(f)}) format("woff2");unicode-range:${f.unicodeRange}}`
  ).join('\n');
}

export const fontDataURL = (face) => `data:font/woff2;base64,${fs.readFileSync(face.file).toString('base64')}`;

export function licenseFiles() {
  const out = [];
  for (const [name, lib] of Object.entries(LIBRARIES)) out.push({ name, file: resolvePkg(lib.license) });
  for (const src of FONT_SOURCES) if (src.license) out.push({ name: src.family, file: resolvePkg(src.license) });
  return out;
}

// Inline scripts must not contain a closing tag. The libraries contain none
// today; escaping keeps it that way, and "<\/" means "</" in JavaScript.
export const inlineScriptSafe = (code) => code.replace(/<\/script/gi, '<\\/script');
