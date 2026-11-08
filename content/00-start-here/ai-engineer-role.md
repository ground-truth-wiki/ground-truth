---
id: ai-engineer-role
book: 0
order: "0.1"
title: What an AI engineer is
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [career, role, skills]
visuals:
  - role-compare:compare
  - skills-map:graph
---
> [!tldr]
> AI engineers build products and systems on top of foundation models: prompts and context, retrieval, tools and agents, evals, serving, safety and operations. The role sits between software engineering and machine learning, and its core skill is turning probabilistic models into reliable software.

## Why it matters
Most organizations now need people who can ship AI features responsibly without training models from scratch. Knowing the role’s scope helps you plan learning, hiring and team structure.

## Intuition
If machine learning engineers build engines, AI engineers build cars: they choose engines, design everything around them, and are responsible for how the car drives on real roads.

```viz
{"id":"role-compare","component":"compare","title":"ML engineer and AI engineer: overlapping skills, different centers","caption":"Simplified; real roles mix both. Hover the marks.","alt":"Comparison of the focus of a machine learning engineer and an AI engineer.","data":"illustrative","mono":false,"a":{"title":"ML engineer","text":"Trains and tunes models on curated datasets; owns features, training pipelines, model metrics and deployment of models the team built.","mono":false},"b":{"title":"AI engineer","text":"Builds products on foundation models; owns prompts and context, retrieval, tools and agents, evals, cost, latency, safety and operations of AI features.","mono":false},"links":[{"a":"Trains and tunes models","b":"Builds products on foundation models","note":"The center of gravity moves from training to composition."},{"a":"model metrics","b":"evals, cost, latency, safety","note":"Both care about quality; AI engineers also own product-level risks."}]}
```

## How it works
**The term.** Shawn Wang (swyx) popularized “AI engineer” in 2023 for software engineers who build with foundation models.

**The skill map.**

```viz
{"id":"skills-map","component":"graph","title":"The AI engineer’s skill map, from foundations to production","caption":"Each node is a Book of Ground Truth. Follow the edges for a sensible learning order.","alt":"Graph of AI engineering skills linking foundations, models, prompting, retrieval, agents, evals, serving, security and production.","data":"illustrative","per_row":3,"node_w":170,"nodes":[{"id":"found","label":"Foundations","link":"#linear-algebra"},{"id":"models","label":"How models work","link":"#transformer-block"},{"id":"prompt","label":"Prompting and context","link":"#prompting-fundamentals"},{"id":"rag","label":"Retrieval","link":"#rag-fundamentals"},{"id":"agents","label":"Agents and tools","link":"#agent-loop"},{"id":"evals","label":"Evaluation","link":"#why-evals"},{"id":"serve","label":"Serving and cost","link":"#inference-fundamentals"},{"id":"sec","label":"Security and safety","link":"#prompt-injection"},{"id":"prod","label":"Production","link":"#reference-architecture"}],"edges":[["found","models"],["models","prompt"],["prompt","rag"],["prompt","agents"],["rag","evals"],["agents","evals"],["evals","prod"],["serve","prod"],["sec","prod"]]}
```

**What good looks like.** Builds evals before features; understands cost and latency; designs for failure; knows when not to use AI; and communicates uncertainty clearly. See [interview prep](#interview-prep).

## In practice
- Start with prompting, evals and retrieval; add agents, serving and fine-tuning as needed.
- Build portfolio projects up the [project ladder](#project-ladder).

## Numbers to know
> [!number]
> Rule of thumb: AI engineers spend much of their time on evals, data and integration, not on prompts alone.

## Pitfalls and anti-patterns
> [!pitfall] Treating the role as “prompt writing”
> Production AI engineering is mostly systems, evaluation and operations.

## Talk like an expert
The vocabulary: **foundation model**, **eval-driven development**, **context engineering**, **agentic system**, **model gateway**, **guardrails**. Experts define their role by the reliability of the systems they ship. The live debate is how the role evolves as agents write more of the code.

> [!hottake] Every software engineer will be an AI engineer within a few years.
> **The counterargument:** specialized depth in evaluation, safety and serving will keep AI engineering a distinct discipline, even as basic AI use becomes universal.

## Check yourself
```quiz
ai-engineer-role
```

## Go deeper
- Shawn Wang, “The Rise of the AI Engineer” (2023).
- Chip Huyen, *AI Engineering* (2025).

## Related
- [The AI engineering stack](#ai-engineering-stack)
- [Mental models that matter](#mental-models)
- [How to use Ground Truth](#how-to-use)
- [Interview prep](#interview-prep)
- [Learning paths and the project ladder](#project-ladder)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
