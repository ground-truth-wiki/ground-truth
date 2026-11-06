---
id: framework-selection
book: 13
order: "13.6"
title: Selection guide and matrix
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [frameworks, selection, matrix]
visuals:
  - framework-wizard:tree
  - framework-score:calculator
---
> [!tldr]
> Choose frameworks by the shape of your problem, your language and team, how much you need to see and control, and your exit cost, then prove the choice with a one-day prototype in two finalists. Score candidates against weighted criteria so the decision is explicit and revisitable.

## Why it matters
Framework choices are hard to reverse and easy to make for the wrong reasons: popularity, a demo, a tutorial. A short, structured selection process prevents months of fighting abstractions that do not fit, and leaves a record of why the choice was made when it needs revisiting.

## Intuition
Choosing a framework is hiring a contractor. You check references, give each finalist the same small job, and compare the results against what you actually care about, written down beforehand.

```viz
{"id":"framework-wizard","component":"tree","title":"Four questions narrow the field to two finalists","caption":"Expand each question. The answer at each leaf is a category to shortlist from, not a single product.","alt":"Decision tree for selecting an AI framework by problem shape, language, state needs and team.","data":"illustrative","open":1,"root":{"label":"What does your application need?","children":[
{"label":"One agent working with files, code or tools","children":[{"label":"A provider agent SDK or your own loop","link":"#provider-agent-sdks"}]},
{"label":"Branching workflows with durable state and approvals","children":[{"label":"A graph or workflow framework with checkpointing","link":"#orchestration-frameworks"}]},
{"label":"Retrieval-heavy applications","children":[{"label":"A RAG-focused framework, or plain code over your search stack","link":"#rag-fundamentals"}]},
{"label":"TypeScript web apps with streaming UI","children":[{"label":"A TypeScript AI SDK or framework","link":"#streaming"}]},
{"label":"Automations owned by business teams","children":[{"label":"A low-code builder with governance","link":"#low-code-builders"}]}]}}
```

## How it works
**Criteria that matter.**
- **Fit:** does its model of agents, workflows and state match your problem?
- **Transparency:** can you see every prompt and model call in traces, and override them?
- **Control:** can you drop to raw API calls where needed?
- **Ecosystem:** integrations, observability support, documentation, community.
- **Maturity:** release cadence, breaking changes, maintainers, governance.
- **Exit cost:** how much of your code would change if you left?

**The prototype test.** Build the same small, realistic task (with one tool, one retrieval step and one failure case) in two finalists with tracing on. Compare code size, what each sends to the model, how failures surface and how easy changes are.

**Weighted scoring.** Score each criterion from 1 to 5, weight by importance, and compare totals:

```viz
{"id":"framework-score","component":"calculator","title":"A weighted score turns a debate into a decision you can revisit","caption":"Enter scores from 1 to 5 for two candidates and weights that sum to anything you like. Defaults are an illustrative comparison.","alt":"Calculator for weighted framework scores of two candidates across fit, transparency, ecosystem and exit cost.","data":"formula","outputs":[{"id":"total_a","label":"Candidate A weighted score","expr":"(a_fit * w_fit + a_transp * w_transp + a_eco * w_eco + a_exit * w_exit) / (w_fit + w_transp + w_eco + w_exit)","unit":"count"},{"id":"total_b","label":"Candidate B weighted score","expr":"(b_fit * w_fit + b_transp * w_transp + b_eco * w_eco + b_exit * w_exit) / (w_fit + w_transp + w_eco + w_exit)","unit":"count"},{"id":"diff","label":"A minus B","expr":"total_a - total_b","unit":"count","main":true}],"inputs":{"w_fit":4,"w_transp":3,"w_eco":2,"w_exit":1,"a_fit":4,"a_transp":5,"a_eco":3,"a_exit":4,"b_fit":5,"b_transp":2,"b_eco":5,"b_exit":2},"input_meta":{"w_fit":{"label":"Weight: fit"},"w_transp":{"label":"Weight: transparency"},"w_eco":{"label":"Weight: ecosystem"},"w_exit":{"label":"Weight: exit cost"},"a_fit":{"label":"A: fit (1 to 5)"},"a_transp":{"label":"A: transparency"},"a_eco":{"label":"A: ecosystem"},"a_exit":{"label":"A: exit cost (5 = easy exit)"},"b_fit":{"label":"B: fit"},"b_transp":{"label":"B: transparency"},"b_eco":{"label":"B: ecosystem"},"b_exit":{"label":"B: exit cost"}},"assumptions":["Scores come from a prototype, not from marketing pages.","Weights reflect your priorities; write down why."],"tests":[{"inputs":{},"expect":{"total_a":4.1,"total_b":3.8,"diff":0.3},"tol":0.0001},{"inputs":{"w_transp":1},"expect":{"total_a":3.875,"total_b":4.25},"tol":0.0001}]}
```

## In practice
1. Write the criteria and weights before looking at products.
2. Shortlist two candidates from the decision tree.
3. Prototype the same task in both in a day, with tracing.
4. Score, decide, and record the reasoning in a short decision document.
5. Revisit yearly or when a criterion changes.

## Numbers to know
> [!number]
> Rules of thumb. Two finalists and one day of prototyping are usually enough. If two candidates score within a few tenths of each other, choose the one with the lower exit cost.

## Pitfalls and anti-patterns
> [!pitfall] Choosing by demo
> Demos show the happy path. Your prototype should include a tool failure and a change request.

- **No written criteria.** The loudest opinion wins.
- **Ignoring exit cost.** Frameworks change faster than products.
- **Never revisiting.** A good choice in 2025 may be a poor one in 2027.

## Talk like an expert
The vocabulary: **selection criteria**, **weighted scoring**, **prototype test**, **exit cost**, **decision record**, **abstraction fit**. Experts can explain why they chose a framework in terms of their problem’s shape. The live debate is whether to standardize on one framework across a company or let teams choose per problem.

> [!hottake] Transparency should outweigh features in any framework decision.
> **The counterargument:** a transparent framework without the integrations, durability or community you need will cost more engineering time than a slightly opaque one that solves your problem today.

## Check yourself
```quiz
framework-selection
```

## Go deeper
- The [landscape map](#framework-landscape) and [orchestration frameworks](#orchestration-frameworks) chapters.

## Related
- [The landscape map](#framework-landscape)
- [Orchestration frameworks](#orchestration-frameworks)
- [Framework anti-patterns](#framework-anti-patterns)
- [Decision guides](#decision-guides)
- [Provider and agent SDKs](#provider-agent-sdks)
