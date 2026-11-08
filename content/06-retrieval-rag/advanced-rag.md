---
id: advanced-rag
book: 6
order: "6.10"
title: Advanced RAG architectures
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [agentic-rag, graphrag, multi-hop]
visuals:
  - agentic-rag-loop:flowchart
  - graphrag-map:graph
  - rag-pattern-tree:tree
---
> [!tldr]
> When one retrieval pass is not enough, let the system retrieve iteratively, judge its own evidence, or reason over a graph of entities. Agentic RAG puts retrieval inside an agent loop; Self-RAG, CRAG and adaptive RAG add self-checks; RAPTOR and GraphRAG answer broad questions that no single chunk can.

## Why it matters
Classic RAG answers lookups: one question, a few relevant passages. Real users also ask multi-hop questions (“which customers on the old plan filed outage tickets last month?”), global questions (“what are the main themes in these 500 interviews?”) and questions where the first search returns junk. Each needs a different architecture, and picking the wrong one either fails or costs ten times more than necessary.

## Intuition
A basic RAG system is a librarian who fetches once. An agentic one keeps going back to the stacks until the answer is supported. A graph-based one has already read everything and drawn a map of who and what is connected, so it can answer questions about the whole collection.

```mermaid id=agentic-rag-loop title="Agentic RAG searches, reads, judges the evidence and searches again until the answer is supported" caption="The loop ends when the evidence is sufficient or the budget runs out. Every iteration costs a model call." alt="Flowchart of agentic RAG: plan a search, retrieve, read and judge evidence, then answer or refine the query and search again."
flowchart LR
  Q([Question]) --> P[Plan next search]
  P --> R[Retrieve]
  R --> J{Evidence sufficient?}
  J -->|no, refine| P
  J -->|yes| A([Answer with citations])
  J -->|budget spent| S([Answer with caveats])
```

## How it works
**Agentic RAG.** Give a model search tools and let it decide when, what and where to search, read the results, and search again. This handles multi-hop questions naturally and is how [deep research systems](#deep-research) and coding agents retrieve. See [the agent loop](#agent-loop).

**Multi-hop and iterative retrieval.** Answer part one, use what you learned to search for part two. Decomposition into sub-questions can run them in parallel when they are independent. See [query understanding](#query-understanding).

**Self-checking variants.**
- **Self-RAG** (Asai et al., 2023) trains a model to decide when to retrieve and to critique whether passages support its output.
- **CRAG** (corrective RAG, Yan et al., 2024) grades retrieved documents and, when they are poor, falls back to other sources such as web search or query rewriting.
- **Adaptive RAG** picks a strategy by estimated difficulty: no retrieval, single-pass or iterative.

**Hierarchical summaries.** RAPTOR (Sarthi et al., 2024) clusters chunks and recursively summarizes the clusters into a tree, so broad questions retrieve high-level summaries while specific ones retrieve leaves.

**Graphs.** GraphRAG (Edge et al., 2024) uses a model to extract entities and relationships into a knowledge graph, detects communities of related entities, and writes a summary per community. Global questions are answered by combining community summaries. LightRAG is a lighter-weight variant. Graphs cost a lot to build and maintain, and pay off for global and relationship-heavy questions.

```viz
{"id":"graphrag-map","component":"graph","title":"GraphRAG turns entities into communities and communities into summaries that answer global questions","caption":"Illustrative. Entities extracted from documents (top) are grouped into communities (middle), each with a written summary; a global question combines the summaries (bottom).","alt":"Layered graph from extracted entities to community summaries to a global answer.","data":"illustrative","per_row":4,"node_w":150,"nodes":[{"id":"acme","label":"Acme Corp"},{"id":"atlas","label":"Project Atlas"},{"id":"dana","label":"Dana, PM"},{"id":"north","label":"Vendor Northwind"},{"id":"outage","label":"Q3 outage"},{"id":"pg","label":"Postgres migration"},{"id":"c1","label":"Community: Atlas delivery","link":"#advanced-rag"},{"id":"c2","label":"Community: infrastructure risk"},{"id":"global","label":"Global answer: main delivery risks"}],"edges":[["acme","c1"],["atlas","c1"],["dana","c1"],["north","c2"],["outage","c2"],["pg","c2"],["c1","global"],["c2","global"]]}
```

## In practice
Match the architecture to the question type:

```viz
{"id":"rag-pattern-tree","component":"tree","title":"The question type, not the hype, picks the architecture","caption":"Expand the question type you see most. Start with the simplest pattern that handles it and measure before adding complexity.","alt":"Decision tree mapping question types to RAG architectures: basic RAG, agentic RAG, CRAG-style fallback, RAPTOR and GraphRAG.","data":"illustrative","open":1,"root":{"label":"What kind of question is it?","children":[
{"label":"A lookup: one fact or passage","children":[{"label":"Basic RAG with hybrid search and reranking","link":"#rag-fundamentals"}]},
{"label":"Multi-hop: facts that depend on each other","children":[{"label":"Agentic or iterative retrieval with a step budget","link":"#agent-loop"}]},
{"label":"Often returns poor results","children":[{"label":"Grade the evidence and fall back (CRAG-style): rewrite, widen or search elsewhere"}]},
{"label":"Broad: “what are the themes?”","children":[{"label":"Hierarchical summaries (RAPTOR) or community summaries (GraphRAG)"}]},
{"label":"Relationships: who is connected to what","children":[{"label":"A knowledge graph, built from extraction or existing structured data"}]},
{"label":"Needs a long report","children":[{"label":"A deep research system","link":"#deep-research"}]}]}}
```

Cost and reliability rules:
- **Budget iterations.** Agentic retrieval should cap searches and tokens per question.
- **Keep evidence explicit.** Pass forward short notes with citations, not raw pages. See [context engineering](#context-engineering).
- **Precompute what you can.** Summaries and graphs are built offline; keep them fresh as documents change.
- **Evaluate per question type.** A system that improves global questions can regress lookups.

## Numbers to know
> [!number]
> Rules of thumb. Each agentic retrieval iteration adds a model call and a search, often a second or more; cap them at a handful for interactive use. Building a GraphRAG index requires a model pass over every chunk, so its indexing cost is many times that of embedding alone.

## Pitfalls and anti-patterns
> [!pitfall] GraphRAG for lookups
> Building and maintaining a knowledge graph to answer “what is the refund window?” costs far more than hybrid search and reranking, and is no better.

- **Unbounded agentic loops.** A model unsure of its evidence will search forever.
- **Stale precomputed summaries.** Community and tree summaries drift as documents change.
- **No per-type evaluation.** Averages hide which question types got worse.

## Talk like an expert
The vocabulary: **agentic RAG**, **multi-hop retrieval**, **iterative retrieval**, **Self-RAG**, **CRAG**, **adaptive RAG**, **RAPTOR**, **GraphRAG**, **community summaries**, **local versus global questions**. Experts classify questions before choosing an architecture and reserve graphs for global and relationship questions. The live debate is whether agentic search over a plain index makes most precomputed structures unnecessary.

> [!hottake] Agentic retrieval over a good hybrid index beats most fancy RAG architectures.
> **The counterargument:** for global questions over large corpora, an agent would have to read everything at query time, which precomputed summaries and graphs avoid; some questions need work done in advance.

## Check yourself
```quiz
advanced-rag
```

## Go deeper
- Asai et al., “Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection” (2023).
- Yan et al., “Corrective Retrieval Augmented Generation” (2024).
- Sarthi et al., “RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval” (2024).
- Edge et al., “From Local to Global: A Graph RAG Approach to Query-Focused Summarization” (2024).

## Related
- [RAG fundamentals](#rag-fundamentals)
- [Deep research systems](#deep-research)
- [Query understanding](#query-understanding)
- [Planning and reasoning strategies](#planning-reasoning)
- [The agent loop](#agent-loop)
