---
id: system-design-method
book: 18
order: "18.1"
title: The AI system design method
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [system-design, method]
visuals:
  - design-steps:stepper
  - requirements-tree:tree
---
> [!tldr]
> Design AI systems in a fixed order: clarify the task and users, define quality and the eval, estimate scale and cost, choose the simplest architecture that works, design data and retrieval, set tool and safety boundaries, plan observability and rollout, then iterate on measured failures. The same method works for real projects and for interviews.

## Why it matters
AI system design fails most often from skipping steps: building before defining quality, choosing agents before trying a workflow, ignoring cost until launch. A repeatable method surfaces the hard decisions early and makes designs reviewable.

## Intuition
Designing an AI system is like planning a building. You ask who will use it and for what, check the budget and the site, pick a structure, plan utilities and safety exits, and only then choose the finishes.

```viz
{"id":"design-steps","component":"stepper","title":"Eight steps from a vague request to a design you can defend","caption":"Step through the method with an illustrative brief: “an assistant that answers employees’ HR questions”.","alt":"Stepper through the AI system design method from requirements to iteration.","data":"illustrative","frames":[
{"label":"Clarify","caption":"Who asks what, how often, through which channel, in which languages, and what happens when the answer is wrong? Here: 20,000 employees, chat in two languages, wrong answers about pay or leave are high-stakes."},
{"label":"Define quality","caption":"Write success criteria and an eval: correct, cited answers from current policy; “not covered” when the policy is silent; escalation for sensitive cases. Collect 200 real questions.","code":"metrics: faithfulness, answer correctness, citation validity, escalation recall"},
{"label":"Estimate","caption":"About 4,000 questions a day, peak 2 per second, 3,000 input and 300 output tokens each: a few hundred dollars a month on a mid-tier model with caching."},
{"label":"Choose architecture","caption":"A workflow, not an agent: retrieve, answer with citations, check, escalate. Agents only if multi-step actions appear later."},
{"label":"Design data","caption":"Ingest policies with permissions by country and role, chunk by section, hybrid search plus reranking, daily sync with deletions."},
{"label":"Set boundaries","caption":"Read-only access to policies; no access to individual pay data; PII redaction in logs; human escalation path."},
{"label":"Plan operations","caption":"Tracing with prompt versions, sampled faithfulness scores, a canary rollout to one country, and an incident runbook."},
{"label":"Iterate","caption":"Read failures weekly, add eval cases, fix the top failure mode, re-run the gates."}]}
```

## How it works
**Requirements first.** Users, tasks, volume, latency, languages, channels, the cost of errors, privacy and compliance constraints.

```viz
{"id":"requirements-tree","component":"tree","title":"Questions to answer before drawing a single box","caption":"Expand each area. Unknown answers become assumptions you state explicitly.","alt":"Tree of requirement questions for AI system design: users and tasks, quality and risk, scale, constraints and operations.","data":"illustrative","open":1,"root":{"label":"Requirements","children":[
{"label":"Users and tasks","children":[{"label":"Who, what, how often, through which channel, in which languages?"}]},
{"label":"Quality and risk","children":[{"label":"What does a good answer look like? What does a wrong one cost?","link":"#why-evals"}]},
{"label":"Scale and latency","children":[{"label":"Requests per day and at peak, tokens per request, latency targets","link":"#back-of-envelope"}]},
{"label":"Constraints","children":[{"label":"Data access and permissions, privacy, compliance, budget, deployment location","link":"#enterprise-readiness"}]},
{"label":"Operations","children":[{"label":"Who owns quality, incidents and updates after launch?","link":"#incidents-on-call"}]}]}}
```

**Simplest architecture that meets quality.** Single call, then chain, then workflow, then agent, in that order. See [workflow patterns](#workflow-patterns) and [what an agent is](#what-is-an-agent).

**Cross-cutting concerns.** Data and retrieval, tools and permissions, safety and guardrails, observability, evals in CI, cost controls, and rollout. See [reference architecture](#reference-architecture).

**Trade-offs, stated.** Every design trades quality, latency, cost and risk. Name the trade-offs and the evidence that would change them.

## In practice
In an interview or design review, budget time roughly as: requirements and quality (a third), architecture and data (a third), operations, risks and trade-offs (a third). Draw the request path, mark where evals and guardrails sit, and estimate cost on the board. See [interview prep](#interview-prep).

## Numbers to know
> [!number]
> Rules of thumb. Estimate requests per day, peak per second, tokens per request and cost per month before choosing models. A first eval set of 100 to 200 real questions is enough to compare designs.

## Pitfalls and anti-patterns
> [!pitfall] Starting with the architecture
> Picking “a multi-agent RAG system” before knowing the users, quality bar and scale produces impressive diagrams and failed products.

- **No eval in the design.** Without it, nobody can tell whether the design works.
- **Cost as an afterthought.** Agentic designs can cost orders of magnitude more than workflows.

## Talk like an expert
The vocabulary: **requirements**, **success criteria**, **eval plan**, **back-of-the-envelope estimate**, **simplest viable architecture**, **request path**, **trade-off**, **rollout plan**. Experts lead with quality and evaluation, not with components. The live debate is how much design should anticipate agents and autonomy versus starting with workflows and evolving.

> [!hottake] The eval plan is the most important box in any AI system diagram.
> **The counterargument:** without a sound data and permissions design, the best eval plan only measures a system that cannot be deployed; the boxes depend on each other.

## Check yourself
```quiz
system-design-method
```

## Go deeper
- The [reference architectures](#reference-architectures) and [decision guides](#decision-guides).

## Related
- [Reference architecture](#reference-architecture)
- [Reference architectures](#reference-architectures)
- [Back-of-the-envelope estimation](#back-of-envelope)
- [Decision guides](#decision-guides)
- [Interview prep](#interview-prep)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Worked AI system design interview answers](#system-design-interview-answers)
