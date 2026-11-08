---
id: decision-guides
book: 18
order: "18.4"
title: Decision guides
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [decisions, rag-vs-fine-tune, build-vs-buy]
visuals:
  - decision-trees:tree
  - decision-record:compare
---
> [!tldr]
> A handful of decisions come up in every AI project: prompt versus retrieval versus fine-tuning, workflow versus agent, API versus self-hosting, one model versus several, build versus buy, long context versus RAG. Each has a default and the evidence that should move you off it.

## Why it matters
Teams re-argue the same decisions on every project. Agreed defaults with explicit triggers for exceptions speed up design, keep architectures simple, and make it clear what evidence would justify a more complex choice.

## Intuition
Decision guides are a pilot’s checklists: the default action for each situation, with the conditions that call for something else. They do not replace judgment; they stop you from forgetting the basics under pressure.

```viz
{"id":"decision-trees","component":"tree","title":"Six recurring decisions, each with a default and the trigger to deviate","caption":"Expand a decision. Each leaf links to the chapter with the full reasoning.","alt":"Tree of six recurring AI engineering decisions with defaults and triggers for alternatives.","data":"illustrative","open":1,"root":{"label":"Recurring decisions","children":[
{"label":"Prompt, retrieval or fine-tuning?","children":[{"label":"Default: prompt. Knowledge gap: retrieval. Behavior, cost or latency gap at volume: fine-tune.","link":"#fine-tuning-practice"}]},
{"label":"Workflow or agent?","children":[{"label":"Default: workflow. Unpredictable steps with checkable outcomes: agent.","link":"#what-is-an-agent"}]},
{"label":"Long context or RAG?","children":[{"label":"Default: RAG for large or changing corpora; long context for one or a few documents per task.","link":"#long-context"}]},
{"label":"API or self-hosted?","children":[{"label":"Default: API. High steady volume, data residency or customization: self-host.","link":"#cost-engineering"}]},
{"label":"One model or several?","children":[{"label":"Default: one strong model plus a small model for bulk tasks; route more only with eval evidence.","link":"#gateways-routers"}]},
{"label":"Build or buy?","children":[{"label":"Build what differentiates you; adopt commodity components.","link":"#reference-architecture"}]}]}}
```

## How it works
**Defaults favor simplicity.** Every alternative to the default adds components to build, evaluate and operate. The guide asks for evidence before adding them: an eval result, a cost estimate, a constraint.

**Triggers are measurable.** “Retrieval recall is above 90% and answers still fail” justifies looking at generation; “the workflow fails on 30% of cases because steps vary” justifies an agent; “API cost exceeds the self-hosting estimate at current volume” justifies self-hosting.

**Record decisions.** A short decision record states the choice, the alternatives, the evidence and the trigger that would reopen it:

```viz
{"id":"decision-record","component":"compare","title":"A decision that will be re-argued next quarter, and one that will not","caption":"Hover the marks. A decision record takes ten minutes and saves hours of repeated debate.","alt":"Comparison of an undocumented decision and a short decision record with alternatives, evidence and a revisit trigger.","data":"illustrative","mono":false,"a":{"title":"Undocumented","text":"We went with fine-tuning because it seemed more robust.","mono":false},"b":{"title":"Decision record","text":"Decision: retrieval with reranking, no fine-tuning, for HR answers.\nAlternatives: fine-tune a small model; long context with all policies.\nEvidence: retrieval reached 94% answer correctness on 200 questions; fine-tuning cannot track weekly policy changes.\nRevisit if: correctness drops below 90% or volume makes cost per answer exceed $0.02.","mono":false},"links":[{"a":"because it seemed more robust.","b":"retrieval reached 94% answer correctness on 200 questions","note":"Evidence instead of impressions."},{"b":"Alternatives: fine-tune a small model; long context with all policies.","note":"Shows the options were considered."},{"b":"Revisit if:","note":"Makes the decision reopenable for the right reasons."}]}
```

## In practice
- Adopt the defaults team-wide; require a short decision record for deviations.
- Attach eval results and cost estimates to every record.
- Review records when models or prices change significantly.

## Numbers to know
> [!number]
> Rule of thumb: if an alternative does not beat the default by more than the confidence interval on your eval, keep the default.

## Pitfalls and anti-patterns
> [!pitfall] Deviating from defaults by enthusiasm
> “Agents are the future” is not evidence that this task needs one.

- **Never reopening decisions.** Models and prices change; triggers exist for that.

## Talk like an expert
The vocabulary: **default**, **trigger**, **decision record**, **evidence**, **reversibility**, **simplest viable option**. Experts ask “what would change your mind?” about every design choice. The live debate is how quickly defaults should shift toward agents and long context as models improve.

> [!hottake] The default answer to “should this be an agent?” is still no.
> **The counterargument:** as models grow more reliable, agents handle more tasks with less engineering than equivalent workflows, and the default may flip for many domains within a year or two.

## Check yourself
```quiz
decision-guides
```

## Go deeper
- This Bible’s decision wizards and comparison matrices in the [Workshop](#workshop) and [Matrices](#matrices) pages.

## Related
- [The AI system design method](#system-design-method)
- [Fine-tuning in practice](#fine-tuning-practice)
- [What an agent is](#what-is-an-agent)
- [Cost engineering](#cost-engineering)
- [Selection guide and matrix](#framework-selection)
