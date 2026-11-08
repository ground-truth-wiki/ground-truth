---
id: vector-databases
book: 6
order: "6.6"
title: Vector databases and search engines
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [vector-db, pgvector, search-engines]
visuals:
  - vectordb-matrix:matrix
  - vectordb-wizard:wizard
---
> [!tldr]
> Vector search lives in three kinds of place: extensions to databases you already run, dedicated vector databases, and search engines that added vectors. Choose by scale, filtering, hybrid search, update patterns, multi-tenancy, operations and cost, and start with what you already operate. A dated snapshot as of November 2026.

## Why it matters
The vector store becomes part of your critical path: it holds a copy of your knowledge, enforces part of your permissions and sets a floor on latency. Switching later means re-embedding and re-indexing everything. Choosing for demo convenience and discovering at scale that filtering, deletions or multi-tenancy do not fit is a common and expensive mistake.

## Intuition
Choosing a vector store is like choosing where to keep a growing library. A shelf in the office you already have (an extension) is cheapest until it overflows. A purpose-built warehouse (a vector database) scales but needs its own staff. A full library with a catalog system (a search engine) does keyword search beautifully and now does vectors too.

```viz
{"id":"vectordb-matrix","component":"matrix","matrix":"vector-dbs","title":"Ten vector stores by type, hosting, hybrid search and best fit","caption":"Sortable and filterable. Qualitative and dated as of November 2026; capabilities change quickly, so verify before deciding.","alt":"Table comparing vector stores by type, hosting options, hybrid search support and best fit.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**Extensions to databases you run.** pgvector adds vector types and ANN indexes to Postgres, so vectors live next to your relational data with transactions, joins and SQL filters. Redis, MongoDB and other databases have added vector search too. Least new infrastructure; scale limits depend on your database.

**Dedicated vector databases.** Pinecone, Weaviate, Qdrant, Milvus, Chroma, LanceDB, turbopuffer and others are built around vector search, with different trade-offs: managed versus self-hosted, in-memory versus object-storage-backed, filtering performance, and multi-tenancy models.

**Search engines with vectors.** Elasticsearch, OpenSearch and Vespa combine mature keyword search, ranking and aggregations with vector search, which makes [hybrid retrieval](#hybrid-retrieval) natural.

**Selection criteria:**
- **Scale:** vectors today and in two years; dimensions; query rate.
- **Filtering:** how selective your filters are and whether the engine filters during search.
- **Hybrid search:** native keyword search and fusion, or a second system.
- **Updates:** insert, update and delete rates; freshness requirements.
- **Multi-tenancy:** per-tenant namespaces or indexes, and isolation guarantees.
- **Operations:** managed or self-hosted, backups, upgrades, monitoring.
- **Cost model:** memory-heavy versus storage-heavy pricing.

## In practice
Walk the decision:

```viz
{"id":"vectordb-wizard","component":"wizard","wizard":"vector-store","title":"Three questions narrow the field: what you run, how big, and who operates it","caption":"A starting recommendation, not a verdict. Benchmark finalists with your own vectors, filters and query rate.","alt":"Decision wizard choosing between pgvector, a search engine’s vector support, a managed vector database and a self-hosted one.","data":"illustrative"}
```

Run a short bake-off before committing:
1. Load a realistic sample: your real vectors, metadata and access-control fields.
2. Replay real queries with real filters; measure recall@k against exact search and p95 latency.
3. Test updates and deletions at your expected rate, then re-measure.
4. Price it at two years’ projected scale.

## Numbers to know
> [!number]
> Rules of thumb. Raw vector memory is vectors × dimensions × bytes; one million 1,024-dimension float32 vectors is about 4 GB before index overhead. Many teams stay comfortably within an existing Postgres for corpora of a few million chunks; measure before migrating.

## Pitfalls and anti-patterns
> [!pitfall] Choosing a store for the demo
> Demo-scale performance says little about filtered queries, deletions and multi-tenancy at production scale.

- **A second system you did not need.** Every new store is another thing to secure, back up and keep in sync.
- **Ignoring deletes.** Removed documents must disappear from the index promptly.
- **Tenant isolation by convention.** Enforce it with namespaces or filters in code, and test it.

## Talk like an expert
The vocabulary: **pgvector**, **namespaces**, **filtered ANN**, **hybrid search**, **object-storage-backed index**, **multi-tenancy**, **re-indexing**. Experts ask about filter selectivity and update rates before raw speed. The live debate is consolidation: whether dedicated vector databases remain a category or vector search becomes a feature of every database.

> [!hottake] Start with the database you already run; most teams never need a dedicated vector database.
> **The counterargument:** at large scale, with heavy filtering, many tenants or very high query rates, purpose-built engines are faster and cheaper to run, and migrating later costs more than choosing well early.

## Check yourself
```quiz
vector-databases
```

## Go deeper
- Each candidate’s documentation and published benchmarks, read with your own workload in mind.
- The ANN-Benchmarks project for index-level comparisons.

## Related
- [Vector search](#vector-search)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Production RAG](#production-rag)
- [Decision guides](#decision-guides)
- [Embeddings](#embeddings)
- [Information retrieval foundations](#ir-foundations)
- [Vector index internals](#vector-index-internals)
