# Style guide

How Ground Truth Wiki pages are written. It is built from sections 5 (chapter templates and writing style) and 9 (accuracy and honesty) of the editorial masterprompt in `source/editorial-masterprompt.md`, plus the norms measured in the 195 existing chapters. Visuals have their own guide, [docs/VISUAL_LANGUAGE.md](docs/VISUAL_LANGUAGE.md).

## Who we write for

An ambitious engineer who reads for hours and looks things up in seconds. They want to design, build, evaluate, secure and run real AI systems, and to talk shop with researchers and senior engineers without hiding. Every page does three jobs at once: it teaches (readable front to back), it answers (findable in seconds), and it is a pleasure to use.

## Writing style

- **Intuition first, then mechanics, then practice.** Be precise, vivid, warm and a little witty; never fluffy or corporate.
- **Mix short paragraphs with structure.** Use bullets where they help, never as walls of bullets.
- **Define every term on first use** and keep terminology consistent across chapters. Terms in the glossary are linked automatically on their first use; add missing terms to `data/glossary/`.
- **Cross-link generously,** so every chapter is reachable from at least two others. Link with `[text](#chapter-id)`.
- **Explain, don't sell** (rule 6). Name products when they are the clearest example, never to recommend one without its trade-offs.
- **Write for an international reader:** plain English, short sentences, no idioms that only work in one country.

## Chapter anatomy

### Frontmatter

Every file in `content/<NN>-<book>/` starts with YAML frontmatter. [schemas/chapter.schema.json](schemas/chapter.schema.json) describes each field.

```yaml
---
id: agent-loop              # permanent, lowercase, hyphenated; also the file name and the URL
book: 9
order: "9.2"                # quoted; insert between chapters with a third part, such as "9.2.1"
title: The agent loop
level: practitioner         # foundation | practitioner | expert | frontier
stability: evergreen        # evergreen | moving | volatile (sets the review schedule)
reviewed: "2026-11"         # month of the last full review, quoted
status: full                # full | seed
tags: [agents, loop, react]
visuals:                    # every visual in the body, as id:form
  - agent-loop-flow:flowchart
  - agent-loop-stepper:stepper
---
```

The engine shows the number, title, level, reading time, stability, review date and tags in the chapter header itself; you don't write a header.

### Full chapters

A full chapter has these parts, in this order, with these headings. [templates/chapter.md](templates/chapter.md) is the starting point (`npm run new -- chapter <id> --book <n> --title "…" --full`).

| # | Part | How |
|---|---|---|
| 1 | TL;DR | `> [!tldr]` as the very first block: two or three sentences. |
| 2 | `## Why it matters` | Why an engineer needs this: the decision it changes or the failure it prevents. |
| 3 | `## Intuition` | The mental model and an analogy, with the lead visual. |
| 4 | `## How it works` | The mechanics, with a visual for every step that has a shape, and math where it truly helps. |
| 5 | `## In practice` | Python or TypeScript code, configuration, sensible starting values and decision rules. |
| 6 | `## Numbers to know` | Rules of thumb in a `> [!number]` callout, flagged as rules of thumb, with sources. |
| 7 | `## Pitfalls and anti-patterns` | At least one `> [!pitfall]` callout. |
| 8 | `## Talk like an expert` | The vocabulary, how experts frame the topic, the live debates, and one `> [!hottake]` with its strongest counterargument. |
| 9 | `## Check yourself` | A ` ```quiz ` block with the chapter id. The 2 to 4 questions live in `data/quizzes/<id>.json`, each with 4 options and an explanation. |
| 10 | `## Go deeper` | Canonical papers and official docs, following the [source rules](#sources). |
| 11 | `## Related` | Links to related chapters. |

Full chapters have 2 to 4 visuals, with the lead visual in the Intuition section and an interactive or animated visual for every core mechanism.

### Seed chapters

A seed is a planned chapter that is not written in full yet. It holds a TL;DR, four to six key ideas, its planned visuals (with a quick lead diagram where that is cheap), one "Talk like an expert" line and related chapters. The engine shows a "Seed chapter" banner on it that says how to grow it. Start from [templates/seed-chapter.md](templates/seed-chapter.md) (`npm run new -- chapter <id> --book <n> --title "…"`).

### Playbooks and field notes

Books 21 and 22 hold first-hand accounts of real work, one per page:

- A **playbook** (`type: playbook`) shows how a team used AI for one use case in one industry: the problem, why this approach, the approach, the stack, results and how they were measured, what failed, and what they would do differently. Start from [templates/playbook.md](templates/playbook.md) (`npm run new -- playbook <id> --title "…"`).
- A **field note** (`type: field-note`) tells what happened when something was deployed: the context, what happened, the impact and how it was measured, why it happened, what changed afterwards, and the lessons. Start from [templates/field-note.md](templates/field-note.md) (`npm run new -- field-note <id> --title "…"`).

Both carry `industry`, `use_case`, `outcome` and `measured_how` in their frontmatter, and may list `authors` (GitHub handles of the people whose work it describes, if they want to be named), `prerequisites` (chapters to read first) and `replications` (others who tried the same and reported back, with `by`, `date` and `result`). They need no quiz.

Their rules are strict, because they describe real organizations:

- **Real work only.** Never hypothetical, composite or invented cases, companies, numbers or results.
- **Measured means measured.** Results state the metric, the baseline, the sample and the period; say what was not measured.
- **Anonymize** unless the organization agreed to be named (rule 7), and **disclose** ties to vendors (rule 5).
- **Blameless:** describe systems and decisions, not the people who made them.

### Callouts

| Callout | Use it for | In the existing chapters |
|---|---|---|
| `> [!tldr]` | The opening summary | every chapter |
| `> [!number]` | A number to know | every chapter |
| `> [!pitfall] Title` | A mistake and its fix | every chapter |
| `> [!hottake] Title` | A contested opinion, with its strongest counterargument | every chapter |
| `> [!insight] Title` | A non-obvious idea worth stopping for | 3 chapters |
| `> [!try]` | Something to do in five minutes | 1 chapter |
| `> [!expert]`, `> [!history]`, `> [!note]` | Expert framing, history, a side note | supported, unused so far |

### Links, glossary and quizzes

- Chapter links: `[text](#chapter-id)`. Engine pages work the same way: `#lexicon` (Glossary), `#genesis` (Timeline), `#commandments` (Cheat sheets), `#apocrypha` (Debates), `#paths`, `#workshop`, `#matrices`, plus `#term-<id>`, `#tool-<id>`, `#matrix-<id>`, `#cmd-<id>`, `#path-<id>` and `#book-<n>`.
- Glossary: terms and their aliases are linked automatically on first use. Write `[[term]]` or `[[shown text|term-id]]` only to force a link.
- A glossary term (`data/glossary/<id>.json`) has a one-line definition, a one-line "in practice", aliases, the chapters that use it and, if it has one, its acronym. Start from [templates/term.json](templates/term.json).
- Quiz questions check understanding, not recall of a sentence. Each has 4 options, the index of the right one (from 0) and an explanation of why it is right and what the most tempting wrong answer gets wrong. Start from [templates/quiz-question.json](templates/quiz-question.json).

### Code

Code must be correct, minimal and idiomatic for current SDKs. Label pseudocode as pseudocode. Use placeholders for model ids and keys (`"<model-id>"`, `os.environ["API_KEY"]`), never real secrets or invented ids.

## Sources

Rule 1 of the rulebook: every factual claim has a source a reader can check, or reproducible evidence.

- **Papers:** title, first author and year, and only when you are sure of all three.
- **Specifications and docs:** link only to stable official pages you are confident exist. Otherwise give a search hint, such as "the changelog in the modelcontextprotocol/modelcontextprotocol repository".
- **Dated facts** carry their date: "as of November 2026".
- **If you are not sure,** leave it out, or mark it "verify" and say so in the pull request.

The existing chapters name their sources in the text and in "Go deeper", but link none of them. Adding links to those sources is backlog work for the `audit` command. New and changed content must meet the rule in full.

## Accuracy and honesty

These rules (section 9 of the editorial masterprompt) apply to every page (rule 2).

- **Fundamentals** are textbook-accurate, with both the intuition and the formula.
- **Anything that can go stale** goes into volatile chapters or callouts, stamped "as of \<month year\>": models, versions, prices, benchmark scores, leaderboards, framework status and laws. Prefer qualitative statements.
- **Never invent** benchmark numbers, prices, dates, version numbers, paper titles, authors, quotes or URLs. If you are unsure, leave it out or mark it "verify".
- **Name papers** by title, first author and year only when you are sure. Link only to stable official pages you are confident exist; otherwise give a search hint.
- **On contested questions** (multi-agent systems, scaling, safety, regulation, timelines), present the strongest version of each side (rule 4).
- **Code** is correct, minimal and idiomatic for current SDKs. Pseudocode is labeled as pseudocode; model ids and keys are placeholders.
- **Case studies** come only from real, well-known public write-ups, summarized as lessons, with no invented metrics or quotes. Playbooks and field notes from contributors follow rule 7 (anonymized unless the organization agreed).
- **State the knowledge cutoff** in Book 19 and in the footer (`data/meta.json`). Before writing about volatile areas, check them against primary sources, and cite what you used.
- **Legal and regulatory content** is information, not legal advice.

## Stability and freshness

| Stability | Use for | Reviewed after |
|---|---|---|
| `evergreen` | Fundamentals that rarely change: math, architectures, core techniques | 12 months |
| `moving` | Practices and tools that evolve: frameworks, patterns, protocols | 6 months |
| `volatile` | Facts that go stale fast: models, prices, benchmarks, laws | 3 months |

`npm run freshness` lists the chapters due for review. A review checks every dated fact against its source and then sets `reviewed` to the current month.

## Norms in the existing chapters

Measured in the 195 chapters of version 2.0.0, as a guide for length and density, not as hard limits.

| Measure | Median | Range |
|---|---|---|
| Prose length (words, without code and visuals) | 658 | 272 to 1,153 |
| … foundation / practitioner / expert / frontier | 477 / 664 / 696 / 460 | |
| Visuals per chapter | 2 | 2 to 4 (140 chapters have 2, 54 have 3, 1 has 4) |
| Quiz questions per chapter | 3 | 3 to 4 (161 have 3, 34 have 4) |
| Links to other chapters and pages | 8 | 5 to 20 |
| Entries under "Go deeper" | 2 | 1 to 4 |
| TL;DR sentences | 2 | 1 to 7 |
| Code blocks | 0 | 0 to 1 (34 chapters have one) |

Every chapter has all eleven parts of the full template. One chapter, `talking-shop`, titles its practice section "In practice: fifty hard questions".

## Where the editorial rules and the existing chapters differ

These differences were found during the migration. The rules above stay as written; the differences are backlog for the `audit` and `visualize` commands.

1. **Sources are named, not linked.** No chapter links to an external source (rule 1).
2. **Code in "In practice".** The template asks for code; 161 of 195 chapters have none and describe practice in prose and configuration instead.
3. **Interactive visuals.** Every full chapter should have at least one interactive or animated visual; 5 chapters have only static ones (`npm run validate` lists them).
4. **The glossary "in practice" line.** 48 of 483 terms have none (`npm run validate` lists them).
5. **Glossary names.** 14 terms share a name or alias with another term, so only one of them is linked automatically.
6. **TL;DR length.** The template asks for two or three sentences. By a simple sentence count, 8 TL;DRs have one sentence and 9 have more than three.
7. **Callouts.** The editorial list includes "Talk like an expert" and "History" callouts. "Talk like an expert" is a section in every chapter rather than a callout, and no chapter uses a History callout.
8. **Versioning.** The editorial protocol bumps the version with every update. In this repository, maintainers bump it when they tag a release (GOVERNANCE.md), so that contributors do not all edit the same files.

## Appendix: freshness baseline (November 2026)

Section 10 of the editorial masterprompt, reproduced unchanged. These facts were the verified baseline when version 2.0.0 was written. The `refresh` command starts from them, and they are themselves volatile.

### Freshness notes verified in November 2026

These facts were checked against primary sources on GitHub on 3 November 2026, and some are newer than your training. Use them, and mark them "verified Nov 2026".

- MCP: the latest specification is version 2026-07-28 (see the changelog in the modelcontextprotocol/modelcontextprotocol repository, under docs/specification/2026-07-28). Its main changes:
  - MCP is stateless. The initialize handshake and protocol-level sessions are gone; each request carries its protocol version and client capabilities in \_meta, and servers must implement server/discover.
  - Multi round-trip requests replace server-initiated requests. A server returns a result with resultType "input\_required", and the client retries the original request with the answers. Every result now carries resultType.
  - subscriptions/listen replaces the HTTP GET stream and the resource subscribe calls. Ping, logging/setLevel and SSE stream resumability were removed.
  - Tasks moved out of the core into an official extension, polled with tasks/get.
  - Roots, Sampling and Logging are deprecated, and the HTTP+SSE transport is formally deprecated under the new feature-lifecycle policy.
  - List results carry cache hints (ttlMs and cacheScope), and servers should list tools in a deterministic order to help prompt-cache hits.
  - OpenTelemetry trace context travels in \_meta, tool schemas may use any JSON Schema 2020-12 keyword, and authorization adds issuer validation and credentials bound to their authorization server.
- A2A: version 1.0.0 shipped on 12 March 2026 with breaking spec changes, and 1.0.1 followed on 26 May 2026 (a2aproject/A2A changelog).
- Claude Code: at version 2.1.317 in early November 2026. Recent additions include agent teams (a research preview of multi-agent collaboration), an auto permission mode backed by a safety check, recurring and scheduled tasks (/loop and /schedule), plugins and marketplaces, OpenTelemetry metrics, and MCP tool search, which defers MCP tool definitions once they exceed 10% of the context window (anthropics/claude-code changelog).
- Agent Skills: an open format of folders that each hold a SKILL.md file (agentskills/agentskills). A cross-agent skills CLI supports more than 75 agents (vercel-labs/skills), other harnesses ship their own plugin manifests (cursor/plugins), and dedicated skill security scanners exist (NVIDIA/SkillSpector).
- Sandboxing: Anthropic's sandbox runtime (anthropics/sandbox-runtime) enforces filesystem and network limits at the OS level, without a container, for agents, local MCP servers and shell commands.
- Trend: GitHub's monthly trending list is led by agent skills, plugins, memory and context-compression tools for coding agents.

Everything else that moves fast still gets your own freshness pass if you have web search.
