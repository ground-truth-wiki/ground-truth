# Migration notes

Ground Truth Wiki starts from "The AI Engineer's Bible" v2.0.0, a single self-contained HTML file that is kept unmodified in `source/`. The migration splits that file into small, reviewable files (Markdown chapters, JSON data, the engine), proves with a round-trip build that nothing was lost, renames the project, and adds validation, a contribution system and a static site. Editorial rules come from `source/editorial-masterprompt.md`.

This document is the reconnaissance of `source/bible-v2.0.0.html` before extraction. Everything below was measured from the file on 2026-11-06. Where the migration plan's assumptions disagree with the file, the file wins, and the difference is listed in [Plan versus file](#1-plan-versus-file).

**The file:** 2,270,484 bytes, 19,204 lines, UTF-8 without BOM, LF line endings only (no CR anywhere), ends with a newline. SHA-256 `05910221424b8660dbfffb20dd49e327a497220dbbcebf0f52a439af631524f8`.

## 1. Plan versus file

| Item | Plan assumed | File has | Note |
|---|---|---|---|
| Chapters | 196 | **195** | |
| Status | 195 full, 1 seed | **195 full, 0 seed** | The only `data-status="seed"` in the file is sample text in the engine's Extend me page (engine line 2299). |
| Visuals in `data-visuals` | 447 | **446** | 438 `viz` blocks plus 8 `mermaid` blocks, one-to-one with the attribute lists. |
| JSON data blocks | 13 | **14** | The plan's own list names 14. The count "13" was a miscount. |
| `viz` blocks | about 440 | 438 | |
| `[[term]]` glossary links | about 111 | **4** in chapters (6 in the whole file) | Glossary linking is mostly automatic: the engine links the first use of every glossary term and alias with a regex. See section 6. |
| `<\/` inside chapter bodies | at least one | **0** | All 4 occurrences are in the engine. See section 5. |
| External dependencies | marked, highlight.js, Google Fonts | the same **plus MathJax 3.2.2 and Mermaid 10.9.1** | Both are lazy-loaded from jsDelivr by the engine. See section 7. |
| Engine script | about 230 KB | 229,218 bytes, 2,407 lines | |
| Style block | about 45 KB | 45,232 bytes, 568 lines | |
| "Bible" total | 80 | 80 | Matches. |
| Full title | 10 (4 engine, 1 meta, 5 shell) | 10 (4 engine, 1 meta, 4 page shell, 1 CSS comment) | Matches if the CSS comment counts as shell. |
| "Bible" in chapter text | 57 in 45 chapters | 57 in 45 chapters | One of them is the `data-title` attribute of `how-to-use`. |
| "Bible" elsewhere | "the rest in engine, data and shell" | 5 engine (not full title), 7 data (not full title), 1 shell (`aria-label`) | The 7 data mentions are in quiz questions, a book blurb, a path blurb and a changelog summary. |
| Books and parts | 21 books, 5 parts | 21 books (0 to 20), 5 parts | Matches. |
| Storage key | `aeb-state-v1` | `aeb-state-v1` | Matches. |

## 2. Counts

**Chapters:** 195, all `full`, all `reviewed: 2026-11`.

| Book | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chapters | 4 | 7 | 10 | 11 | 7 | 8 | 16 | 5 | 6 | 12 | 8 | 11 | 14 | 7 | 11 | 11 | 10 | 11 | 7 | 9 | 10 |

- Level: foundation 23, practitioner 113, expert 42, frontier 17.
- Stability: evergreen 55, moving 102, volatile 38.
- Visuals per chapter: 2 visuals in 140 chapters, 3 in 54, 4 in 1 (median 2).
- Prose length per chapter, fenced blocks excluded: 272 to 1,151 words, median 658.
- Orders: all two-part (`N.M`), unique within each book, prefix always equals the book number. No three-part orders yet.
- The file's chapter order already equals the engine's sort order (book, then order).

**Inside chapter bodies:**

| Construct | Count |
|---|---|
| `viz` fences | 438 (237 pretty-printed JSON, 201 single-line) |
| `quiz` fences | 195, one per chapter, body always equals the chapter's own id |
| `mermaid` fences | 8, every one with `id`, `title`, `caption` and `alt` in the info string |
| `widget` fences | 7 |
| `math` fences | 5 |
| Code fences | python 21, text 6, json 4, markdown 1, bash 1, yaml 1 |
| Callouts | tldr 195, number 195, pitfall 195, hottake 195, insight 3, try 1 |
| Links `](#id)` | 1,688, to 208 distinct targets (195 chapters plus 13 engine routes such as `#genesis`, `#matrix-protocols`, `#cmd-evals`) |
| `[[term]]` links | 4 (`KV cache`, `context window`, `JSON-RPC`, `JSON Schema`) |
| HTML entities | 0 (the one `&D;` match is the plain text "R&D;") |
| XML-like tags | 25 distinct, such as `<contract>`, `<IMPORTANT>`, `<PERSON_1>`, all inside prompt and code examples |
| Chapter-body whitespace | every body starts with exactly `\n` and ends with exactly `\n` |

**Viz specs:** all 438 have `id`, `component`, `title`, `caption`, `alt` and `data`. Data kinds: illustrative 390, formula 46, real 2. Visual ids are unique across the whole file.

| Component | Uses | Component | Uses | Component | Uses |
|---|---|---|---|---|---|
| tree | 86 | sequence | 17 | code-walk | 3 |
| diagram | 75 | matrix | 16 | timeline | 2 |
| compare | 71 | explorer | 15 | tokens | 1 |
| stepper | 53 | trace | 8 | budget | 1 |
| chart | 49 | graph | 7 | heatmap | 1 |
| calculator | 26 | wizard | 4 | | |
| | | embedding-map | 3 | | |

**Data blocks:**

| Block | Bytes | Structure | Items |
|---|---|---|---|
| `data-meta` | 171 | `{title, version, updated, cutoff, verified}` | version 2.0.0, updated 2026-11-03, cutoff June 2026 |
| `data-books` | 4,407 | `{parts, books}` | 5 parts, 21 books (`n, id, title, blurb, hue, stability`) |
| `data-glossary` | 130,189 | `{terms}` | 483 terms; 52 have `abbr` |
| `data-timeline` | 36,355 | `{eras, tracks, events}` | 6 eras, 7 tracks, 124 events |
| `data-quizzes` | 186,758 | `{questions}` | 619 questions, 4 options each; 161 chapters have 3, 34 have 4 |
| `data-paths` | 6,455 | `{paths, ladder}` | 8 paths, 9 ladder rungs |
| `data-matrices` | 25,477 | `{matrices}` | 18 matrices |
| `data-cheatsheets` | 7,929 | `{sheets}` | 14 sheets, 100 items |
| `data-presets` | 5,981 | `{tools}` | 14 playground presets |
| `data-wizards` | 9,105 | `{wizards}` | 7 decision wizards |
| `data-apocrypha` | 5,273 | `{takes}` | 12 hot takes |
| `data-didyouknow` | 3,739 | `{facts}` | 21 facts |
| `data-changelog` | 9,098 | `{entries}` | 16 entries |
| `data-aliases` | 88 | `{old: new}` | 3 aliases: `tool-use`, `tool-design` to `agent-tools`; `lexicon-chapter` to `lexicon-guide` |

**Integrity:** every cross-reference resolves. That covers 1,688 chapter links, 4 term links, glossary `chapters`, timeline events and eras, path steps, ladder rungs, matrix, sheet and preset `chapter` fields, preset `viz` ids, apocrypha, did-you-know, changelog and quiz `chapter` fields, with aliases respected. Zero failures. No duplicate chapter, glossary, quiz or visual ids. All ids are lowercase and filename-safe, with no case clashes and no Windows-reserved names.

## 3. Chapter attribute set

Every chapter's opening tag has exactly these attributes, in this order, all double-quoted:

`type="text/markdown" data-id data-book data-order data-title data-level data-stability data-reviewed data-status data-tags data-visuals`

- `data-id`: lowercase, hyphenated, unique.
- `data-book`: integer 0 to 20. `data-order`: `"<book>.<n>"`.
- `data-level`: foundation, practitioner, expert or frontier. `data-stability`: evergreen, moving or volatile. `data-status`: full (seed is supported by the engine, unused).
- `data-reviewed`: `YYYY-MM`.
- `data-tags`: comma-separated, no spaces.
- `data-visuals`: comma-separated `id:form` pairs. For `viz` blocks the form is the viz `component`. For `mermaid` blocks the form is the diagram type, not `mermaid`: `flowchart` (5) or `state` (3). The validator must map these.
- No attribute value contains an HTML entity, so attributes extract and rebuild as plain strings.

## 4. Segment order

The file is: a short head, the `<style>` block, the static body shell, 21 runs of chapter blocks framed by `<!-- BOOK N START -->` and `<!-- BOOK N END -->` comments, 14 JSON data blocks, two CDN `<script src>` tags, and one engine `<script>`. Chapters are separated by exactly one `\n`, and so are data blocks. The full ordered list of 79 segments with line ranges is in [Appendix B](#appendix-b-every-top-level-segment-in-file-order).

| Lines | Segment |
|---|---|
| 1 to 10 | doctype, `<html lang="en">`, `<head>`, charset, viewport, `<title>`, description meta, Google Fonts preconnects and stylesheet |
| 11 to 580 | `<style>` (engine styles) |
| 580 to 684 | `</head>`, `<body>`, inline SVG library (role glyphs, hatch patterns, icons), header, layout (`#nav`, `#main` with a `<noscript>`, `#rail`), search palette, `<!-- ===== CONTENT ... ===== -->`, `<!-- BOOK 0 START -->` |
| 685 to 16,773 | 195 chapter blocks in 21 book runs |
| 16,774 to 16,776 | `<!-- BOOK 20 END -->`, `<!-- ===== DATA: structured JSON blocks ===== -->` |
| 16,777 to 16,790 | 14 data blocks, one per line: meta, books, glossary, timeline, quizzes, paths, matrices, cheatsheets, presets, wizards, apocrypha, didyouknow, changelog, aliases |
| 16,791 | `<!-- ===== ENGINE ===== -->` |
| 16,792 to 16,793 | `<script src>` marked 12.0.2, then highlight.js 11.9.0 |
| 16,794 to 19,202 | engine `<script>` (one IIFE) |
| 19,203 to 19,204 | `</body>`, `</html>` |

## 5. Escape sequences

| Where | Sequence | Count | Meaning |
|---|---|---|---|
| Chapter bodies | `<\/` | 0 | No chapter currently contains a closing script tag. |
| Engine | `<\/script` | 3 | Engine lines 113 (un-escape regex), 568 (SVG sanitizer), 2299 (Extend me sample). |
| Engine | `<\/p` | 1 | Engine line 218, inside a regex. |
| `data-glossary` | `<` | 2 | Every `<` in the block is written as `<`. |
| `data-quizzes` | `<` | 1 | Same rule. |
| `data-glossary`, `data-quizzes` | `\"` | 2, 4 | Standard JSON string escapes. |
| Other data blocks | none | | No `<`, no `\/`, no `\uXXXX`. Non-ASCII characters (’, “, →, ×) are written literally everywhere. |

**How the engine un-escapes (engine line 113):** `c.node.textContent.replace(/<\\\/script/gi, '<\/script')`. It only turns `<\/script` (any case) back into `</script`. It does not touch other `<\/` sequences.

**Consequence for extraction and build:** the build must escape only `</script` (case-insensitive) to `<\/script`, and the extractor must un-escape only that sequence. A general "every `</` becomes `<\/`" rule would put visible backslashes into the code samples that close XML-like tags, such as `</contract>` and `</example>`. This narrows the rule in the prompt's section 7. See decision D2.

**Data serialization, which matters for a byte-identical round trip:**

| Block | Exact serializer |
|---|---|
| `data-meta` | Python-style `json.dumps`: `", "` and `": "` separators, non-ASCII literal |
| All other 13 | compact `JSON.stringify` (no spaces) with every `<` replaced by `<` |

Both rules reproduce their blocks byte for byte. Applying the `<` rule to all 13 compact blocks is safe, because the other 11 contain no `<`. The manifest will record the style per block.

## 6. How the engine discovers content

- **Chapters (engine lines 93 to 107):** `document.querySelectorAll('script[type="text/markdown"]')`, read through `dataset`. Duplicate ids are skipped with a console warning. Then the engine sorts by `book`, then by `order` compared numerically part by part, so `9.10` comes after `9.9`. File order does not matter to the engine.
- **Chapter body (engine line 113):** `textContent`, un-escape `<\/script`, strip one leading blank line. Bodies are parsed lazily on first view.
- **Data (engine lines 71 to 90):** `readJSON(id, fallback)` does `document.getElementById(id)` and `JSON.parse(textContent)`. Each block has a fallback, so a missing block never crashes the page.
- **Fences (engine lines 169 to 272):** `prepMD` swaps every fenced block for a placeholder before Markdown parsing. `renderBlock` then handles `viz` (JSON spec, then a component), `mermaid` (info-string attributes, rendered lazily), `svg` (inline SVG with scripts stripped; unused in content), `math` (MathJax block), `quiz` (body is a chapter id), `widget` (body is a widget name), and any other language as highlighted code.
- **Inline (engine lines 175 to 183):** `\( ... \)` is inline math. `[[term]]` and `[[shown text|term-id]]` are explicit glossary links. Unknown terms render as plain text.
- **Automatic glossary links (engine lines 119 to 161):** the engine builds one regex from every glossary term and alias (2 characters or longer, longest first) and links the first use of each on a page. This is where most glossary links come from.
- **Callouts (engine lines 231 to 255):** blockquotes starting with `[!type]`. Supported types: tldr, insight, pitfall, expert, hottake, try, number, history, note, seed. Content uses tldr, number, pitfall, hottake, insight and try.
- **Routes (engine lines 1632 to 1633, 2373 to 2375):** the hash is a chapter id, an alias (rewritten with `history.replaceState`), one of 16 pages (`home, lexicon, flashcards, genesis, paths, quizzes, workshop, matrices, commandments, apocrypha, whats-new, extend-me, prefs, progress, visuals, visual-legend`), or a prefixed route (`book-, term-, tool-, path-, boss-, matrix-, cmd-`). Anything else is a 404 page.

## 7. External URLs

Every external URL in the file:

| Where | URL | What it is |
|---|---|---|
| Page shell | `https://fonts.googleapis.com` | preconnect |
| Page shell | `https://fonts.gstatic.com` | preconnect |
| Page shell | `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;600&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..600&display=swap` | font stylesheet |
| `<script src>` | `https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js` | Markdown parser (the engine falls back to a mini parser if it is missing) |
| `<script src>` | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js` | syntax highlighting (optional) |
| Engine | `https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js` | loaded on demand when a page has math |
| Engine | `https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js` | loaded on demand when a page has a Mermaid diagram |
| Shell, engine | `http://www.w3.org/2000/svg` | SVG namespace, not a request |
| Chapters | 7 URLs on `tickets.example.com` (5), `auth.example.com` (1), `expenses.example.com` (1) | placeholders inside examples, not requests |

**Chapters link to no real sources.** Papers, specifications and docs are named in the text (title, author, year, repository), following the editorial rule "Link only to stable official pages you are confident exist; otherwise give a search hint." See surprise S4.

## 8. What the engine supports

**Viz components (18, `VIZ_KNOWN = Object.keys(VIZ)`, engine line 1629):** `diagram, heatmap, stepper, sequence, chart, calculator, explorer, embedding-map, graph, tree, budget, compare, tokens, trace, code-walk, timeline, wizard, matrix`. All 18 are used. Separate renderers cover `mermaid`, `svg` and `math`.

**Explorer models (15, engine lines 1021 to 1358):** `sampling, chunking, rrf, sawtooth, multiagent, judge, trifecta, injection, attention, passk, ci, autonomy, ndcg, roofline, spec`. Each is used once.

**Widgets (7, engine lines 2010 to 2032):** `acronyms, canon, paths, ladder, commandments, lexicon, changelog`. Each is used once. An unknown name renders an error box.

**Visual roles (9, engine line 509):** model, context, token, tool, data, agent, human, external, untrusted. Each has a glyph in the shell's SVG library and a color variable pair in the style block.

**Storage:** one `localStorage` key, `aeb-state-v1`, guarded by try/catch. It holds read state, bookmarks, notes, quiz results, boss scores, XP, badges, streak days, preferences, recent searches, last chapter and the flashcard count. There are no cookies, `sessionStorage`, IndexedDB, `fetch` calls or beacons.

## 9. What the engine generates itself

These are computed at runtime or hardcoded in the engine, not read from content blocks:

- **Hero title animation (engine lines 2035 to 2079):** the title is a hardcoded token array `['The', ' AI', ' Engineer', '’s', ' Bible']` with saliency weights, plus 9 steps of candidate continuation tokens ("…: everything between the token and the product."). The rename needs a small engine change here (Phase 3).
- **Page and footer text:** document titles (`<chapter> · The AI Engineer’s Bible`), page titles, the footer sentence built from `data-meta`, the 404 page, and every page lede (Paths, Apocrypha, Visual legend, Extend me and others).
- **Extend me page (engine lines 2295 to 2305):** hardcoded commands, a sample chapter tag, Markdown syntax notes and a list of the data block ids. It describes the single-file artifact workflow ("Give the artifact link…", "BOOK 12 START") and will be wrong after the migration.
- **Glossary links:** the term regex (section 6) and the term popovers.
- **Heading anchors:** `h-<slug>` ids, de-duplicated per page.
- **Reading time:** words outside special fences divided by 230.
- **Search index:** built once on first search from chapters (title, headings, tags, body), terms, presets, wizards, matrices, cheat sheets, timeline events and a fixed list of pages. Fuzzy matching tolerates an edit distance of 1.
- **Gamification:** XP, levels (from "Token Tourist" upward), streaks, 11 fixed badges plus one per book and one per path, and boss quizzes (10 random questions from a book's pool, opening at 3 questions).
- **Random elements:** random chapter, boss-quiz order, flashcard order, the did-you-know pick and hero sampling. None of these touch build output.
- **Freshness:** "What's new" lists volatile chapters reviewed more than 90 days ago, computed against today's date in the browser.
- **Visuals gallery and legend:** built by scanning every chapter's fences. Captions of illustrative visuals get an "Illustrative." prefix when they lack the word.
- **Book pages, Book maps, home stats, progress page:** computed from `data-books`, the chapter list and storage.

## 10. Engine map (preview for `engine/README.md`)

Line numbers are engine-relative (line 1 is the first line inside the engine `<script>`, which is file line 16,795).

| Lines | Part |
|---|---|
| 1 to 52 | core helpers: DOM builders, escaping, slug, formatting, `inlineMD` |
| 53 to 69 | storage (`aeb-state-v1`) |
| 70 to 118 | data blocks, chapter discovery and sorting, books, parts |
| 119 to 161 | glossary: term map, auto-link regex |
| 162 to 286 | Markdown pipeline: placeholders, marked or fallback, callouts, fences, code blocks |
| 287 to 330 | lazy libraries: MathJax and Mermaid |
| 331 to 373 | popovers and toasts |
| 374 to 438 | progress, XP, levels, badges |
| 439 to 506 | search index and matching |
| 507 to 619 | visual system: viz shell, Mermaid and SVG figures, SVG helpers |
| 620 to 1630 | the 18 viz components, explorer models, wizard and matrix embeds |
| 1631 to 1821 | shell: theme, preferences, navigation tree, drawers, search palette |
| 1822 to 1871 | router and footer |
| 1872 to 2008 | chapter page and quizzes (including boss quizzes) |
| 2009 to 2033 | widgets |
| 2034 to 2376 | pages: home (with hero), book, lexicon, flashcards, Genesis, paths, workshop, matrices, commandments, apocrypha, what's new, Extend me, preferences, progress, visuals, legend |
| 2377 to 2407 | init |

## 11. The editorial masterprompt and where it goes

`source/editorial-masterprompt.md` has 12 numbered sections. Section 4 spans five headings, one per Part. It is 69,110 bytes and 585 lines.

| # | Section | What it contains | Where it lives in the repo |
|---|---|---|---|
| 1 | Mission | The three jobs (course, reference, joy), the audience, built to grow, content separate from code, dated facts. Also says "Don't stop to ask me questions." | README.md (mission, adapted to Ground Truth) and STYLE_GUIDE.md (audience and tone). The "don't ask" line is superseded by migration rule 7 ("stop and ask"). |
| 2 | Deliverable and architecture | Single HTML artifact, engine and content separation, chapter attributes, data blocks, BOOK anchors, escaping, pinned CDNs, runtime rules | Replaced by the migration plan. Its technical facts go to engine/README.md. Attribute rules go to the frontmatter schema and the validator. |
| 3 | How to build it | Increments within one chat turn, the automated check list, the budget priority order | Replaced by the migration plan. The check list (step 5) feeds `scripts/validate.mjs`. |
| 4 | Coverage map (Parts I to V) | Every book and chapter (195 entries) with what it must cover | docs/COVERAGE_MAP.md. It drives `continue` and the wanted pages. |
| 5 | Chapter templates and writing style | The 12-part full template, the seed template, flagships, the deepening order, writing style rules | STYLE_GUIDE.md and `templates/`. Machine-checkable parts (tldr first, 2 to 4 quiz questions, related chapters) go to the validator. The deepening order goes to docs/COVERAGE_MAP.md. |
| 6 | Visualizations | Form-from-shape guide, one visual language (glyphs, role colors, flat style), 16 components, where visuals live, spec fields, quality bar, coverage, review, signature visuals per book | docs/VISUAL_LANGUAGE.md. Spec fields, data kinds, calculator tests and caption rules go to the viz schema and the validator. |
| 7 | Features | Home, navigation, search, reading, Lexicon, Genesis, paths, quizzes, fun layer, playgrounds, calculators, wizards, matrices, Commandments, Apocrypha, what's new, Extend me, settings | engine/README.md, as a feature checklist marking what exists |
| 8 | Design direction | Subject, audience, personality, hero boldness, typography, color, what to avoid, layout, quality floor | docs/DESIGN.md |
| 9 | Accuracy and honesty rules | Textbook fundamentals, "as of" dating, never invent, naming papers, contested questions, code correctness, case studies, cutoff, not legal advice | STYLE_GUIDE.md. Referenced by rulebook rule 2 in GOVERNANCE.md, AGENTS.md and CONTRIBUTING.md. |
| 10 | Freshness notes (verified November 2026) | Verified facts on MCP 2026-07-28, A2A 1.0, Claude Code, Agent Skills, sandboxing, trends | STYLE_GUIDE.md, as a dated "freshness baseline" appendix that the `refresh` command starts from. Not in the target structure yet; see decision D9. |
| 11 | Built to grow: the extension protocol | Permanent ids and aliases, no deletions, version bump and changelog, reviewed dates, where new research goes, the 7 commands | AGENTS.md (maintainer commands and update rules) and GOVERNANCE.md (no deletions without owner approval). Alias resolution goes to the validator. The last bullet about artifact links is dropped. |
| 12 | Definition of done for this run | Artifact quality, coverage, feature, playground and data minimums, visual coverage | Replaced by the migration plan's definition of done. The visual coverage rule (2 to 4 per full chapter, at least one interactive) goes to the validator as a warning and to STYLE_GUIDE.md. |

## 12. Surprises

- **S1. No seed chapters, and the coverage map is complete.** All 195 chapters in section 4 of the editorial masterprompt exist and are full. Two titles differ only in quote style: 11.1 uses curly quotes in the file, and 20.6 uses a curly apostrophe. Phase 7's "wanted pages from map chapters that don't exist yet" therefore yields none, and the `continue` command ("deepen the next seed chapters") has nothing to work on.
- **S2. Two CDN libraries are missing from the plan's dependency list:** MathJax 3.2.2 and Mermaid 10.9.1. Privacy rule 11 needs them self-hosted, and neither is on the allowed-dependencies list in rule 5.
- **S3. The escape rule is narrower than the prompt says.** No chapter contains `<\/` today. The engine un-escapes only `<\/script`. See section 5.
- **S4. Chapters contain no source URLs.** Rulebook rule 1 (a checkable source for every claim) is met by naming sources, not linking them. The validator cannot require links for the existing 195 chapters without failing all of them.
- **S5. Quiz questions are not grouped by chapter.** The 619 questions form 228 runs over 195 chapters, so per-chapter files need a global order record to round-trip.
- **S6. The glossary order is neither alphabetical nor by id,** so per-term files need an order record too.
- **S7. Mermaid visuals use the diagram type as their form** in `data-visuals` (`flowchart`, `state`), not `mermaid`.
- **S8. "Bible" also appears in data, not only in chapter text:** 4 quiz questions, 1 book blurb, 1 path blurb and 1 changelog summary.
- **S9. The hero title is a token array**, so the rename is an engine edit, not only a string replacement.
- **S10. The Extend me page documents the old artifact workflow** and will need rewriting once the contribution system exists.
- **S11. A `.claude/` folder exists in the repository root.** Claude Code created it. It is empty, so Git ignores it today, but local agent settings must never be committed. A `.gitignore` entry for `.claude/settings.local.json` comes with the Phase 1 tooling.

## 13. Decisions (accepted 2026-11-06)

- **D1. Counts.** Accept the file's numbers (195 chapters, 0 seeds, 446 visuals, 14 data blocks) as the baseline for all later checks.
- **D2. Escaping.** The extractor un-escapes only `<\/script` (any case), and the build escapes only `</script` (any case). This narrows the plan's "every `<\/` becomes `</`" rule to what the engine actually does.
- **D3. Order records for split data.** Glossary: `data/glossary/_index.json` lists term ids in source order. Quizzes: `data/quizzes/_index.json` lists question ids in source order. Items missing from an index (new contributions) are appended in a defined order: glossary alphabetically by id, quizzes by book and chapter order, then question id. Contributors then never edit the index, which avoids merge conflicts. The alternative is an `order` field inside each file, but it adds a field the source does not have, and two contributors can pick the same number.
- **D4. MathJax and Mermaid (Phase 4).** Add `mathjax@3.2.2` and `mermaid@10.9.1` as exact-version npm dependencies and self-host them. Without this, math and diagram pages call jsDelivr. Note that Mermaid is large: the offline single file will grow by several megabytes if both are inlined.
- **D5. Wanted pages (Phase 7).** With the map complete, `data/wanted.json` starts empty unless new topics are added to docs/COVERAGE_MAP.md first. Topics must not be invented, so they come from maintainers or from accepted proposals. `data/wanted.json` starts empty.
- **D6. What `continue` means now.** With no seeds left, `continue` works the freshness backlog first, then deepens or adds map topics as they are approved.
- **D7. Sources in legacy content.** Missing source links in the existing 195 chapters are an `audit` backlog. Sources are required for new and changed content only.
- **D8. Book folder slugs:** `00-start-here, 01-foundations, 02-transformer, 03-building-llms, 04-model-landscape, 05-prompt-and-context, 06-retrieval-rag, 07-data, 08-multimodal, 09-agents, 10-agent-archetypes, 11-harnesses, 12-protocols, 13-frameworks, 14-evaluation, 15-inference, 16-llmops, 17-security-safety, 18-system-design, 19-frontier, 20-reference-career`.
- **D9. Where section 10 (freshness notes) lives.** An appendix in STYLE_GUIDE.md.

---

## Appendix A: every occurrence of "Bible"

Lines are file lines in `source/bible-v2.0.0.html`. "Kind" says where in the segment the word sits, which decides how the rename handles it.

| # | Line | Location | Kind | Full title | Context |
|---|---|---|---|---|---|
| 1 | 6 | page shell | <title> | yes | …<title>The AI Engineer’s Bible</title>… |
| 2 | 12 | style block | CSS comment | yes | …/* ===== The AI Engineer's Bible: engine styles ===== */… |
| 3 | 662 | page shell | aria-label | yes | …<a class="brand" href="#home" aria-label="The AI Engineer’s Bible, home">… |
| 4 | 664 | page shell | visible text | yes | …<span>The AI Engineer’s Bible</span>… |
| 5 | 666 | page shell | aria-label |  | …earch" id="search-btn" type="button" aria-label="Search the Bible"><svg class="ic" aria-hidden="true… |
| 6 | 672 | page shell | noscript text | yes | …main id="main" tabindex="-1"><noscript><p>The AI Engineer’s Bible needs JavaScript to render its cha… |
| 7 | 705 | chapter `ai-engineer-role` | viz JSON `caption` |  | …tions to production","caption":"Each node is a Book of this Bible. Follow the edges for a sensible l… |
| 8 | 740 | chapter `ai-engineer-role` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 9 | 843 | chapter `ai-engineering-stack` | prose |  | …- This Bible’s [Reference architecture](#refere… |
| 10 | 914 | chapter `mental-models` | prose |  | …- This Bible’s [Commandments](#commandments-gui… |
| 11 | 923 | chapter `how-to-use` | data-title attribute |  | …data-book="0" data-order="0.4" data-title="How to use this Bible" data-level="foundation" data-stab… |
| 12 | 931 | chapter `how-to-use` | prose |  | …The Bible is a city: Books are districts, ch… |
| 13 | 934 | chapter `how-to-use` | viz JSON `alt` |  | …k a district to start reading there.","alt":"Diagram of the Bible’s structure: foundations, building… |
| 14 | 953 | chapter `how-to-use` | viz JSON `title` |  | …ur","component":"stepper","title":"Your first hour with the Bible","caption":"A suggested route for… |
| 15 | 976 | chapter `how-to-use` | prose |  | …Experts use the Bible as a map: they read the chapter fo… |
| 16 | 1266 | chapter `neural-networks` | prose |  | …Every model in this Bible is a neural network. Knowing forwa… |
| 17 | 2821 | chapter `agentic-rl` | prose |  | …- This Bible’s [RL environment harnesses](#rl-e… |
| 18 | 3116 | chapter `frontier-families` | prose |  | …- This Bible’s [state-of-the-art snapshot](#sot… |
| 19 | 3249 | chapter `small-local-models` | prose |  | …- This Bible’s [edge and on-device AI](#edge-on… |
| 20 | 3479 | chapter `choosing-a-model` | prose |  | …- This Bible’s [benchmark literacy](#benchmark-… |
| 21 | 3513 | chapter `model-apis` | viz JSON `caption` |  | …"caption":"Expand a feature for what it does and where this Bible covers it. Names and availability… |
| 22 | 3558 | chapter `model-apis` | prose |  | …- This Bible’s [agent loop](#agent-loop) chapte… |
| 23 | 5702 | chapter `deep-research` | prose |  | …- This Bible’s [advanced RAG](#advanced-rag) an… |
| 24 | 5775 | chapter `data-strategy` | prose |  | …- This Bible’s [data flywheel](#data-flywheel)… |
| 25 | 6485 | chapter `multimodal-apps` | prose |  | …- This Bible’s Book 8 chapters on each modality… |
| 26 | 6518 | chapter `what-is-an-agent` | prose |  | …lding effective agents” (December 2024) draws the line this Bible uses: in **workflows**, models and… |
| 27 | 7239 | chapter `long-running-agents` | prose |  | …- This Bible’s [reliability engineering](#relia… |
| 28 | 7523 | chapter `agent-failure-modes` | prose |  | …- This Bible’s [error analysis](#error-analysis… |
| 29 | 7608 | chapter `agent-ux` | prose |  | …- This Bible’s [AI product and UX](#ai-product-… |
| 30 | 7846 | chapter `research-analyst-agents` | prose |  | …- This Bible’s [deep research](#deep-research)… |
| 31 | 8168 | chapter `document-extraction` | prose |  | …- This Bible’s [ingestion and parsing](#ingesti… |
| 32 | 10557 | chapter `protocol-soup` | prose |  | …- This Bible’s [protocol matrix](#matrix-protoc… |
| 33 | 10885 | chapter `orchestration-frameworks` | prose |  | …- This Bible’s [framework anti-patterns](#frame… |
| 34 | 11124 | chapter `framework-selection` | prose |  | …- This Bible’s [landscape map](#framework-lands… |
| 35 | 11473 | chapter `eval-datasets` | prose |  | …- This Bible’s [benchmark literacy](#benchmark-… |
| 36 | 11848 | chapter `eval-recipes` | prose |  | …- This Bible’s Book 14 chapters linked from eac… |
| 37 | 13174 | chapter `reference-architecture` | prose |  | …- This Bible’s [system design method](#system-d… |
| 38 | 13540 | chapter `prompt-config-management` | prose |  | …- This Bible’s [CI/CD for AI](#ci-cd-for-ai) ch… |
| 39 | 13636 | chapter `ci-cd-for-ai` | prose |  | …- This Bible’s [eval harnesses](#eval-harnesses… |
| 40 | 13798 | chapter `data-flywheel` | prose |  | …- This Bible’s [error analysis](#error-analysis… |
| 41 | 14020 | chapter `threat-modeling` | viz JSON `title` |  | …WASP Top 10 for LLM applications, each linked to where this Bible covers it","caption":"Expand for a… |
| 42 | 15030 | chapter `system-design-method` | prose |  | …- This Bible’s [reference architectures](#refer… |
| 43 | 15170 | chapter `back-of-envelope` | prose |  | …- This Bible’s [numbers to know](#numbers-to-kn… |
| 44 | 15237 | chapter `decision-guides` | prose |  | …- This Bible’s decision wizards and comparison… |
| 45 | 15264 | chapter `public-writeups` | viz JSON `caption` |  | …ption":"Expand a lesson for where it appears and where this Bible covers it.","alt":"Tree of recurri… |
| 46 | 15424 | chapter `anti-patterns` | prose |  | …- This Bible’s [lessons from public write-ups](… |
| 47 | 16004 | chapter `watchlist` | prose |  | …- Treat volatile chapters of this Bible as dated; check their review dates… |
| 48 | 16026 | chapter `watchlist` | prose |  | …- This Bible’s [What’s new](#whats-new) page an… |
| 49 | 16039 | chapter `lexicon-guide` | callout text |  | …> The Lexicon is the Bible’s glossary: every term with a one-… |
| 50 | 16098 | chapter `lexicon-guide` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 51 | 16104 | chapter `acronym-decoder` | callout text |  | …> Every acronym in the Bible, expanded and linked to its Lexico… |
| 52 | 16168 | chapter `acronym-decoder` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 53 | 16318 | chapter `commandments-guide` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 54 | 16379 | chapter `the-canon` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 55 | 16440 | chapter `whos-who` | prose |  | …- This Bible’s [Watchlist](#watchlist) for what… |
| 56 | 16460 | chapter `talking-shop` | viz JSON `caption` |  | …and how they connect","caption":"Each node is a debate the Bible covers with arguments on both side… |
| 57 | 16626 | chapter `interview-prep` | prose |  | …- This Bible’s [system design method](#system-d… |
| 58 | 16640 | chapter `project-ladder` | prose |  | …oof. A ladder of increasingly demanding projects turns this Bible into a curriculum and gives you wo… |
| 59 | 16699 | chapter `project-ladder` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 60 | 16707 | chapter `changelog-extend` | callout text |  | …> Every version of the Bible is recorded with the chapters it c… |
| 61 | 16732 | chapter `changelog-extend` | viz JSON `title` |  | …extend-tree","component":"tree","title":"Ways to extend the Bible","caption":"Expand each kind of re… |
| 62 | 16732 | chapter `changelog-extend` | viz JSON `alt` |  | …e has the exact formats.","alt":"Tree of ways to extend the Bible: continue, deepen, add, refresh an… |
| 63 | 16771 | chapter `changelog-extend` | link text |  | …- [How to use this Bible](#how-to-use)… |
| 64 | 16777 | data `data-meta` | field `title` | yes | …plication/json" id="data-meta">{"title": "The AI Engineer’s Bible", "version": "2.0.0", "updated": "… |
| 65 | 16778 | data `data-books` | field `blurb` |  | …ne page, the mental models that matter, and how to use this Bible.","hue":22,"stability":null},{"n":… |
| 66 | 16781 | data `data-quizzes` | field `q` |  | …"b13-3","chapter":"framework-landscape","q":"What does this Bible recommend as the starting point be… |
| 67 | 16781 | data `data-quizzes` | field `q` |  | …o-use","q":"What is the fastest way to find anything in the Bible?","options":["Scroll","Search with… |
| 68 | 16781 | data `data-quizzes` | field `q` |  | …ter":"project-ladder","q":"How many learning paths does the Bible offer?","options":["3","8","14","2… |
| 69 | 16781 | data `data-quizzes` | field `q` |  | …hangelog-extend","q":"Which rule keeps links working as the Bible grows?","options":["Renumbering ch… |
| 70 | 16782 | data `data-paths` | field `blurb` |  | …"Zero to AI Engineer in 12 weeks","blurb":"The spine of the Bible: models, prompting, retrieval, age… |
| 71 | 16789 | data `data-changelog` | field `summary` |  | …:"Complete: all 195 chapters are full. The last ten add the Bible map, the Canon lineage graph, fift… |
| 72 | 16796 | engine | code comment | yes | …/* ===== The AI Engineer's Bible: engine core ===== */… |
| 73 | 18630 | engine | UI string | yes | …let hasRail = false, title = 'The AI Engineer’s Bible';… |
| 74 | 18659 | engine | UI string | yes | …el('p', {}, 'The AI Engineer’s Bible, version ' + (m.version \|\| '0') +… |
| 75 | 18830 | engine | hero token array |  | …const toks = ['The', ' AI', ' Engineer', '’s', ' Bible'];… |
| 76 | 18844 | engine | aria-label | yes | …1', { class: 'hero-title', 'aria-label': 'The AI Engineer’s Bible' });… |
| 77 | 18881 | engine | UI string |  | …e job is, the stack, the mental models, and how to use this Bible.' })),… |
| 78 | 19006 | engine | UI string |  | …el('p', { class: 'lede', text: 'Curated routes through the Bible. Progress fills in as you read; th… |
| 79 | 19090 | engine | UI string |  | …text: 'Extend me' }), el('p', { class: 'lede', text: 'This Bible is one HTML file built to grow. Co… |
| 80 | 19157 | engine | UI string |  | …d' }), el('p', { class: 'lede', text: 'Every diagram in the Bible speaks one language. The same thin… |

**Lowercase identifiers (11, not displayed as a name; keep as internal identifiers):**

| Line | Text | Location |
|---|---|---|
| 923 | `bible-map` | chapter `how-to-use` (data-visuals attribute) |
| 934 | `bible-map` | chapter `how-to-use` (viz id) |
| 16856 | `[bible]` | engine (console prefix) |
| 16868 | `[bible]` | engine (console prefix) |
| 16891 | `[bible]` | engine (console prefix) |
| 17005 | `[bible]` | engine (console prefix) |
| 17027 | `[bible]` | engine (console prefix) |
| 17121 | `[bible]` | engine (console prefix) |
| 17343 | `[bible]` | engine (console prefix) |
| 17823 | `[bible]` | engine (console prefix) |
| 18640 | `[bible]` | engine (console prefix) |

## Appendix B: every top-level segment, in file order

Whitespace-only separators between chapters (always a single `\n`) are folded into the chapter runs.

| # | Segment | Lines | Bytes | Notes |
|---|---|---|---|---|
| 1 | static HTML | 1–10 | 673 | <!doctype html> <html lang="en"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-wid |
| 2 | `<style>` block | 11–580 | 45248 | engine styles |
| 3 | static HTML | 580–684 | 18855 | end of head, `<body>`, SVG glyph and icon library, header, layout containers, search palette, content comment, `BOOK 0 START` |
| 4 | 4 chapter blocks, Book 0 | 685–995 | 28544 | `ai-engineer-role` … `how-to-use`, each separated by `\n` |
| 5 | static HTML | 995–997 | 43 | <!-- BOOK 0 END --> <!-- BOOK 1 START --> |
| 6 | 7 chapter blocks, Book 1 | 998–1464 | 40487 | `linear-algebra` … `rl-primer`, each separated by `\n` |
| 7 | static HTML | 1464–1466 | 43 | <!-- BOOK 1 END --> <!-- BOOK 2 START --> |
| 8 | 10 chapter blocks, Book 2 | 1467–2241 | 80198 | `tokenization` … `mech-interp`, each separated by `\n` |
| 9 | static HTML | 2241–2243 | 43 | <!-- BOOK 2 END --> <!-- BOOK 3 START --> |
| 10 | 11 chapter blocks, Book 3 | 2244–3052 | 74305 | `pretraining-data` … `safety-character-training`, each separated by `\n` |
| 11 | static HTML | 3052–3054 | 43 | <!-- BOOK 3 END --> <!-- BOOK 4 START --> |
| 12 | 7 chapter blocks, Book 4 | 3055–3566 | 43998 | `frontier-families` … `model-apis`, each separated by `\n` |
| 13 | static HTML | 3566–3568 | 43 | <!-- BOOK 4 END --> <!-- BOOK 5 START --> |
| 14 | 8 chapter blocks, Book 5 | 3569–4264 | 68297 | `prompting-fundamentals` … `model-specific-notes`, each separated by `\n` |
| 15 | static HTML | 4264–4266 | 43 | <!-- BOOK 5 END --> <!-- BOOK 6 START --> |
| 16 | 16 chapter blocks, Book 6 | 4267–5710 | 141641 | `rag-fundamentals` … `deep-research`, each separated by `\n` |
| 17 | static HTML | 5710–5712 | 43 | <!-- BOOK 6 END --> <!-- BOOK 7 START --> |
| 18 | 5 chapter blocks, Book 7 | 5713–6060 | 26550 | `data-strategy` … `unstructured-pipelines`, each separated by `\n` |
| 19 | static HTML | 6060–6062 | 43 | <!-- BOOK 7 END --> <!-- BOOK 8 START --> |
| 20 | 6 chapter blocks, Book 8 | 6063–6493 | 34449 | `vision-language-models` … `multimodal-apps`, each separated by `\n` |
| 21 | static HTML | 6493–6495 | 43 | <!-- BOOK 8 END --> <!-- BOOK 9 START --> |
| 22 | 12 chapter blocks, Book 9 | 6496–7617 | 132972 | `what-is-an-agent` … `agent-ux`, each separated by `\n` |
| 23 | static HTML | 7617–7619 | 44 | <!-- BOOK 9 END --> <!-- BOOK 10 START --> |
| 24 | 8 chapter blocks, Book 10 | 7620–8260 | 61426 | `coding-agents` … `embodied-agents`, each separated by `\n` |
| 25 | static HTML | 8260–8262 | 45 | <!-- BOOK 10 END --> <!-- BOOK 11 START --> |
| 26 | 11 chapter blocks, Book 11 | 8263–9305 | 105036 | `what-is-a-harness` … `build-your-own-harness`, each separated by `\n` |
| 27 | static HTML | 9305–9307 | 45 | <!-- BOOK 11 END --> <!-- BOOK 12 START --> |
| 28 | 14 chapter blocks, Book 12 | 9308–10652 | 149192 | `why-protocols` … `protocol-governance`, each separated by `\n` |
| 29 | static HTML | 10652–10654 | 45 | <!-- BOOK 12 END --> <!-- BOOK 13 START --> |
| 30 | 7 chapter blocks, Book 13 | 10655–11200 | 50143 | `framework-landscape` … `framework-anti-patterns`, each separated by `\n` |
| 31 | static HTML | 11200–11202 | 45 | <!-- BOOK 13 END --> <!-- BOOK 14 START --> |
| 32 | 11 chapter blocks, Book 14 | 11203–12203 | 89859 | `why-evals` … `eval-tooling`, each separated by `\n` |
| 33 | static HTML | 12203–12205 | 45 | <!-- BOOK 14 END --> <!-- BOOK 15 START --> |
| 34 | 11 chapter blocks, Book 15 | 12206–13087 | 83114 | `inference-fundamentals` … `edge-on-device`, each separated by `\n` |
| 35 | static HTML | 13087–13089 | 45 | <!-- BOOK 15 END --> <!-- BOOK 16 START --> |
| 36 | 10 chapter blocks, Book 16 | 13090–13982 | 79922 | `reference-architecture` … `incidents-on-call`, each separated by `\n` |
| 37 | static HTML | 13982–13984 | 45 | <!-- BOOK 16 END --> <!-- BOOK 17 START --> |
| 38 | 11 chapter blocks, Book 17 | 13985–14961 | 97641 | `threat-modeling` … `responsible-ai`, each separated by `\n` |
| 39 | static HTML | 14961–14963 | 45 | <!-- BOOK 17 END --> <!-- BOOK 18 START --> |
| 40 | 7 chapter blocks, Book 18 | 14964–15432 | 44154 | `system-design-method` … `anti-patterns`, each separated by `\n` |
| 41 | static HTML | 15432–15434 | 45 | <!-- BOOK 18 END --> <!-- BOOK 19 START --> |
| 42 | 9 chapter blocks, Book 19 | 15435–16034 | 48748 | `sota-snapshot` … `watchlist`, each separated by `\n` |
| 43 | static HTML | 16034–16036 | 45 | <!-- BOOK 19 END --> <!-- BOOK 20 START --> |
| 44 | 10 chapter blocks, Book 20 | 16037–16774 | 57777 | `lexicon-guide` … `changelog-extend`, each separated by `\n` |
| 45 | static HTML | 16774–16776 | 72 | <!-- BOOK 20 END --> <!-- ===== DATA: structured JSON blocks ===== --> |
| 46 | `data-meta` | 16777–16777 | 227 | JSON data block |
| 47 | whitespace | 16777–16777 | 1 | `\n` |
| 48 | `data-books` | 16778–16778 | 4464 | JSON data block |
| 49 | whitespace | 16778–16778 | 1 | `\n` |
| 50 | `data-glossary` | 16779–16779 | 130249 | JSON data block |
| 51 | whitespace | 16779–16779 | 1 | `\n` |
| 52 | `data-timeline` | 16780–16780 | 36415 | JSON data block |
| 53 | whitespace | 16780–16780 | 1 | `\n` |
| 54 | `data-quizzes` | 16781–16781 | 186817 | JSON data block |
| 55 | whitespace | 16781–16781 | 1 | `\n` |
| 56 | `data-paths` | 16782–16782 | 6512 | JSON data block |
| 57 | whitespace | 16782–16782 | 1 | `\n` |
| 58 | `data-matrices` | 16783–16783 | 25537 | JSON data block |
| 59 | whitespace | 16783–16783 | 1 | `\n` |
| 60 | `data-cheatsheets` | 16784–16784 | 7992 | JSON data block |
| 61 | whitespace | 16784–16784 | 1 | `\n` |
| 62 | `data-presets` | 16785–16785 | 6040 | JSON data block |
| 63 | whitespace | 16785–16785 | 1 | `\n` |
| 64 | `data-wizards` | 16786–16786 | 9164 | JSON data block |
| 65 | whitespace | 16786–16786 | 1 | `\n` |
| 66 | `data-apocrypha` | 16787–16787 | 5334 | JSON data block |
| 67 | whitespace | 16787–16787 | 1 | `\n` |
| 68 | `data-didyouknow` | 16788–16788 | 3801 | JSON data block |
| 69 | whitespace | 16788–16788 | 1 | `\n` |
| 70 | `data-changelog` | 16789–16789 | 9159 | JSON data block |
| 71 | whitespace | 16789–16789 | 1 | `\n` |
| 72 | `data-aliases` | 16790–16790 | 147 | JSON data block |
| 73 | static HTML | 16790–16791 | 29 | <!-- ===== ENGINE ===== --> |
| 74 | `<script src>` | 16792–16792 | 80 | https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js |
| 75 | whitespace | 16792–16792 | 1 | `\n` |
| 76 | `<script src>` | 16793–16793 | 99 | https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js |
| 77 | whitespace | 16793–16793 | 1 | `\n` |
| 78 | engine `<script>` | 16794–19202 | 229236 | one IIFE |
| 79 | static HTML | 19202–19204 | 17 | </body> </html> |
