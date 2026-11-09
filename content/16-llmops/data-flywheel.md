---
id: data-flywheel
book: 16
order: "16.8"
title: The data flywheel
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [feedback, flywheel, curation]
visuals:
  - flywheel-loop:diagram
  - signal-tree:tree
---
> [!tldr]
> The data flywheel turns usage into improvement: log interactions with consent, capture explicit and implicit feedback, curate and label the useful parts, feed them into evals, prompts, retrieval and training, ship the better system, and repeat. It only spins if each step is cheap and someone owns it.

## Why it matters
Models are increasingly the same for everyone; your users’ interactions are not. Teams that systematically turn real usage into eval cases, better prompts, better retrieval and fine-tuning data compound their advantage. Teams that log everything and use nothing pay storage and privacy costs for no gain.

## Intuition
A flywheel is hard to start and easy to keep turning. Each turn here is a cycle of use, feedback and improvement; better products attract more use, which yields more feedback.

```viz
{"id":"flywheel-loop","component":"diagram","title":"Six steps turn usage into a better system, and the better system into more usage","caption":"Click a step for the chapter that covers it. Weak links, such as curation nobody owns, stop the wheel.","alt":"Loop diagram of the data flywheel: users interact, interactions are logged with feedback, curated and labeled, used in evals and training, and shipped as an improved system.","data":"illustrative","w":600,"h":220,"nodes":[
{"id":"use","label":"Users interact","role":"human","x":0,"y":0,"w":170,"h":56},
{"id":"log","label":"Log and capture feedback","sub":"with consent","role":"data","x":215,"y":0,"w":170,"h":56,"link":"#observability-tracing"},
{"id":"curate","label":"Curate and label","sub":"sample, review, annotate","role":"human","x":430,"y":0,"w":170,"h":56,"link":"#error-analysis"},
{"id":"evals","label":"Evals","sub":"new cases from failures","role":"tool","x":430,"y":150,"w":170,"h":56,"link":"#eval-datasets"},
{"id":"improve","label":"Improve","sub":"prompts, retrieval, fine-tunes","role":"model","x":215,"y":150,"w":170,"h":56,"link":"#fine-tuning-practice"},
{"id":"ship","label":"Ship","sub":"gated rollout","role":"agent","x":0,"y":150,"w":170,"h":56,"link":"#ci-cd-for-ai"}],
"edges":[{"from":"use","to":"log"},{"from":"log","to":"curate"},{"from":"curate","to":"evals"},{"from":"evals","to":"improve"},{"from":"improve","to":"ship"},{"from":"ship","to":"use"}]}
```

## How it works
**Logging with consent.** Record interactions in a form you can use (inputs, outputs, retrieved context, tool calls, versions), governed by terms users have agreed to, with redaction and retention limits. See [privacy](#privacy).

**Feedback signals.** Explicit signals (thumbs, ratings, reports, corrections) are clear but sparse. Implicit signals (copying, editing, retrying, abandoning, escalating, converting) are plentiful but noisy. Edits are especially valuable: the user’s corrected version is a labeled example.

**Curation and labeling.** Sample interactions, stratified by feature and outcome; have people review and label failures; cluster similar problems. This is [error analysis](#error-analysis) at production scale.

**Uses of the data.**
- **Evals:** every labeled failure becomes a case. See [eval datasets](#eval-datasets).
- **Prompts and retrieval:** fixes for frequent failure modes; missing documents added to the corpus.
- **Fine-tuning and preference data:** corrected outputs for supervised fine-tuning; pairs of better and worse responses for preference optimization. See [fine-tuning in practice](#fine-tuning-practice).
- **Product decisions:** what users actually try to do.

**Avoiding feedback loops.** Training on your own model’s outputs can reinforce its mistakes; prefer human-corrected data, and evaluate on held-out real traffic.

## In practice
```viz
{"id":"signal-tree","component":"tree","title":"Each feedback signal is good for something different","caption":"Expand a signal for what it tells you and where to use it.","alt":"Tree of feedback signals: thumbs, edits, retries, abandonment, escalations and conversions, with their uses.","data":"illustrative","open":1,"root":{"label":"Feedback signals","children":[
{"label":"Thumbs and ratings","children":[{"label":"Sparse and skewed to extremes; good for finding failures to review"}]},
{"label":"Edits and corrections","children":[{"label":"The user’s version is a labeled target; excellent for fine-tuning and evals"}]},
{"label":"Retries and regenerations","children":[{"label":"Strong signal the first answer missed; compare the two"}]},
{"label":"Abandonment","children":[{"label":"Ambiguous: solved or gave up? Combine with other signals"}]},
{"label":"Escalation to a human","children":[{"label":"Clear failure for support use cases; review every one","link":"#support-agents"}]},
{"label":"Conversion and task completion","children":[{"label":"The business outcome; ties quality to value","link":"#online-evaluation"}]}]}}
```

Starting the flywheel:
1. Log with consent, redaction and versions.
2. Capture at least one explicit and two implicit signals per feature.
3. Review a stratified sample weekly; label failures.
4. Turn failures into eval cases the same week.
5. Fix the top failure mode, ship it through gates, measure the change.

## Numbers to know
> [!number]
> Rules of thumb. Explicit feedback rates are usually low, often a few percent of interactions or less, so implicit signals carry most of the volume. A weekly review of 50 to 100 sampled interactions keeps the flywheel turning for most teams.

## Pitfalls and anti-patterns
> [!pitfall] Logging everything and reviewing nothing
> Data that nobody curates is a storage bill and a privacy liability, not an asset.

- **Thumbs as the only signal.** Too sparse and biased to steer by.
- **Training on unreviewed outputs.** Reinforces the model’s own mistakes.
- **No consent or retention policy.** Undermines both trust and legality.

## Talk like an expert
The vocabulary: **data flywheel**, **explicit and implicit feedback**, **curation**, **annotation queue**, **preference pairs**, **feedback loop**, **consent**. Experts measure the flywheel by cycle time: how long from a production failure to a shipped fix with an eval case. The live debate is how much proprietary interaction data remains a moat as general models improve.

> [!hottake] Your best training data is your users’ edits.
> **The counterargument:** edits reflect individual preferences and quick fixes, not always better outputs; without curation, they can teach a model idiosyncrasies rather than quality.

## Check yourself
```quiz
data-flywheel
```

## Go deeper
- The [error analysis](#error-analysis) and [fine-tuning in practice](#fine-tuning-practice) chapters.
- Writing on building data flywheels for AI products from practitioners and vendors, read critically.

## Related
- [Error analysis first](#error-analysis)
- [Building eval datasets](#eval-datasets)
- [Online evaluation](#online-evaluation)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Privacy](#privacy)
- [Data strategy](#data-strategy)
- [Active learning and weak supervision](#active-learning-weak-supervision)
- [Measuring the impact and ROI of an AI feature](#measuring-ai-impact)
- [Playbook: Shopify Sidekick: post-training an open model to take over a frontier model's subagent](#shopify-open-model-task-experts)
- [Playbook: Zalando: mapping supplier spreadsheets with a RAG flywheel](#zalando-rag-data-ingestion)
- [Playbook: Uber's Legal Redlining Agent: reviewing contract redlines inside Word](#uber-legal-redlining-agent)
