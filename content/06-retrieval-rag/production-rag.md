---
id: production-rag
book: 6
order: "6.15"
title: Production RAG
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [production, permissions, indexing]
visuals:
  - prod-rag-arch:diagram
  - delete-propagation:stepper
  - rag-failure-catalog:tree
---
> [!tldr]
> Production RAG adds what demos skip: incremental indexing and real deletions, permission-aware retrieval, tenant isolation, freshness, caching, cost and latency budgets, monitoring, and a catalog of failure modes with standard fixes.

## Why it matters
A demo indexes a folder once and answers questions for one person. Production indexes systems that change every minute, serves people with different permissions, must forget deleted documents, and has to stay fast and affordable under load. Most RAG incidents in production are not model problems: they are stale indexes, leaked permissions and silent retrieval regressions.

## Intuition
A demo is a printed encyclopedia. Production is a newsroom archive: new stories arrive constantly, some are retracted, some are embargoed for certain readers, and everyone expects the search to be current and correct.

```viz
{"id":"prod-rag-arch","component":"diagram","title":"Two paths share one index: changes flow in continuously, and every query is filtered by who is asking","caption":"The ingestion path at the top keeps the index current, including deletions; the query path at the bottom applies the user’s permissions before ranking. Click a component for its chapter.","alt":"Production RAG architecture with an ingestion path from sources through change capture and workers to an index, and a query path from an authenticated user through permission filtering, retrieval, reranking and generation.","data":"illustrative","w":600,"h":250,"nodes":[
{"id":"src","label":"Source systems","sub":"docs, tickets, wikis","role":"external","x":0,"y":0,"w":150,"h":56},
{"id":"cdc","label":"Change events","sub":"create, update, delete","x":175,"y":0,"w":150,"h":56},
{"id":"work","label":"Ingestion workers","sub":"parse, chunk, embed","role":"tool","x":350,"y":0,"w":150,"h":56,"link":"#ingestion-parsing"},
{"id":"idx","label":"Index","sub":"vectors, keywords, ACLs","role":"data","x":350,"y":96,"w":150,"h":56,"link":"#vector-databases"},
{"id":"user","label":"User","sub":"identity, groups","role":"human","x":0,"y":194,"w":150,"h":56},
{"id":"q","label":"Query service","sub":"permission filter","role":"agent","x":175,"y":194,"w":150,"h":56},
{"id":"gen","label":"Rerank and generate","role":"model","x":350,"y":194,"w":150,"h":56,"link":"#reranking"},
{"id":"cache","label":"Caches","sub":"embeddings, answers","role":"data","x":175,"y":96,"w":150,"h":56}],
"edges":[{"from":"src","to":"cdc"},{"from":"cdc","to":"work"},{"from":"work","to":"idx"},{"from":"user","to":"q"},{"from":"q","to":"idx","label":"filtered search"},{"from":"idx","to":"gen","style":"dashed"},{"from":"q","to":"cache","style":"dashed"}]}
```

## How it works
**Incremental indexing.** Track a version or content hash per document. On change, re-parse and re-embed only that document’s chunks; on deletion, remove its chunks from every index and cache. Use change events from source systems where possible, with periodic full reconciliation to catch missed events.

**Permission-aware retrieval.** Store access-control lists (users and groups) on every chunk and filter at query time by the asking user’s identity. Never retrieve first and hide results later: generation may already have seen them. Keep ACLs in sync with sources; permissions change more often than content.

**Multi-tenancy.** Separate indexes or namespaces per tenant, or a strictly enforced tenant filter on every query. Test isolation explicitly: one customer’s data must never rank for another.

**Freshness.** Decide how stale each source may be (minutes for tickets, days for policies) and monitor ingestion lag against it.

**Caching.** Cache embeddings of unchanged chunks, query embeddings of popular queries, and, carefully, answers. Invalidate answer caches when their source documents change.

**Cost and latency budgets.** Know the cost of each stage per query: query rewriting, retrieval, reranking and generation. Cap candidate depth and context size; monitor p95 latency per stage.

Watch a deletion travel through the system:

```viz
{"id":"delete-propagation","component":"stepper","title":"A deleted document must disappear from every index and cache, or it keeps answering questions","caption":"Step through a deletion. Each step is a place where real systems forget to delete.","alt":"Stepper following a document deletion from the source system through change events, both indexes, caches and verification.","data":"illustrative","frames":[
{"label":"Delete","caption":"An HR admin deletes an outdated policy in the source wiki."},
{"label":"Event","caption":"A change event (webhook or change-data capture) arrives with the document id. Without events, a nightly reconciliation must compare source and index."},
{"label":"Indexes","caption":"Workers delete every chunk with that document id from the vector index and the keyword index. Graph-based vector indexes may mark entries deleted until the next compaction.","code":"DELETE chunks WHERE doc_id = 'policy-leave-2023'   -- vector + keyword"},
{"label":"Caches","caption":"Answer caches and memory stores that cited the document are invalidated.","code":"invalidate(answers_citing='policy-leave-2023')"},
{"label":"Verify","caption":"A canary query that used to retrieve the document now returns nothing from it. Alert if it still does."},
{"label":"Audit","caption":"The deletion is logged with timestamps for each step, which is what compliance reviews ask for."}]}
```

## In practice
When something goes wrong, classify it. Barnett et al. (2024) catalogued seven failure points of RAG systems, which make a practical checklist:

```viz
{"id":"rag-failure-catalog","component":"tree","title":"Seven failure points, each with a symptom and a standard fix","caption":"Expand a failure point. Most fixes live upstream of the model.","alt":"Tree of seven RAG failure points with symptoms and fixes.","data":"illustrative","open":1,"root":{"label":"Where did the RAG answer go wrong?","children":[
{"label":"Missing content","children":[{"label":"The answer is not in the corpus. Fix: abstain clearly; add the content."}]},
{"label":"Missed the top-ranked documents","children":[{"label":"The right passage exists but ranks too low. Fix: hybrid search, reranking, better chunking.","link":"#reranking"}]},
{"label":"Not in context","children":[{"label":"Retrieved but cut by context limits. Fix: smarter selection and compression.","link":"#context-engineering"}]},
{"label":"Not extracted","children":[{"label":"In context but ignored or misread. Fix: quote extraction, fewer distractors.","link":"#grounding-citations"}]},
{"label":"Wrong format","children":[{"label":"Answer ignores the requested format. Fix: structured outputs.","link":"#structured-outputs"}]},
{"label":"Incorrect specificity","children":[{"label":"Too general or too detailed for the question. Fix: clearer instructions and examples."}]},
{"label":"Incomplete","children":[{"label":"Answers part of the question. Fix: decomposition and coverage checks.","link":"#query-understanding"}]}]}}
```

Production checklist:
- Incremental indexing with real deletions and nightly reconciliation.
- ACLs on every chunk, filtered at query time, synced with sources.
- Tenant isolation tested with cross-tenant canary queries.
- Freshness SLOs per source, with lag monitoring.
- Per-stage latency and cost dashboards.
- Faithfulness and citation-validity metrics on sampled traffic. See [evaluating RAG](#rag-evaluation).
- Retrieval regression tests in CI on a labeled set. See [CI/CD for AI](#ci-cd-for-ai).

## Numbers to know
> [!number]
> Rules of thumb. Measure ingestion lag as time from source change to searchable; minutes for operational data, hours to a day for reference documents. Re-embedding only changed chunks typically cuts indexing cost by orders of magnitude versus full rebuilds.

## Pitfalls and anti-patterns
> [!pitfall] Hiding results after retrieval instead of filtering before it
> If unauthorized passages reach the model, the answer can leak them even if you remove the citations.

- **Deletes that never propagate.** Stale or retracted documents keep answering.
- **ACLs copied once.** Permissions change; sync them.
- **Answer caches without invalidation.** Cached answers outlive their sources.
- **No retrieval regression tests.** Re-chunking or an embedder upgrade silently drops recall.

## Talk like an expert
The vocabulary: **incremental indexing**, **change-data capture**, **reconciliation**, **document-level ACLs**, **permission-aware retrieval**, **tenant isolation**, **ingestion lag**, **failure points**. Experts ask “what happens when a document is deleted?” and “how are permissions enforced?” before any question about models. The live debate is where permissions should live: in the index, in a separate authorization service queried at retrieval time, or both.

> [!hottake] Permission handling, not retrieval quality, is what blocks most enterprise RAG launches.
> **The counterargument:** permission plumbing is hard but well understood engineering; the harder, ongoing problem is keeping answer quality high as content, users and questions drift.

## Check yourself
```quiz
production-rag
```

## Go deeper
- Barnett et al., “Seven Failure Points When Engineering a Retrieval Augmented Generation System” (2024).
- Your vector database’s documentation on deletions, filtering and multi-tenancy.

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Vector databases and search engines](#vector-databases)
- [Privacy](#privacy)
- [Enterprise readiness](#enterprise-readiness)
- [Evaluating RAG](#rag-evaluation)
- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
- [Playbook: GOV.UK Chat, answering questions from government guidance](#gov-uk-chat)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [RAG security: poisoning, inversion and leakage](#rag-security)
