---
id: public-writeups
book: 18
order: "18.5"
title: Lessons from public engineering write-ups
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [case-studies, lessons]
visuals:
  - lessons-matrix:matrix
  - lessons-tree:tree
---
> [!tldr]
> Teams that build AI systems at scale have published unusually candid lessons: start simple, build evals from real failures, engineer context carefully, be wary of multi-agent designs, and treat prompt injection as a structural problem. Read them as field reports, dated and specific to their authors’ products.

## Why it matters
Public write-ups compress years of trial and error into a few pages. They also disagree with each other in instructive ways, for example on multi-agent systems, which shows where the field is still learning.

## Intuition
These write-ups are expedition logs. Each team mapped part of the territory; reading several shows which paths are well trodden and which are still disputed.

```viz
{"id":"lessons-matrix","component":"matrix","matrix":"public-lessons","title":"Influential public write-ups and the lesson each is known for","caption":"Filter by topic. Dates are publication years; read the originals for context and caveats.","alt":"Table of influential public engineering write-ups on AI systems with source, year, topic and key lesson.","data":"illustrative"}
```

## How it works
**Recurring lessons.**

```viz
{"id":"lessons-tree","component":"tree","title":"Five lessons that recur across write-ups, and one open disagreement","caption":"Expand a lesson for where it appears and where this Bible covers it.","alt":"Tree of recurring lessons from public AI engineering write-ups.","data":"illustrative","open":1,"root":{"label":"What practitioners keep finding","children":[
{"label":"Start simple","children":[{"label":"Workflows and single agents before frameworks and multi-agent systems","link":"#workflow-patterns"}]},
{"label":"Evals from real failures","children":[{"label":"Read traces, name failure modes, build cases","link":"#error-analysis"}]},
{"label":"Context is the product","children":[{"label":"What enters the window decides quality and cost","link":"#context-engineering"}]},
{"label":"Tools are interfaces for a model","children":[{"label":"Descriptions, outputs and errors written for the model","link":"#agent-tools"}]},
{"label":"Injection is structural","children":[{"label":"Limit what a manipulated model can reach","link":"#secure-agent-design"}]},
{"label":"Open disagreement: multi-agent","children":[{"label":"Parallel research agents help; shared-context coding agents often do better as one","link":"#multi-agent"}]}]}}
```

**How to read them.** Note the author’s product, scale and date; separate measured results from opinions; look for the failure that motivated each lesson; and check whether newer models changed the conclusion.

## In practice
- Keep a team reading list of the most relevant write-ups with one-line takeaways.
- When a write-up contradicts your experience, test it on your evals rather than adopting it wholesale.

## Numbers to know
> [!number]
> Rule of thumb: lessons about model limitations age fastest; lessons about evals, context and security age slowest.

## Pitfalls and anti-patterns
> [!pitfall] Treating a write-up as a universal rule
> Each describes one team’s product and models at one time. Transfer the reasoning, not the conclusion.

## Talk like an expert
Experts cite write-ups by author and year and know where they disagree. The live debate captured by these sources is how much structure agents need as models improve.

> [!hottake] The best AI engineering knowledge is in blog posts, not papers.
> **The counterargument:** blog posts are rarely controlled or reproducible; papers and benchmarks, for all their flaws, let others check the claims.

## Check yourself
```quiz
public-writeups
```

## Go deeper
- Each source in the matrix, read in full.

## Related
- [Reference architectures](#reference-architectures)
- [The anti-patterns hall of shame](#anti-patterns)
- [Multi-agent systems](#multi-agent)
- [Error analysis first](#error-analysis)
- [The Canon](#the-canon)
