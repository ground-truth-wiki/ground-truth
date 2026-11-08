# The engine

The engine is the code that turns chapters and data into the interactive site: routing, Markdown rendering, every visual component, search, the glossary, quizzes, progress and all tools. It is three files:

| File | What it is |
|---|---|
| `engine.js` | One script (an immediately invoked function, about 2,400 lines). No modules, no build step. |
| `styles.css` | All styles: design tokens, light and dark themes, layout, components, print. |
| `shell.html` | The page skeleton. Placeholders such as `<!-- @chapters -->` and `{{site.name}}` are filled by `scripts/build.mjs`. |

The engine is deliberately kept as one file, exactly as it came from the original page. Splitting it would make every change harder to compare with the original, and the round trip (`npm run roundtrip`) compares the build with the original byte for byte.

## How content reaches the engine

The build puts every chapter into the page as `<script type="text/markdown" data-id="…" data-book="…" …>`, and every data file into a `<script type="application/json" id="data-…">` block. The engine:

1. reads the data blocks with `readJSON(id)`, each with a fallback, so a missing block never breaks the page;
2. finds chapters with `querySelectorAll('script[type="text/markdown"]')` and sorts them by book, then by order;
3. renders a chapter only when it is opened, and builds the search index once, on the first search.

It writes nothing but one browser storage key, `aeb-state-v1` (reading progress, bookmarks, notes, quiz results, XP, preferences). It sets no cookies and sends nothing anywhere.

## Map

Line numbers refer to `engine.js` as of this commit.

| Lines | Part | What it does |
|---|---|---|
| 1 to 52 | Core helpers | DOM and SVG builders, escaping, `slug`, number formatting, `inlineMD` |
| 53 to 69 | **Storage** | The guarded `aeb-state-v1` store; falls back to memory when storage is blocked |
| 70 to 118 | **Data and chapters** | Data blocks, chapter discovery and ordering, books and parts |
| 119 to 161 | **Glossary** | Term map, aliases, and the regex that links the first use of every term |
| 162 to 286 | **Markdown renderer** | Fenced blocks become placeholders, then marked (or a built-in fallback), callouts, heading anchors, code blocks with copy buttons |
| 287 to 330 | Lazy libraries | MathJax and Mermaid, loaded on first use; local copies through `window.GT_LIBS` |
| 331 to 373 | Popovers and toasts | Glossary popovers, notifications |
| 374 to 438 | Progress | XP, levels ("Token Tourist" upward), streaks, badges |
| 439 to 506 | **Search** | Index of chapters, terms, tools, matrices, cheat sheets and timeline events; fuzzy matching with an edit distance of 1 |
| 507 to 619 | **Visual system** | The figure shell (title, "Try", caption, data kind, "Read as text", legend link), lazy mounting, Mermaid and SVG figures, SVG helpers |
| 620 to 1630 | **Viz components** | `diagram` 620, `stepper` 707, `sequence` 768, `chart` 822, `calculator` 930, `explorer` with its 15 models 1020, `embedding-map` 1359, `graph` 1397, `tree` 1426, `budget` 1447, `compare` 1469, `tokens` 1491, `trace` 1538, `code-walk` 1560, `timeline` 1574, `wizard` and `matrix` 1589 |
| 1631 to 1821 | Shell | Routes, theme and preferences, navigation tree, drawers, search palette |
| 1822 to 1871 | **Router** | Hash routes, aliases, page titles, 404, footer |
| 1872 to 1947 | Chapter page | Header, body, "On this page", related chapters, backlinks, bookmarks, notes |
| 1948 to 2008 | **Quizzes** | Chapter quizzes and the 10-question boss quiz per book |
| 2009 to 2033 | **Widgets** | `acronyms`, `canon`, `paths`, `ladder`, `commandments`, `lexicon`, `changelog` |
| 2034 to 2377 | Pages | Home and hero, book pages, Glossary and flashcards, Timeline, learning paths, Workshop, matrices, cheat sheets, Debates, what's new, Extend me, preferences, progress, visuals gallery, visual legend |
| 2378 to 2408 | Init | Startup, keyboard shortcuts, first route |

## Routes

A route is the part after `#`:

- a chapter id, such as `#agent-loop`, or an old id listed in `data/aliases.json`;
- one of 16 pages: `home`, `lexicon` (Glossary), `flashcards`, `genesis` (Timeline), `paths`, `quizzes`, `workshop`, `matrices`, `commandments` (Cheat sheets), `apocrypha` (Debates), `whats-new`, `extend-me`, `prefs`, `progress`, `visuals`, `visual-legend`;
- a prefixed route: `book-<n>`, `term-<id>`, `tool-<id>`, `path-<id>`, `boss-<n>`, `matrix-<id>`, `cmd-<id>`.

The page names changed in the rename, and the route ids did not, so old links keep working.

## What content can use

| In a chapter | Handled by |
|---|---|
| `> [!tldr]`, `> [!insight]`, `> [!pitfall]`, `> [!expert]`, `> [!hottake]`, `> [!try]`, `> [!number]`, `> [!history]`, `> [!note]`, `> [!seed]` | callouts, Markdown renderer |
| ` ```viz ` with a JSON spec | the 18 viz components |
| ` ```mermaid id=… title="…" caption="…" alt="…" ` | Mermaid, lazy |
| ` ```svg ` | inline SVG, scripts stripped |
| ` ```math ` and `\( … \)` | MathJax, lazy |
| ` ```quiz ` with a chapter id | quizzes |
| ` ```widget ` with a widget name | widgets |
| `[text](#chapter-id)`, `[[term]]`, `[[shown text\|term-id]]` | links and explicit glossary links |

`scripts/validate.mjs` reads the component, model and widget names straight from `engine.js`, so the validator and the engine never disagree.

## Changing the engine

Engine changes are rare, small and marked:

1. Make the smallest change that works, and put a `gt:` comment on it.
2. Add the exact old and new text to `build/roundtrip-allowlist.json`, so the round trip accepts this change and nothing else.
3. Run `npm run roundtrip` and `npm run validate`.

Changes made so far (search for `gt:`): the site name comes from `data-meta` (page titles, footer, hero, page introductions), and MathJax and Mermaid can come from local copies (`window.GT_LIBS`).

## Features (editorial masterprompt, section 7)

All 18 features listed in section 7 of `source/editorial-masterprompt.md` exist in the engine. "Data" gives the size of each data set today.

| Feature | Status | Where, and data |
|---|---|---|
| Home: title and tagline, search, Start here, continue reading, path progress, book grid by part, did-you-know, random chapter, stats, what's new | exists | Pages: home; hero with the animated title |
| Navigation: sidebar tree with read ticks and filter, breadcrumbs, previous and next, right rail (on this page, related, backlinks), mobile drawers, deep links | exists | Shell, Chapter page |
| Search: Ctrl or Cmd K and "/", instant and fuzzy, grouped and highlighted results, keyboard control, recent searches | exists | Search, Shell |
| Reading: TL;DR, callouts, code blocks with copy, diagrams and math, glossary popovers, reading time, copy as Markdown, bookmarks, mark as read, notes, font size, line width, focus mode, print styles | exists | Markdown renderer, Chapter page, `styles.css` (`@media print`) |
| Glossary (was Lexicon): A to Z, definitions, in practice, aliases, chapters, filter by letter and book, flashcards | exists | 483 terms |
| Timeline (was Genesis): 1943 to today, tracks, eras, chapter links, approximate dates | exists | 124 events, 7 tracks, 6 eras |
| Learning paths with progress and "next up" | exists | 8 paths |
| Quizzes: per chapter, plus a 10-question boss quiz per book, saved scores | exists | 619 questions |
| Fun layer: XP, levels, badges, streak, stats page, reset, one easter egg | exists | Progress; the "Hallucinator" badge |
| Playgrounds | exists | 8: sampling, BPE tokenizer, attention heatmap, embeddings, chunking, RRF fusion, agent loop, context budget |
| Calculators | exists | 6: KV cache, VRAM, latency, training compute, tokens and cost, RAG index size |
| Decision wizards | exists | 7 |
| Comparison matrices: sortable, filterable, dated | exists | 18 |
| Cheat sheets (was Commandments): one-screen and printable | exists | 14 sheets, 100 principles |
| Debates (was Apocrypha): hot takes with their strongest counterargument | exists | 12 |
| What's new and freshness: changelog, coverage meter, stale volatile chapters | exists | the 90-day rule for volatile chapters is computed in the browser |
| Extend me: schema and commands | exists, outdated | Still describes the single-file artifact workflow; to be rewritten for the repository workflow |
| Settings: theme, font size, line width, reduced motion, export and import, reset | exists | Preferences |
