---
id: graph-rag
book: 6
order: "6.10.2"
title: Graph RAG methods
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [graph-rag, community-detection, multi-hop, knowledge-graphs, query-focused-summarization]
visuals: []
prerequisites: [advanced-rag]
---
> [!tldr]
> Graph RAG methods build or reuse a graph of entities and relations, so that retrieval can follow connections between facts or summarize a whole corpus, two jobs that chunk-by-chunk similarity search does poorly. The family runs from Microsoft's GraphRAG, which precomputes community summaries for corpus-wide questions, to variants that defer or shrink that work (LazyGraphRAG, LightRAG) and graph walks for multi-hop questions (HippoRAG). Remember that building the graph is the expensive part, and that many reported wins rest on LLM-judged win rates: measure on your own global and local questions before you pay for one.

## Key ideas

- **Three stages.** A survey of the field formalizes the workflow in three stages, graph-based indexing, graph-guided retrieval and graph-enhanced generation: how the graph is built or chosen, how retrieval uses it, and how the answer is generated from what was retrieved. The graph either comes from an existing [knowledge graph](#knowledge-graphs) or is constructed from your own data, such as documents ([Peng et al., “Graph Retrieval-Augmented Generation: A Survey” (2024)](https://arxiv.org/abs/2408.08921)).
- **GraphRAG: extract, cluster, summarize, then query.** GraphRAG splits the corpus into text units, extracts entities, relationships and claims from each with an LLM, clusters the graph hierarchically with the Leiden algorithm, and writes a report for every community from the bottom up; global search answers corpus-wide questions from those reports, local search starts from entities and their neighbors, DRIFT starts from the community reports most relevant to the question, drafts an answer with follow-up questions, and refines it with local searches, and basic search is plain top-k vector RAG ([Microsoft GraphRAG documentation](https://microsoft.github.io/graphrag/), [DRIFT search](https://microsoft.github.io/graphrag/query/drift_search/)). In the original paper, each community summary yields a partial answer and the partial answers are summarized into the final one ([Edge et al., “From Local to Global: A Graph RAG Approach to Query-Focused Summarization” (2024)](https://arxiv.org/abs/2404.16130)).
- **Indexing is the bill.** The GraphRAG README warns that indexing “can be an expensive operation”, says to start small, and strongly recommends tuning its prompts to your data ([microsoft/graphrag](https://github.com/microsoft/graphrag)); as of November 2026, its docs estimate graph extraction at roughly 75% of indexing cost and offer FastGraphRAG, which extracts noun phrases with NLP libraries instead of an LLM and is much cheaper but gives a noisier graph ([GraphRAG indexing methods](https://microsoft.github.io/graphrag/index/methods/)). LazyGraphRAG does no summarization before query time: Microsoft reports indexing costs identical to vector RAG and 0.1% of full GraphRAG, and a single parameter, the relevance test budget, controls the trade-off between cost and quality ([Microsoft Research blog, “LazyGraphRAG: Setting a new standard for quality and cost” (November 2024)](https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/)).
- **Lighter graphs, graph walks and trees.** LightRAG combines low-level retrieval of specific entities and their relationships with high-level retrieval of broader topics and themes, pulls in the one-hop neighbors of what it retrieves, and adds a new document by merging its nodes and edges into the existing graph instead of rebuilding it ([Guo et al., “LightRAG: Simple and Fast Retrieval-Augmented Generation” (2024)](https://arxiv.org/abs/2410.05779v3)); HippoRAG links the entities in a question to graph nodes and runs Personalized PageRank from them, and its single retrieval step matched or beat iterative IRCoT retrieval on multi-hop QA while being 10 to 20 times cheaper and 6 to 13 times faster ([Gutiérrez et al., “HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models” (NeurIPS 2024)](https://papers.nips.cc/paper_files/paper/2024/hash/6ddc001d07ca4f319af96a3024f6dbd1-Abstract-Conference.html), [method](https://arxiv.org/html/2405.14831)). RAPTOR is the non-graph alternative: it recursively embeds, clusters and summarizes chunks into a tree, so a question can retrieve at the level of detail it needs ([Sarthi et al., “RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval” (2024)](https://arxiv.org/abs/2401.18059)).
- **Graphs you already have.** When the facts already live in a graph database, retrieval can translate the question into a graph query: as of November 2026, the Neo4j GraphRAG library's Text2CypherRetriever turns a question into Cypher and passes the results to the LLM, and its guide warns that the generated query “is not guaranteed to be syntactically correct” ([neo4j-graphrag-python user guide](https://neo4j.com/docs/neo4j-graphrag-python/current/user_guide_rag.html)). Modeling and querying such graphs is covered in [Knowledge graphs and ontologies](#knowledge-graphs).
- **Evaluate per question type, and distrust bare win rates.** GraphRAG was evaluated with 125 LLM-generated global questions per corpus and an LLM judge comparing answer pairs on comprehensiveness, diversity and empowerment, with directness as a control ([Edge et al., 2024](https://arxiv.org/html/2404.16130v2)); a later study reported that such generated questions are often only loosely tied to the source text and that the judging shows position, length and trial biases; with an unbiased procedure, it measured gains “much more moderate than reported previously” ([Zeng et al., “How Significant Are the Real Performance Gains? An Unbiased Evaluation Framework for GraphRAG” (2025)](https://arxiv.org/abs/2506.06331)). Test global and local questions separately, swap answer order, repeat trials, and budget for keeping the graph current: as of November 2026, GraphRAG's CLI has an `update` command for an existing index ([GraphRAG CLI](https://microsoft.github.io/graphrag/cli/)).

## Planned visuals

- **`stepper`:** the GraphRAG pipeline on a small illustrative corpus: text units, entity and relationship extraction, the graph, Leiden communities at two levels, community reports, and a final frame where a global question collects partial answers from the reports.
- **`compare`:** the same corpus answering one global and one local question, highlighting what each query mode reads: community reports for global search, an entity neighborhood for local search, and both for DRIFT.
- **`tree`:** a decision tree from question type and corpus change rate to an approach: hybrid search with reranking, RAPTOR, GraphRAG global search, LazyGraphRAG, LightRAG, HippoRAG or text-to-Cypher over an existing graph.

## Talk like an expert

Experts separate **local questions** about specific entities from **global** or **sensemaking questions** about a whole corpus, and talk about text units, community reports, Leiden levels, Personalized PageRank, and indexing cost versus query-time cost. They ask what a graph adds over [hybrid retrieval](#hybrid-retrieval) inside an agent loop, and they read a win rate only after checking for position swaps, length control and repeated trials ([LLM-as-judge](#llm-as-judge)).

## Go deeper

- Edge et al., [“From Local to Global: A Graph RAG Approach to Query-Focused Summarization”](https://arxiv.org/abs/2404.16130) (2024).
- Peng et al., [“Graph Retrieval-Augmented Generation: A Survey”](https://arxiv.org/abs/2408.08921) (2024).
- Gutiérrez et al., [“HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models”](https://papers.nips.cc/paper_files/paper/2024/hash/6ddc001d07ca4f319af96a3024f6dbd1-Abstract-Conference.html) (NeurIPS 2024).
- [Microsoft GraphRAG documentation](https://microsoft.github.io/graphrag/), including the prompt tuning guide.

## Related

- [Advanced RAG architectures](#advanced-rag)
- [Knowledge graphs and ontologies](#knowledge-graphs)
- [Evaluating RAG](#rag-evaluation)
- [LLM-as-judge done right](#llm-as-judge)
- [Chunking](#chunking)
- [Deep research systems](#deep-research)
- [Playbook: RAG over a knowledge graph of support tickets at LinkedIn](#linkedin-rag-knowledge-graph-support)
