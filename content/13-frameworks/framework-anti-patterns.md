---
id: framework-anti-patterns
book: 13
order: "13.7"
title: Framework anti-patterns
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [anti-patterns, abstraction]
visuals:
  - abstraction-compare:compare
  - anti-pattern-tree:tree
---
> [!tldr]
> Framework trouble follows recognizable patterns: abstraction before need, hidden prompts, stacked layers, multi-agent theater, framework-specific state, upgrade churn and lock-in. Each has a symptom you can spot in traces and a cure that usually involves less framework, not more.

## Why it matters
Teams adopt frameworks to move faster and then spend months debugging behavior they cannot see. Recognizing anti-patterns early lets you keep the benefits of a framework while avoiding its traps, or decide to remove it before it spreads.

## Intuition
A framework is scaffolding. It helps you build quickly; it also hides the walls. Problems start when nobody remembers what is scaffolding and what is the building.

```viz
{"id":"abstraction-compare","component":"compare","title":"Three lines of framework code can hide a prompt you never wrote","caption":"Illustrative. The same call through a high-level abstraction and as the model actually sees it in a trace. Hover the marks.","alt":"Comparison of a short framework call and the full prompt it sends to the model.","data":"illustrative","a":{"title":"What the code says","text":"agent = Agent(role='analyst',\n              tools=[search, sql])\nresult = agent.run('Why did churn rise?')"},"b":{"title":"What the model receives","text":"system: You are a world-class analyst.\n  Think step by step. You have access to\n  the following tools... Always respond\n  in the format:\n  Thought: ... Action: ... Observation: ...\n  Begin!\n[1,800 tokens of framework instructions]\nuser: Why did churn rise?"},"links":[{"a":"role='analyst'","b":"You are a world-class analyst.","note":"A one-word parameter becomes a persona prompt you did not write."},{"a":"agent.run(","b":"Thought: ... Action: ... Observation: ...","note":"The framework imposes its own reasoning format, which may not suit your model."},{"b":"[1,800 tokens of framework instructions]","note":"Hidden tokens on every call cost money and shape behavior."}]}
```

## How it works
```viz
{"id":"anti-pattern-tree","component":"tree","title":"Seven framework anti-patterns, each with its symptom and cure","caption":"Expand an anti-pattern. Most cures remove abstraction rather than add it.","alt":"Tree of framework anti-patterns with symptoms and cures.","data":"illustrative","open":1,"root":{"label":"Framework anti-patterns","children":[
{"label":"Abstraction before need","children":[{"label":"Symptom: a framework for three model calls. Cure: plain code until a specific pain appears.","link":"#agent-loop"}]},
{"label":"Hidden prompts","children":[{"label":"Symptom: quality issues nobody can explain. Cure: trace and override every prompt.","link":"#observability-tracing"}]},
{"label":"Stacked layers","children":[{"label":"Symptom: a builder on a framework on an SDK. Cure: one layer per concern.","link":"#framework-landscape"}]},
{"label":"Multi-agent theater","children":[{"label":"Symptom: five agents chatting to do one task. Cure: one agent or a workflow.","link":"#multi-agent"}]},
{"label":"Framework-owned state","children":[{"label":"Symptom: business data only in framework stores. Cure: your own databases; the framework holds run state."}]},
{"label":"Upgrade churn","children":[{"label":"Symptom: every release breaks something. Cure: pin versions, upgrade with evals."}]},
{"label":"Lock-in by accident","children":[{"label":"Symptom: prompts and tools written in framework-specific formats. Cure: plain templates, MCP and portable evals.","link":"#prompt-config-management"}]}]}}
```

**Why they happen.** Frameworks optimize for the first demo: short code, impressive capabilities. Production needs the opposite: visible behavior, predictable costs and control at every step.

**Diagnosis.** Read the traces of a representative request and count the model calls, the prompt tokens you did not write, and the layers involved. Large numbers on any of the three are a warning.

## In practice
- Keep prompts as your own versioned templates, passed into the framework.
- Turn on tracing that shows raw model inputs and outputs.
- Wrap framework calls behind your own interfaces, so replacing them touches one module.
- Delete abstractions that no longer earn their place.

## Numbers to know
> [!number]
> Rule of thumb: if more than a small share of the prompt tokens on a call were written by the framework rather than by you, find out what they do and whether you need them.

## Pitfalls and anti-patterns
> [!pitfall] Blaming the model for framework behavior
> Many “model problems” are framework prompts or retries you never saw. Read the raw trace first.

- **Rewriting everything when leaving a framework.** Isolation from the start makes exits cheap.
- **Copying tutorial architectures into production.** Tutorials optimize for brevity.

## Talk like an expert
The vocabulary: **leaky abstraction**, **hidden prompt**, **framework tax**, **escape hatch**, **lock-in**, **thin wrapper**. Experts ask “what does it send on each call?” before “what can it do?”. The live debate is whether frameworks will become thinner as agent SDKs and protocols mature.

> [!hottake] The best framework code is the code you can delete in an afternoon.
> **The counterargument:** frameworks earn their keep in durable state, retries, integrations and observability; deleting them often means rebuilding those, badly.

## Check yourself
```quiz
framework-anti-patterns
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024), on starting with simple, composable patterns.

## Related
- [The landscape map](#framework-landscape)
- [Selection guide and matrix](#framework-selection)
- [Orchestration frameworks](#orchestration-frameworks)
- [Observability and tracing](#observability-tracing)
- [The anti-patterns hall of shame](#anti-patterns)
