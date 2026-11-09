---
id: ai-product-ux
book: 18
order: "18.6"
title: AI product and UX
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [product, ux, trust]
visuals:
  - trust-calibration:chart
  - uncertainty-compare:compare
---
> [!tldr]
> AI products succeed when users trust them as much as they deserve: show sources and confidence, make errors cheap to spot and fix, keep humans in control of consequential actions, set expectations about what the system can and cannot do, and design for the moment it is wrong.

## Why it matters
The same model can feel magical or useless depending on the interface around it. Fluent output invites over-trust; unexplained failures destroy trust. Product design is where accuracy turns into value or harm.

## Intuition
A good AI product behaves like a trustworthy colleague: it shows its work, says when it is unsure, asks before doing anything risky, and makes it easy to correct it.

```viz
{"id":"trust-calibration","component":"chart","type":"line","title":"Fluent output invites the same trust whether the answer is right or wrong","caption":"Illustrative. Calibrated trust would track accuracy; typical trust in fluent text stays high regardless. Interface design closes the gap.","alt":"Illustrative line chart of user trust against actual accuracy, comparing calibrated trust with typical trust in fluent output.","data":"illustrative","x":{"label":"Actual accuracy of the answer type","unit":"pct","min":0,"max":1},"y":{"label":"User trust","unit":"pct","min":0,"max":1},"series":[{"name":"Calibrated trust","points":[[0.2,0.2],[0.4,0.4],[0.6,0.6],[0.8,0.8],[1,1]]},{"name":"Typical trust in fluent output","points":[[0.2,0.72],[0.4,0.76],[0.6,0.8],[0.8,0.85],[1,0.88]]}]}
```

## How it works
**Calibrate trust.** Show sources and let users open them; mark uncertainty and unsupported claims; distinguish what was retrieved from what was inferred. See [grounding](#grounding-citations).

**Make errors cheap.** Editable outputs, undo, diffs, previews before actions, and easy feedback. See [agent UX](#agent-ux).

**Keep control.** Approvals for consequential actions, clear stop buttons, and visible plans. See [human in the loop](#human-in-the-loop).

**Set expectations.** Onboarding that shows what the system does well and badly; empty states with good example prompts; honest messages when it cannot help.

**Design for latency.** Stream, show progress, and let users keep working. See [streaming](#streaming).

```viz
{"id":"uncertainty-compare","component":"compare","title":"The same answer, presented to invite blind trust or checked trust","caption":"Illustrative interface text. Hover the marks.","alt":"Comparison of an answer presented without sources or uncertainty and the same answer with sources, a flagged uncertain claim and an action to verify.","data":"illustrative","mono":false,"a":{"title":"Invites blind trust","text":"Your contract allows termination with 30 days’ notice, and there is no penalty.","mono":false},"b":{"title":"Invites checked trust","text":"Your contract allows termination with 30 days’ notice (clause 12.1, open). I could not find a clause on penalties; section 14 may be relevant (open). Ask a lawyer before acting.","mono":false},"links":[{"a":"and there is no penalty.","b":"I could not find a clause on penalties","note":"Saying what was not found prevents a dangerous assumption."},{"b":"(clause 12.1, open)","note":"One click to verify the key claim."},{"b":"Ask a lawyer before acting.","note":"Appropriate for a high-stakes decision, without refusing to help."}]}
```

## In practice
- For each feature, write down what happens when the model is wrong and how the user will notice.
- Instrument feedback and edits as quality signals. See [the data flywheel](#data-flywheel).
- Test with real users on real tasks, including failure cases.

## Numbers to know
> [!number]
> Rule of thumb: users check far fewer outputs than designers expect; make the important checks one click away or they will not happen.

## Pitfalls and anti-patterns
> [!pitfall] Confident presentation of uncertain output
> Polished formatting signals reliability the content may not have.

- **Chat as the only interface.** Many tasks are better as forms, tables or editable documents.
- **No path for wrong answers.** Users need to correct, report or escalate.

## Talk like an expert
The vocabulary: **trust calibration**, **over-reliance**, **human control**, **progressive disclosure**, **graceful failure**, **expectation setting**. Experts design the error experience first. The live debate is how much autonomy users want and how interfaces should change as agents act more on their own.

> [!hottake] Most AI product failures are interface failures, not model failures.
> **The counterargument:** no interface rescues a model that is wrong too often for the task; reliability remains the foundation.

## Check yourself
```quiz
ai-product-ux
```

## Go deeper
- Amershi et al., “Guidelines for Human-AI Interaction” (Microsoft, 2019).
- Google PAIR, *People + AI Guidebook*.

## Related
- [Agent UX](#agent-ux)
- [Grounding and citations](#grounding-citations)
- [Human in the loop](#human-in-the-loop)
- [Responsible AI in practice](#responsible-ai)
- [The data flywheel](#data-flywheel)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
- [Scoping AI features: when to use AI and what success means](#ai-use-case-scoping)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Playbook: ML-suggested edits that resolve code review comments at Google](#google-resolving-review-comments)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Human-AI interaction guidelines in practice](#human-ai-interaction-guidelines)
