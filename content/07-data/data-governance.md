---
id: data-governance
book: 7
order: "7.4"
title: Data quality and governance
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [governance, pii, lineage, versioning]
visuals:
  - lineage-graph:graph
  - governance-tree:tree
---
> [!tldr]
> Data governance for AI tracks where data came from, what it may be used for, who can access it, how good it is, and when it must be deleted. Lineage, quality checks, access control, consent, licensing and retention make data usable for evals, retrieval and training without legal or trust surprises.

## Why it matters
Every AI system copies data into indexes, logs, eval sets and training sets. Without governance, nobody can answer “may we train on this?”, “who can see it?” or “where are all copies of this customer’s data?”, and those questions arrive with audits, deletion requests and lawsuits.

## Intuition
Governance is the label on every jar in a shared kitchen: what is inside, where it came from, who may use it, and when it expires.

```viz
{"id":"lineage-graph","component":"graph","title":"Lineage follows each dataset from its source to every model, index and eval that uses it","caption":"An illustrative lineage graph. If the source changes or must be deleted, the graph shows everything affected.","alt":"Lineage graph from source systems through cleaned datasets to an index, an eval set and a fine-tuned model.","data":"illustrative","per_row":3,"node_w":170,"nodes":[{"id":"crm","label":"CRM tickets"},{"id":"docs","label":"Policy documents"},{"id":"logs","label":"Chat logs (consented)"},{"id":"clean","label":"Redacted ticket set"},{"id":"chunks","label":"Chunked policies"},{"id":"labeled","label":"Labeled failures"},{"id":"index","label":"Support index","link":"#production-rag"},{"id":"evalset","label":"Support eval set","link":"#eval-datasets"},{"id":"ft","label":"Fine-tuned router","link":"#fine-tuning-practice"}],"edges":[["crm","clean"],["docs","chunks"],["logs","labeled"],["clean","index"],["chunks","index"],["labeled","evalset"],["clean","ft"],["labeled","ft"]]}
```

## How it works
```viz
{"id":"governance-tree","component":"tree","title":"Six governance controls every AI data asset needs","caption":"Expand a control for the question it answers.","alt":"Tree of data governance controls: lineage, permitted use, access control, quality, retention and documentation.","data":"illustrative","open":1,"root":{"label":"Governance controls","children":[
{"label":"Lineage","children":[{"label":"Where did it come from, and what was built from it?"}]},
{"label":"Permitted use","children":[{"label":"Consent, licenses and contracts: may we index, evaluate or train on it?","link":"#privacy"}]},
{"label":"Access control","children":[{"label":"Who and which systems may read it; enforced in retrieval too","link":"#production-rag"}]},
{"label":"Quality","children":[{"label":"Completeness, duplicates, freshness and label agreement","link":"#labeling-annotation"}]},
{"label":"Retention and deletion","children":[{"label":"How long it lives, and how deletions reach every copy","link":"#privacy"}]},
{"label":"Documentation","children":[{"label":"Datasheets and model cards describing contents and limits","link":"#responsible-ai"}]}]}}
```

**Lineage.** Record transformations from source to derived datasets, indexes, evals and models. Data catalogs and pipeline tools capture much of this automatically.

**Permitted use.** Tag datasets with consent basis, license and contractual limits; check before training or sharing.

**Quality.** Automated checks for schema, missing values, duplicates, freshness and distribution drift; label agreement for annotated data.

**Regulation.** Privacy law, the EU AI Act’s data governance requirements for high-risk systems and sector rules make these controls obligations, not niceties. See [governance and regulation](#governance-regulation).

## In practice
- Catalog every AI dataset with owner, source, permitted uses and retention.
- Automate lineage in pipelines; do not rely on spreadsheets.
- Test deletion end to end on a sample record each quarter.

## Numbers to know
> [!number]
> Rule of thumb: if you cannot list every copy of a customer’s data within an hour, your lineage is not good enough for a deletion request.

## Pitfalls and anti-patterns
> [!pitfall] Training on data whose license nobody checked
> Retraining or withdrawing a model later is far costlier than checking first.

## Talk like an expert
The vocabulary: **lineage**, **data catalog**, **permitted use**, **consent basis**, **retention**, **data quality checks**, **datasheet**. Experts can trace any model output back to its data sources. The live debate is how copyright and consent rules for training data will settle.

> [!hottake] Data governance is the bottleneck for enterprise AI, not models.
> **The counterargument:** many organizations ship useful AI on well-understood internal data with light governance; heavy process up front can stall projects that would have been low-risk.

## Check yourself
```quiz
data-governance
```

## Go deeper
- Gebru et al., “Datasheets for Datasets” (2018).

## Related
- [Data strategy](#data-strategy)
- [Privacy](#privacy)
- [Unstructured data pipelines](#unstructured-pipelines)
- [Production RAG](#production-rag)
- [Governance and regulation](#governance-regulation)
