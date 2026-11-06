---
id: project-ladder
book: 20
order: "20.9"
title: Learning paths and the project ladder
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [projects, portfolio, paths]
visuals:
  - portfolio-tree:tree
  - toy-vs-portfolio:compare
---
> [!tldr]
> Eight learning paths and a ladder of portfolio projects, from chat with a PDF to a multi-agent system you can defend. Each rung builds on the last and links to the chapters it needs; each project should ship with an eval, traces and a cost estimate.

## Why it matters
Reading builds understanding; projects build skill and proof. A ladder of increasingly demanding projects turns Ground Truth into a curriculum and gives you work to show.

## Intuition
The ladder is a climbing gym’s graded routes: start on the easy wall, and each new grade uses the moves you learned on the last.

## Learning paths
```widget
paths
```

## The project ladder
```widget
ladder
```

## How it works
```viz
{"id":"portfolio-tree","component":"tree","title":"What every portfolio project should show","caption":"Expand each element. Reviewers look for these more than for features.","alt":"Tree of elements of a strong portfolio project: problem, eval, traces, cost, failures and decisions.","data":"illustrative","open":1,"root":{"label":"A strong portfolio project shows","children":[
{"label":"A real problem","children":[{"label":"Who it is for and what good looks like"}]},
{"label":"An eval","children":[{"label":"Cases, graders and results with intervals","link":"#why-evals"}]},
{"label":"Traces","children":[{"label":"Examples of successes and failures","link":"#observability-tracing"}]},
{"label":"Cost and latency","children":[{"label":"Per request and per month at stated volume","link":"#back-of-envelope"}]},
{"label":"Failures and fixes","children":[{"label":"What broke and how you changed it","link":"#error-analysis"}]},
{"label":"Decisions","children":[{"label":"Alternatives considered and why you chose","link":"#decision-guides"}]}]}}
```

```viz
{"id":"toy-vs-portfolio","component":"compare","title":"A toy demo and a portfolio project built on the same idea","caption":"Hover the marks.","alt":"Comparison of a toy chat-with-PDF demo and a portfolio-quality version of the same project.","data":"illustrative","mono":false,"a":{"title":"Toy demo","text":"Upload a PDF and chat with it. Works on the sample file.","mono":false},"b":{"title":"Portfolio project","text":"Chat with 200 policy PDFs. Hybrid retrieval with reranking; 120-question eval with recall@5 of 0.91 and faithfulness of 0.95; traces for ten failures and their fixes; $0.004 per answer; a short write-up of trade-offs.","mono":false},"links":[{"a":"Works on the sample file.","b":"120-question eval with recall@5 of 0.91","note":"Evidence instead of a demo."},{"b":"traces for ten failures and their fixes","note":"Shows you can debug."},{"b":"$0.004 per answer","note":"Shows you think about cost."}]}
```

**Paths and rungs.** Each path lists chapters in order; each rung lists the chapters and skills it exercises. Completing them earns progress and badges on your stats page.

## In practice
- Pick a path; build the rung that matches your level; write it up.
- Add evals and cost numbers before adding features.

## Numbers to know
> [!number]
> Fact: eight learning paths and a ladder of projects from beginner to advanced.

## Pitfalls and anti-patterns
> [!pitfall] Climbing rungs without evals
> Features without measurement prove little.

## Talk like an expert
Experts present projects by their evidence: evals, failures, costs and decisions. The debate is how much AI-assisted coding changes what a portfolio demonstrates.

> [!hottake] Three rungs done well beat ten done quickly.
> **The counterargument:** breadth across many small projects shows range and speed, which some roles value more than depth.

## Check yourself
```quiz
project-ladder
```

## Go deeper
- [Build your own harness](#build-your-own-harness) for a capstone.

## Related
- [How to use Ground Truth](#how-to-use)
- [Interview prep](#interview-prep)
- [Build your own harness](#build-your-own-harness)
- [Changelog and how to extend](#changelog-extend)
- [What an AI engineer is](#ai-engineer-role)
