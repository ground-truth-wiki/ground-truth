---
id: interview-prep
book: 20
order: "20.8"
title: Interview prep
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [interviews, career, system-design]
visuals:
  - interview-tree:tree
  - design-answer:stepper
---
> [!tldr]
> AI engineering interviews test five things: fundamentals of how models work, system design for AI products, evaluation thinking, coding with models and tools, and judgment about cost, safety and trade-offs. Prepare with projects you can defend, the fifty hard questions, and a repeatable system design method.

## Why it matters
Interviews for AI roles mix ML, software engineering and product judgment. Candidates who prepare for all five areas, and can show working projects with evals, stand out.

## Intuition
An AI engineering interview is a flight simulator check: they want to see you handle routine flight and an engine failure, and explain your decisions as you go.

```viz
{"id":"interview-tree","component":"tree","title":"Five interview areas and how to prepare for each","caption":"Expand an area for what is tested and where to practice.","alt":"Tree of AI engineering interview areas: fundamentals, system design, evaluation, coding and judgment.","data":"illustrative","open":1,"root":{"label":"Interview areas","children":[
{"label":"Fundamentals","children":[{"label":"Attention, KV cache, tokenization, sampling, training stages","link":"#attention"}]},
{"label":"System design","children":[{"label":"Requirements, eval plan, estimates, architecture, risks","link":"#system-design-method"}]},
{"label":"Evaluation","children":[{"label":"Error analysis, judges, statistics, agent evals","link":"#error-analysis"}]},
{"label":"Coding","children":[{"label":"An agent loop, a RAG pipeline, structured outputs, tests","link":"#agent-loop"}]},
{"label":"Judgment","children":[{"label":"Cost, latency, safety and when not to use AI","link":"#talking-shop"}]}]}}
```

## How it works
**System design answers** follow the method: clarify, define quality and evals, estimate, choose the simplest architecture, design data and boundaries, plan operations.

```viz
{"id":"design-answer","component":"stepper","title":"A 45-minute AI system design answer, minute by minute","caption":"A suggested time budget for “design a support assistant”.","alt":"Stepper of a system design interview answer with time budgets for each step.","data":"illustrative","frames":[
{"label":"0–8 min","caption":"Clarify users, volume, channels, languages and the cost of wrong answers."},
{"label":"8–15 min","caption":"Define success and the eval: real tickets, resolution quality, faithfulness, escalation."},
{"label":"15–20 min","caption":"Estimate traffic, tokens and monthly cost; note peak load."},
{"label":"20–32 min","caption":"Draw the architecture: retrieval with permissions, agent with limited tools, escalation, gateway."},
{"label":"32–40 min","caption":"Cover safety, observability, rollout and incident response."},
{"label":"40–45 min","caption":"State trade-offs and what evidence would change your design."}]}
```

**Projects.** Bring two or three projects with evals, traces and cost numbers; be ready to explain failures and fixes. See the [project ladder](#project-ladder).

**Coding.** Practice writing an agent loop, a retrieval pipeline and an eval harness from scratch, with tests.

## In practice
- Rehearse the fifty hard questions in [Talking shop](#talking-shop) aloud.
- Do two mock system design interviews with a timer.
- Prepare one story each about a failure you diagnosed, a trade-off you made and a decision you reversed.

## Numbers to know
> [!number]
> Rule of thumb: spend about a third of a design interview on requirements and evaluation before drawing components.

## Pitfalls and anti-patterns
> [!pitfall] Jumping to “multi-agent RAG” in the first minute
> Interviewers look for clarification, evals and simplicity first.

## Talk like an expert
Experts in interviews think aloud, state assumptions, estimate costs and name failure modes. The debate in hiring is how to assess skills when candidates use AI tools themselves.

> [!hottake] A project with a real eval suite beats any certificate.
> **The counterargument:** certificates and courses signal structured knowledge that projects alone may not show, especially early in a career.

## Check yourself
```quiz
interview-prep
```

## Go deeper
- The [system design method](#system-design-method) and [back-of-the-envelope estimation](#back-of-envelope).

## Related
- [Talking shop](#talking-shop)
- [The AI system design method](#system-design-method)
- [Learning paths and the project ladder](#project-ladder)
- [Build your own harness](#build-your-own-harness)
- [What an AI engineer is](#ai-engineer-role)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Worked AI system design interview answers](#system-design-interview-answers)
