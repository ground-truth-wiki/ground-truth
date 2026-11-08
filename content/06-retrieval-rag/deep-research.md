---
id: deep-research
book: 6
order: "6.16"
title: Deep research systems
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [deep-research, research-agents, synthesis]
visuals:
  - deep-research-loop:stepper
  - research-trace:trace
---
> [!tldr]
> Deep research systems plan, search, read, reflect and write over many sources, often for several minutes, and produce long cited reports. They combine agentic retrieval, parallel subagents, source evaluation and careful synthesis, and they are judged on citation accuracy and coverage of disagreement, not on length.

## Why it matters
Research is where agents first delivered value to non-engineers: a report in minutes that would take an analyst a day. It is also where their failures are most persuasive: a confident, well-formatted report built on two weak sources, or one that averages away a real disagreement. Building or buying one well requires understanding the loop and its checks.

## Intuition
A research team: a lead splits the question, researchers read in parallel and bring back notes with sources, the lead notices gaps and sends them out again, then writes the report from the notes and has an editor check every footnote.

```viz
{"id":"deep-research-loop","component":"stepper","title":"Plan, fan out, read, reflect, repeat, then write from evidence and check every citation","caption":"Step through a research run. The reflection step is what separates deep research from one-shot RAG: it notices what is still missing.","alt":"Stepper through a deep research loop: plan, parallel search, evidence extraction, reflection, a second round, outline, writing and citation verification.","data":"illustrative","diagram":{"w":600,"h":150,"nodes":[
{"id":"plan","label":"Plan","sub":"sub-questions","role":"agent","x":0,"y":0,"w":130,"h":56},
{"id":"search","label":"Search","sub":"parallel subagents","role":"tool","x":155,"y":0,"w":130,"h":56,"link":"#multi-agent"},
{"id":"read","label":"Read and extract","sub":"evidence notes","role":"data","x":310,"y":0,"w":130,"h":56},
{"id":"reflect","label":"Reflect","sub":"gaps, conflicts","role":"model","x":465,"y":0,"w":135,"h":56},
{"id":"write","label":"Write","sub":"outline, sections","role":"model","x":310,"y":94,"w":130,"h":56},
{"id":"verify","label":"Verify","sub":"every citation","role":"agent","x":465,"y":94,"w":135,"h":56,"link":"#grounding-citations"}],
"edges":[{"from":"plan","to":"search"},{"from":"search","to":"read"},{"from":"read","to":"reflect"},{"from":"reflect","to":"search","curve":-40,"label":"gaps"},{"from":"reflect","to":"write","label":"enough"},{"from":"write","to":"verify"}]},
"frames":[
{"label":"Plan","highlight":["plan"],"caption":"The question “How are EU and US rules on general-purpose AI models diverging?” becomes four sub-questions with a source plan for each."},
{"label":"Fan out","highlight":["search"],"caption":"Four subagents search in parallel, each with a brief, a budget and instructions to prefer primary sources."},
{"label":"Extract","highlight":["read"],"caption":"Each subagent reads pages and returns evidence notes: claim, quote, source URL and date. Raw pages stay in their contexts."},
{"label":"Reflect","highlight":["reflect"],"caption":"The lead compares notes: two sources disagree on a date, and nothing covers enforcement. It plans a second, narrower round."},
{"label":"Round two","highlight":["search","read"],"caption":"Targeted searches resolve the date from the official text and find enforcement guidance."},
{"label":"Write","highlight":["write"],"caption":"The lead outlines the report, then writes each section only from evidence notes, stating disagreements rather than averaging them."},
{"label":"Verify","highlight":["verify"],"caption":"A checker confirms that every citation’s quote exists at its source; two unsupported sentences are rewritten before delivery."}]}
```

## How it works
**Planning and decomposition.** Turn the question into sub-questions and a source plan. Good plans name what kinds of sources would settle each sub-question: official documents, datasets, papers, reputable reporting.

**Parallel search and reading.** Subagents with clean contexts search and read independently and return compact evidence notes, which keeps the lead’s context small. See [multi-agent systems](#multi-agent).

**Evidence notes, not pages.** Each note records the claim, an exact quote, the source, its date and a reliability judgment. Writing from notes makes citations checkable and keeps the final context manageable. See [context engineering](#context-engineering).

**Reflection.** After each round, check coverage against the plan, look for conflicting claims, and decide whether to search again or stop. Budgets cap the rounds.

**Source quality.** Prefer primary sources; track publication dates; treat search results and pages as untrusted input that may contain injected instructions. See [prompt injection](#prompt-injection).

**Long report generation.** Outline first, write section by section from notes, and verify every citation at the end. State disagreements and uncertainty explicitly.

```viz
{"id":"research-trace","component":"trace","title":"Most of a research run is parallel reading, and the second round is short because it is targeted","caption":"Illustrative trace of a six-minute run. Click a span for details. Subagents overlap; writing and verification come last.","alt":"Span waterfall of a deep research run with planning, four parallel subagents, reflection, a second round, writing and citation verification.","data":"illustrative","spans":[
{"name":"research run","start":0,"dur":360000,"depth":0,"kind":"agent"},
{"name":"plan","start":0,"dur":15000,"depth":1,"kind":"model","note":"Four sub-questions."},
{"name":"subagent: EU rules","start":15000,"dur":110000,"depth":1,"kind":"agent","note":"9 searches, 14 pages, 11 notes."},
{"name":"subagent: US rules","start":15000,"dur":95000,"depth":1,"kind":"agent"},
{"name":"subagent: timelines","start":15000,"dur":80000,"depth":1,"kind":"agent"},
{"name":"subagent: enforcement","start":15000,"dur":120000,"depth":1,"kind":"agent","note":"Found little; flagged as a gap."},
{"name":"reflect","start":135000,"dur":12000,"depth":1,"kind":"model","note":"One conflict, one gap."},
{"name":"round two: targeted","start":147000,"dur":60000,"depth":1,"kind":"agent"},
{"name":"outline and write","start":207000,"dur":120000,"depth":1,"kind":"model"},
{"name":"verify citations","start":327000,"dur":33000,"depth":1,"kind":"tool","note":"2 sentences rewritten."}]}
```

## In practice
Design choices that matter most:
- **Budgets:** searches per subagent, rounds of reflection, total tokens and wall-clock time.
- **Briefs:** objective, scope, source preferences and output format for each subagent.
- **Evidence schema:** claim, quote, URL, date, reliability. Validate it.
- **Verification:** quote checks on every citation before delivery.
- **Evaluation:** a rubric covering citation accuracy, coverage of the sub-questions, treatment of disagreement and source quality, scored by calibrated judges plus expert spot checks. See [evaluating agents](#evaluating-agents).

## Numbers to know
> [!number]
> Rules of thumb. Research runs commonly take minutes and read dozens of pages; multi-agent research used about 15 times the tokens of a chat interaction in Anthropic’s 2025 write-up. Budget in dollars per report as well as tokens.

## Pitfalls and anti-patterns
> [!pitfall] Judging reports by length and polish
> Long, fluent reports can rest on a few weak sources. Grade citation accuracy and source quality first.

- **Averaging disagreement away.** Report conflicts and their sources.
- **Secondary sources only.** Summaries of summaries drift from the facts.
- **No date tracking.** Old sources describe a world that has changed.
- **Unchecked citations.** The most persuasive failure mode of all.

## Talk like an expert
The vocabulary: **deep research**, **decomposition**, **fan-out**, **evidence notes**, **reflection**, **source quality**, **citation verification**, **coverage**. Experts evaluate research agents on citation accuracy, coverage of disagreement and source quality, and they read the sources behind the most surprising claims. The live debate is how far these systems can go toward original research rather than synthesis of what is already published.

> [!hottake] The value of a research agent is in the evidence notes, not the report.
> **The counterargument:** most users want a readable answer, not a pile of notes; the report is the product, and the notes are the audit trail that makes it trustworthy.

## Check yourself
```quiz
deep-research
```

## Go deeper
- Anthropic engineering, “How we built our multi-agent research system” (June 2025).
- The [advanced RAG](#advanced-rag) and [grounding](#grounding-citations) chapters.

## Related
- [Research and analyst agents](#research-analyst-agents)
- [Multi-agent systems](#multi-agent)
- [Advanced RAG architectures](#advanced-rag)
- [Grounding and citations](#grounding-citations)
- [Evaluating agents](#evaluating-agents)
