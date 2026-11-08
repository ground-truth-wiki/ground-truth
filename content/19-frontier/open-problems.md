---
id: open-problems
book: 19
order: "19.8"
title: Open problems and big debates
level: frontier
stability: moving
reviewed: "2026-11"
status: full
tags: [debates, scaling, timelines]
visuals:
  - debate-maps:graph
  - problems-tree:tree
---
> [!tldr]
> The big open questions in AI engineering and research: reliable long-horizon autonomy, hallucination and verification, prompt injection, continual learning, interpretability, aligning more capable systems, evaluation that keeps up, data and compute limits, and economic and social effects. Each connects to chapters here; none has a settled answer.

## Why it matters
Knowing the open problems keeps designs honest about what cannot yet be guaranteed, and helps engineers recognize which limitations are temporary and which are deep.

## Intuition
A map with blank regions is more useful than one that pretends to be complete; these are the blank regions.

```viz
{"id":"debate-maps","component":"graph","title":"Open problems are connected: progress on one moves several others","caption":"Illustrative map of how open problems relate. Click a node for its chapter.","alt":"Graph connecting open problems: verification, reliability, autonomy, injection, interpretability, alignment and evaluation.","data":"illustrative","per_row":3,"node_w":180,"nodes":[{"id":"verify","label":"Verification","link":"#grounding-citations"},{"id":"interp","label":"Interpretability","link":"#mech-interp"},{"id":"data","label":"Data limits","link":"#synthetic-data"},{"id":"reliab","label":"Reliability","link":"#agent-failure-modes"},{"id":"inject","label":"Prompt injection","link":"#prompt-injection"},{"id":"continual","label":"Continual learning","link":"#agent-memory"},{"id":"autonomy","label":"Long-horizon autonomy","link":"#long-horizon-autonomy"},{"id":"align","label":"Alignment","link":"#alignment-concepts"},{"id":"evals","label":"Evaluation","link":"#why-evals"}],"edges":[["verify","reliab"],["interp","align"],["data","continual"],["reliab","autonomy"],["inject","autonomy"],["continual","autonomy"],["align","evals"],["autonomy","evals"]]}
```

## How it works
```viz
{"id":"problems-tree","component":"tree","title":"Ten open problems, each with the core difficulty","caption":"Expand a problem.","alt":"Tree of ten open problems in AI with their core difficulties.","data":"illustrative","open":1,"root":{"label":"Open problems","children":[
{"label":"Hallucination and verification","children":[{"label":"Models state falsehoods fluently; checking open-ended outputs is hard"}]},
{"label":"Long-horizon reliability","children":[{"label":"Errors compound over many steps","link":"#long-horizon-autonomy"}]},
{"label":"Prompt injection","children":[{"label":"Models cannot reliably separate instructions from data","link":"#prompt-injection"}]},
{"label":"Continual learning","children":[{"label":"Learning from experience after deployment without forgetting or drifting"}]},
{"label":"Interpretability at scale","children":[{"label":"Explaining frontier models’ internals affordably","link":"#mech-interp"}]},
{"label":"Alignment of more capable systems","children":[{"label":"Supervising systems that may exceed their overseers","link":"#alignment-concepts"}]},
{"label":"Evaluation","children":[{"label":"Benchmarks saturate; real tasks are hard to score","link":"#benchmark-literacy"}]},
{"label":"Data and compute limits","children":[{"label":"High-quality data and energy are finite","link":"#scaling-laws"}]},
{"label":"Efficiency","children":[{"label":"Bringing frontier capability to cheap hardware","link":"#new-architectures"}]},
{"label":"Economic and social effects","children":[{"label":"Work, education, information quality and concentration of power","link":"#governance-regulation"}]}]}}
```

**Big debates.** How far current methods scale; whether reasoning models truly reason or pattern-match; open versus closed release; how fast automation reaches broad work; how to govern frontier systems. The [Debates](#apocrypha) page collects hot takes with counterarguments.

## In practice
- Design around current limits: verification, approvals and evals for what models cannot guarantee.
- Revisit assumptions as research moves; this chapter is updated with each version.

## Numbers to know
> [!number]
> Rule of thumb: assume any capability claim about open problems needs independent evaluation before it changes your design.

## Pitfalls and anti-patterns
> [!pitfall] Treating an open problem as solved by the latest demo
> Demos show possibility; reliability needs evaluation at scale.

## Talk like an expert
Experts can state which problems block their product and which research would unblock it. The live debate is which of these problems yield to scale and which need new ideas.

> [!hottake] Prompt injection is the most underrated open problem for the agent economy.
> **The counterargument:** architectural patterns and least privilege can contain injection well enough for many uses, even without a model-level solution.

## Check yourself
```quiz
open-problems
```

## Go deeper
- Research agendas from frontier labs and academic groups, and the International AI Safety Report (2025; second edition February 2026).

## Related
- [Long-horizon autonomy](#long-horizon-autonomy)
- [Alignment concepts](#alignment-concepts)
- [Prompt injection](#prompt-injection)
- [Mechanistic interpretability](#mech-interp)
- [Watchlist](#watchlist)
