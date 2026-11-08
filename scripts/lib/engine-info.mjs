// What the engine supports, read from engine/engine.js itself, so the
// validator and the engine can never disagree.
import vm from 'node:vm';
import { readText } from './fsutil.mjs';

const listLiteral = (src, re) => {
  const m = src.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};

export function engineInfo() {
  const src = readText('engine/engine.js');
  const components = [...src.matchAll(/\bVIZ(?:\.([A-Za-z_$][\w$]*)|\['([a-z-]+)'\])\s*=/g)].map((m) => m[1] || m[2]);
  const models = [...src.matchAll(/\bMODELS\.([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]);
  const widgetFn = src.slice(src.indexOf('function renderWidget('), src.indexOf('\n}\n', src.indexOf('function renderWidget(')));
  const widgets = [...widgetFn.matchAll(/name === '([a-z-]+)'/g)].map((m) => m[1]);
  const calloutLine = (src.match(/const CALLOUT_TXT = \{([^\n]*)\};/) || [])[1] || '';
  const callouts = ['tldr', ...[...calloutLine.matchAll(/(\w+):/g)].map((m) => m[1])];
  const pages = listLiteral(src, /const ROUTE_PAGES = \[([^\]]*)\]/);
  const prefixes = listLiteral(src, /const ROUTE_PREFIXES = \[([^\]]*)\]/);
  const interactive = listLiteral(src, /const INTERACTIVE = new Set\(\[([^\]]*)\]\)/);
  for (const [name, list] of Object.entries({ components, models, widgets, pages, prefixes })) {
    if (!list.length) throw new Error(`engine/engine.js: could not read the list of ${name}; the validator needs updating`);
  }
  return { components, models, widgets, callouts, pages, prefixes, interactive };
}

// The engine's own calculator functions (between the CALC-START and CALC-END
// markers), run in an isolated context, so calculator tests are checked with
// exactly the code readers use.
export function engineCalculator() {
  const src = readText('engine/engine.js');
  const a = src.indexOf('/*CALC-START*/'), b = src.indexOf('/*CALC-END*/');
  if (a < 0 || b < a) throw new Error('engine/engine.js: CALC-START and CALC-END markers not found; the validator needs updating');
  const ctx = vm.createContext({ Math, Number, Object, String, Array, Error, isFinite });
  vm.runInContext(src.slice(a, b) + '\nthis.calcRun = calcRun; this.calcCheck = calcCheck;', ctx, { timeout: 1000 });
  return { calcRun: ctx.calcRun, calcCheck: ctx.calcCheck };
}
