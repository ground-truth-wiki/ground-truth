// site.config.json is the single source of the project's identity: name,
// short name, description, site address, repository and licenses.
import { readJSON } from './fsutil.mjs';

const FILE = 'site.config.json';
const REQUIRED = ['name', 'shortName', 'description', 'siteUrl', 'repository'];

export function loadSite() {
  const site = readJSON(FILE);
  for (const key of REQUIRED) {
    if (typeof site[key] !== 'string' || !site[key].trim()) throw new Error(`${FILE}: "${key}" must be a non-empty string`);
  }
  if (!site.license || typeof site.license.content !== 'string' || typeof site.license.code !== 'string') {
    throw new Error(`${FILE}: "license" needs "content" and "code"`);
  }
  site.siteUrl = site.siteUrl.replace(/\/+$/, '');
  return site;
}

// The address stays a placeholder on the reserved .example domain until the
// real one is decided. The launch checklist refuses to go public with it.
export const hasSiteAddress = (site) => !/\.example(?::\d+)?$/i.test(new URL(site.siteUrl).hostname);

const escapeHTML = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Replaces {{site.<key>}} and {{page.<key>}} tokens in a template. Unknown
// keys are an error, so a typo never reaches a published page.
export function fillTokens(template, values, file) {
  return template.replace(/\{\{(site|page)\.([a-zA-Z]+)\}\}/g, (m, scope, key) => {
    const v = values[scope] && values[scope][key];
    if (typeof v !== 'string') throw new Error(`${file}: unknown token ${m}`);
    return escapeHTML(v);
  });
}
