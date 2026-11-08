---
id: data-strategy
book: 7
order: "7.1"
title: Data strategy
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [data, flywheel, moat]
visuals:
  - data-flywheel-diagram:flowchart
  - data-assets:tree
---
> [!tldr]
> When models are commodities, data is the durable advantage: proprietary domain knowledge, user interactions with consent, labeled failures, eval sets and feedback loops. A data strategy decides what to collect, how to label and govern it, and how it flows into evals, retrieval, prompts and training.

## Why it matters
Competitors can call the same model APIs. They cannot easily copy your documents, your users’ corrections, your labeled edge cases or your eval suite. Teams that plan for data from day one compound their advantage; teams that do not have nothing to train or evaluate on later.

## Intuition
Models are engines anyone can buy; data is the map of your own territory that only you have drawn, and keep redrawing.

```mermaid id=data-flywheel-diagram title="Usage becomes data, data becomes quality, quality brings usage" caption="The flywheel only turns if someone curates what comes back." alt="Loop from users to traces and feedback, to curated data, to evals and training, to a better product."
flowchart LR
  U[Users] --> T[Traces and feedback]
  T --> C[Curation and labeling]
  C --> E[Evals and training data]
  E --> P[Better product]
  P --> U
```

## How it works
```viz
{"id":"data-assets","component":"tree","title":"Five data assets worth building, and how each is used","caption":"Expand an asset. The eval set is usually the first to build and the last to stop paying off.","alt":"Tree of AI data assets: domain corpora, interaction logs, labeled failures, eval sets and preference data, with their uses.","data":"illustrative","open":1,"root":{"label":"Data assets","children":[
{"label":"Domain corpora","children":[{"label":"Documents, tickets, code: retrieval and continued pretraining","link":"#production-rag"}]},
{"label":"Interaction logs with consent","children":[{"label":"What users actually ask and do: error analysis","link":"#error-analysis"}]},
{"label":"Labeled failures and corrections","children":[{"label":"Eval cases and fine-tuning data","link":"#labeling-annotation"}]},
{"label":"Eval sets","children":[{"label":"The definition of quality for every change","link":"#eval-datasets"}]},
{"label":"Preference and feedback data","children":[{"label":"Preference optimization and routing","link":"#preference-optimization"}]}]}}
```

**Collection with consent.** Terms of service, opt-ins and retention policies decide what you may use. See [privacy](#privacy) and [governance](#data-governance).

**Labeling.** Guidelines, trained annotators or experts, agreement checks and adjudication turn raw data into assets. See [labeling and annotation](#labeling-annotation).

**Synthetic augmentation.** Generated data fills coverage gaps when filtered and mixed with real data. See [synthetic data](#synthetic-data).

**Flows.** The [data flywheel](#data-flywheel) turns usage into improvement: logs, curation, evals, fixes, release.

## In practice
- Start with an eval set and a logging plan on day one.
- Decide ownership: who curates, labels and approves data uses.
- Track lineage (where each dataset came from and what was built from it) and permitted use (what it may be used for). See [data governance](#data-governance).

## Numbers to know
> [!number]
> Rules of thumb. A few hundred carefully labeled real examples are often worth more than tens of thousands of unlabeled ones for evaluation.

## Pitfalls and anti-patterns
> [!pitfall] Logging everything without a plan
> Unused data is cost and risk, not an asset.

## Talk like an expert
The vocabulary: **data moat**, **proprietary data**, **consented data**, **labeled failures**, **eval set**, **lineage**, **flywheel**. Experts can name the data assets that make their product hard to copy. The live debate is how durable data moats are as general models absorb more of the world’s knowledge.

> [!hottake] Your eval set is your most defensible data asset.
> **The counterargument:** for many products, unique domain corpora or exclusive user interactions are far harder to replicate than an eval set, which a competitor can build in weeks.

## Check yourself
```quiz
data-strategy
```

## Go deeper
- The [data flywheel](#data-flywheel) and [eval datasets](#eval-datasets) chapters.

## Related
- [The data flywheel](#data-flywheel)
- [Labeling and annotation](#labeling-annotation)
- [Synthetic data](#synthetic-data)
- [Data quality and governance](#data-governance)
- [Building eval datasets](#eval-datasets)
- [Feature engineering and preprocessing](#feature-engineering)
- [Active learning and weak supervision](#active-learning-weak-supervision)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)
- [Feature stores and training-serving consistency](#feature-stores)
