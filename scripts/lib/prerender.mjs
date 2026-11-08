// Plain HTML of a chapter for search engines, link previews and readers
// without JavaScript. The engine replaces it with the interactive chapter as
// soon as it runs, so this only needs to be complete and readable.
import { Marked } from 'marked';

const marked = new Marked({ gfm: true, breaks: false });
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FENCE = /^(```+|~~~+)[ \t]*([^\n]*)\n([\s\S]*?)\n\1[ \t]*$/gm;
const parseInfo = (info) => { const o = {}; String(info || '').replace(/([a-z_]+)=(?:"([^"]*)"|(\S+))/gi, (m, k, a, b) => { o[k] = a != null ? a : b; return ''; }); return o; };
const CALLOUTS = { tldr: 'TL;DR', insight: 'Insight', pitfall: 'Pitfall', expert: 'Talk like an expert', hottake: 'Hot take', try: 'Try it', number: 'Number to know', history: 'History', note: 'Note', seed: 'Seed' };

function figure(title, caption, alt) {
  return `<figure class="viz"><p class="viz-title">${esc(title)}</p>${caption ? `<p class="viz-cap">${esc(caption)}</p>` : ''}${alt ? `<p class="small muted">${esc(alt)}</p>` : ''}</figure>`;
}

// Replaces special fences with their text equivalent before Markdown parsing.
function staticBlocks(md, chapterId) {
  const html = [];
  const out = md.replace(FENCE, (m, f, info, body) => {
    const lang = (info.trim().split(/\s+/)[0] || '').toLowerCase();
    let h;
    if (lang === 'viz') { try { const s = JSON.parse(body); h = figure(s.title, s.caption, s.alt); } catch { h = ''; } }
    else if (lang === 'mermaid' || lang === 'svg') { const i = parseInfo(info); h = figure(i.title || 'Diagram', i.caption, i.alt); }
    else if (lang === 'math') h = `<pre class="math-src">${esc(body.trim())}</pre>`;
    else if (lang === 'quiz') h = `<p class="small muted">A quiz on ${esc(body.trim() || chapterId)} opens here in the interactive version.</p>`;
    else if (lang === 'widget') h = '';
    else h = `<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(body)}</code></pre>`;
    html.push(h);
    return `\n\n@@GTBLOCK${html.length - 1}@@\n\n`;
  });
  return { md: out, html };
}

// href="#id" -> "/id/" for chapters and "/#page" for engine pages.
const fixLinks = (html, isChapter) => html.replace(/href="#([^"]+)"/g, (m, id) => `href="${isChapter(id) ? `/${id}/` : `/#${id}`}"`);

export function chapterHTML(chapter, { isChapter }) {
  const { md, html: blocks } = staticBlocks(chapter.body.replace(/\[\[([^\]|\n]+)(?:\|[^\]\n]+)?\]\]/g, '$1'), chapter.meta.id);
  let html = marked.parse(md.replace(/\\\((.+?)\\\)/g, '$1'));
  html = html.replace(/<p>@@GTBLOCK(\d+)@@<\/p>/g, (m, i) => blocks[+i]).replace(/@@GTBLOCK(\d+)@@/g, (m, i) => blocks[+i]);
  html = html.replace(/<blockquote>\s*<p>\[!([a-z]+)\][ \t]*([^\n<]*)/gi, (m, type, title) => {
    const label = CALLOUTS[type.toLowerCase()] || 'Note';
    return `<blockquote><p><strong>${esc(label)}${title.trim() ? `: ${title.trim()}` : ''}.</strong> `;
  });
  html = fixLinks(html, isChapter);
  const m = chapter.meta;
  return `<article class="prose prerender"><h1>${esc(m.title)}</h1><p class="small muted">Book ${m.book}, chapter ${esc(m.order)}. ${esc(m.level[0].toUpperCase() + m.level.slice(1))}, ${esc(m.stability)}, reviewed ${esc(m.reviewed)}.</p>\n${html}</article>`;
}

// The TL;DR as plain text: the summary in search results and link previews.
export function tldrText(body) {
  const m = body.match(/^>\s*\[!tldr\][^\n]*\n((?:>.*(?:\n|$))*)/im);
  if (!m) return '';
  return m[1].replace(/^>\s?/gm, '').replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}

export function shorten(text, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…';
}
