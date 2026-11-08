---
id: unstructured-pipelines
book: 7
order: "7.5"
title: Unstructured data pipelines
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [etl, pipelines, documents]
visuals:
  - etl-flow:stepper
  - pipeline-failures:tree
---
> [!tldr]
> Unstructured data pipelines move documents, tickets, emails, transcripts and images from source systems into parsed, enriched, chunked and indexed form, incrementally and reliably. They are ordinary data engineering with AI steps inside, and they need orchestration, idempotency, monitoring and lineage like any other pipeline.

## Why it matters
Most AI features over company knowledge depend on these pipelines. When they break quietly, answers go stale or wrong without any error in the AI system itself.

## Intuition
A pipeline is a factory line for documents: receiving, unpacking, inspecting, labeling, cutting to size and shelving, with a log of every item that passed through.

```viz
{"id":"etl-flow","component":"stepper","title":"Seven stages from source systems to a searchable, governed index","caption":"Step through an illustrative pipeline run triggered by new and changed documents.","alt":"Stepper of an unstructured data pipeline: change detection, extraction, parsing, enrichment, chunking and embedding, indexing and monitoring.","data":"illustrative","frames":[
{"label":"Detect changes","caption":"Change events or a scheduled diff find 214 new, 37 changed and 5 deleted documents."},
{"label":"Extract","caption":"Fetch files and metadata (owner, permissions, dates) from each source."},
{"label":"Parse","caption":"Layout-aware parsing and OCR produce structured text; failures go to a retry queue. See ingestion and parsing."},
{"label":"Enrich","caption":"Add language, document type, summaries, entities and PII flags, using small models where possible."},
{"label":"Chunk and embed","caption":"Split by structure, embed, and keep chunk-to-document mappings and content hashes."},
{"label":"Index","caption":"Upsert changed chunks, delete removed ones, and update permission metadata."},
{"label":"Monitor","caption":"Record counts, failures, lag and costs; alert if lag exceeds the freshness target."}]}
```

## How it works
**Orchestration.** Workflow tools such as Airflow, Dagster and Prefect, or event-driven queues, schedule and retry steps.

**Incremental processing.** Content hashes and change events limit work to new and changed items; deletions propagate. See [production RAG](#production-rag).

**Idempotency.** Every step can rerun without duplicating results, keyed by document id and version. See [reliability](#reliability-engineering).

**AI steps.** Parsing, classification, enrichment, PII detection and embedding use models; batch APIs and small models keep costs down. See [cost engineering](#cost-engineering).

```viz
{"id":"pipeline-failures","component":"tree","title":"Where unstructured pipelines quietly fail","caption":"Expand a failure for its symptom and check.","alt":"Tree of common unstructured pipeline failures with symptoms and checks.","data":"illustrative","open":1,"root":{"label":"Silent pipeline failures","children":[
{"label":"Parser regressions","children":[{"label":"Symptom: garbled chunks after a library upgrade. Check: sample parsed output per run.","link":"#ingestion-parsing"}]},
{"label":"Missed deletions","children":[{"label":"Symptom: removed documents still answer. Check: reconciliation counts."}]},
{"label":"Permission drift","children":[{"label":"Symptom: users see what they should not. Check: ACL sync tests.","link":"#privacy"}]},
{"label":"Ingestion lag","children":[{"label":"Symptom: stale answers. Check: lag against freshness targets."}]},
{"label":"Embedding model changes","children":[{"label":"Symptom: recall drops after a mixed re-index. Check: one model per index, full re-embed.","link":"#embeddings"}]}]}}
```

## In practice
- Treat the pipeline as production code with tests, monitoring and on-call.
- Keep raw, parsed and chunked versions with lineage. See [data governance](#data-governance).
- Run a retrieval regression eval after pipeline changes. See [evaluating RAG](#rag-evaluation).

## Numbers to know
> [!number]
> Rule of thumb: re-processing only changed documents usually cuts pipeline cost by orders of magnitude compared with full rebuilds.

## Pitfalls and anti-patterns
> [!pitfall] A one-off ingestion script in production
> It works once, then the sources change and nobody notices.

## Talk like an expert
The vocabulary: **orchestration**, **incremental processing**, **content hash**, **idempotent step**, **reconciliation**, **ingestion lag**, **re-index**. Experts monitor pipelines like services. The live debate is how much enrichment to do at ingestion versus at query time.

> [!hottake] Most RAG quality problems are pipeline problems.
> **The counterargument:** retrieval and ranking choices still matter a lot once the pipeline is sound; both deserve evals.

## Check yourself
```quiz
unstructured-pipelines
```

## Go deeper
- Airflow, Dagster and Prefect documentation for orchestration patterns.

## Related
- [Ingestion and parsing](#ingestion-parsing)
- [Production RAG](#production-rag)
- [Data quality and governance](#data-governance)
- [Reliability engineering](#reliability-engineering)
- [Chunking](#chunking)
- [Building a web-scale text pipeline](#web-data-pipeline)
- [Data validation, drift and skew](#data-validation-drift)
- [Data formats for AI datasets](#data-formats)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
