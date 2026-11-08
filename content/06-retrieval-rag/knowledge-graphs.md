---
id: knowledge-graphs
book: 6
order: "6.10.1"
title: Knowledge graphs and ontologies
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [knowledge-graphs, ontologies, rdf, property-graphs, entity-linking]
visuals: []
prerequisites: [rag-fundamentals]
---
> [!tldr]
> A knowledge graph stores facts as entities joined by typed relations, under a schema or ontology that says which kinds of things and relations exist. A vector index finds text that is similar to a query; a graph makes relations explicit, so a question about how things connect becomes a query you can run and a path you can show. The one thing to remember: turning messy text into clean, deduplicated entities and relations is a hard problem in its own right, separate from choosing a database.

## Key ideas

- **Two data models.** In RDF, a graph is a set of subject-predicate-object triples whose nodes are IRIs, literals or blank nodes ([W3C, “RDF 1.1 Concepts and Abstract Syntax”](https://w3.org/TR/rdf11-concepts/) (2014)). A property graph instead attaches labels and property-value pairs to both nodes and edges. Property graphs translate to and from directed edge-labeled graphs, the model RDF standardizes, without loss of information; the edge-labeled model is more minimal and the property graph more flexible (Hogan et al., [“Knowledge Graphs”](https://arxiv.org/abs/2003.02320v6) (2021)).
- **Query languages.** SPARQL 1.1 queries and updates RDF graphs and can delegate parts of a query to other endpoints ([W3C, “SPARQL 1.1 Overview”](https://www.w3.org/TR/sparql-overview/) (2013)). For property graphs, ISO/IEC 39075:2024, GQL, published in April 2024, standardizes a language for creating, querying and maintaining property graphs ([IEC webstore listing](https://webstore.iec.ch/publication/94107)).
- **Schemas and ontologies.** A schema defines the high-level structure of a graph, and a semantic schema defines what its terms mean ([Hogan et al., 2021](https://arxiv.org/abs/2003.02320v6)). OWL 2 is “an ontology language for the Semantic Web with formally defined meaning”, and its EL, QL and RL profiles give up some expressiveness so that reasoning stays tractable on large ontologies or on data in relational databases ([W3C, “OWL 2 Web Ontology Language Document Overview”](https://www.w3.org/TR/owl2-overview/) (2012)).
- **Public graphs.** Wikidata is a free, collaborative, multilingual knowledge base whose items (Q ids) carry statements made of properties (P ids) and values, edited by people and bots and, as of November 2026, released under a public-domain dedication ([Wikidata: Introduction](https://www.wikidata.org/wiki/Wikidata:Introduction)). Schema.org, founded by Google, Microsoft, Yahoo and Yandex, has the mission to create, maintain and promote schemas for structured data on the internet ([Schema.org](https://schema.org/)).
- **Building a graph from text.** Hogan et al. describe four core tasks: pre-processing, named entity recognition, entity linking to existing nodes (which must handle aliases and ambiguous mentions) and relation extraction ([Hogan et al., 2021, section 6.2](https://arxiv.org/abs/2003.02320v6)); BLINK links mentions by bi-encoder retrieval over short entity descriptions, then cross-encoder reranking ([Wu et al., 2019](https://arxiv.org/abs/1911.03814)). LLM extraction has its own failure modes: in the GraphRAG paper, GPT-4 extracted almost twice as many entity references from 600-token chunks as from 2,400-token chunks on a sample HotPotQA dataset, and the authors matched entities by exact string, so one entity under two spellings becomes two nodes, although they note that such duplicates usually end up in the same community for summarization (Edge et al., [“From Local to Global: A Graph RAG Approach to Query-Focused Summarization”](https://arxiv.org/abs/2404.16130) (2024)).
- **Querying, memory, and when a graph pays off.** Text-to-query works but needs care: general-purpose LLMs often write incomplete or wrong Cypher, a query language for graph databases, and fine-tuning on a cleaned set of 44,387 question-query pairs improved results ([Ozsoy et al., 2024](https://arxiv.org/abs/2412.10064)); Zep's Graphiti uses a temporally aware graph to keep the history of facts in agent memory ([Rasmussen et al., 2025](https://arxiv.org/abs/2501.13956)). GraphRAG targets global questions about a whole corpus, which conventional RAG handles poorly ([Edge et al., 2024](https://arxiv.org/abs/2404.16130)); for simple lookups, see the costs weighed in [advanced RAG](#advanced-rag) and [Graph RAG methods](#graph-rag).

## Planned visuals

- **`compare`:** the same three facts written as RDF triples and as a property graph, with linked highlights showing where each attribute lives in each model.
- **`stepper`:** text to graph: one paragraph through entity recognition, linking to Wikidata ids, relation extraction and entity resolution, ending in triples, with a frame showing a duplicate entity that exact matching misses.
- **`graph`:** a small illustrative knowledge graph in which the path that answers a two-hop question is highlighted, each node type colored and labeled.

## Talk like an expert

Experts talk about triples, IRIs, ontologies and their profiles, property graphs, entity linking and entity resolution, and they settle the schema before they choose a database. They reach for a graph when the questions are about relationships, paths and counts across entities, and they budget for extraction quality and upkeep, not only for storage.

## Go deeper

- Hogan et al., [“Knowledge Graphs”](https://arxiv.org/abs/2003.02320v6), ACM Computing Surveys (2021).
- W3C, [“RDF 1.1 Concepts and Abstract Syntax”](https://w3.org/TR/rdf11-concepts/) (2014).
- W3C, [“SPARQL 1.1 Overview”](https://www.w3.org/TR/sparql-overview/) (2013).
- W3C, [“OWL 2 Web Ontology Language Document Overview (Second Edition)”](https://www.w3.org/TR/owl2-overview/) (2012).

## Related

- [Advanced RAG architectures](#advanced-rag)
- [Graph RAG methods](#graph-rag)
- [Memory](#agent-memory)
- [Structured and code retrieval](#structured-code-retrieval)
- [Document-processing and extraction pipelines](#document-extraction)
