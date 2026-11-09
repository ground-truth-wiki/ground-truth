---
id: embeddings
book: 6
order: "6.4"
title: Embeddings
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [embeddings, mteb, matryoshka]
visuals:
  - embedding-explorer:embedding-map
  - vector-bytes:chart
  - matryoshka-chart:chart
---
> [!tldr]
> An embedding model maps text to a vector so that similar meanings sit close together. Choose one by retrieval quality on your own queries, then use your levers: dimensions, quantization, multilingual or domain models, and fine-tuning on your own pairs.

## Why it matters
Embeddings decide which passages your retriever can find. A model that does not understand your domain’s vocabulary, or a configuration that silently truncates long passages, caps recall before reranking or generation can help. Embeddings also drive the size and cost of your index, which grows with every document you add.

## Intuition
An embedding is a coordinate on a map of meaning. “Refund policy” and “money back” land near each other; “refund policy” and “VPN setup” land far apart. Search becomes finding the nearest points to your query.

```viz
{"id":"embedding-explorer","component":"embedding-map","title":"Cosine similarity ranks by direction, not distance, so the nearest point is not always the most similar","caption":"Illustrative 2D map of embedded phrases; real embeddings have hundreds of dimensions. Drag the query or use arrow keys. Switch the metric to Euclidean and watch the neighbors change.","alt":"Draggable query point among labeled phrase embeddings, with the top neighbors by cosine, dot product or Euclidean distance.","data":"illustrative","try":"Drag the query toward the origin under cosine, then switch to Euclidean.","k":3,"threshold":0.9,"query":{"x":0.55,"y":0.35,"label":"query"},"points":[{"label":"refund policy","x":0.8,"y":0.5,"group":"billing"},{"label":"charged twice","x":0.6,"y":0.55,"group":"billing"},{"label":"invoice copy","x":0.9,"y":0.2,"group":"billing"},{"label":"reset password","x":-0.6,"y":0.6,"group":"account"},{"label":"lost phone MFA","x":-0.7,"y":0.3,"group":"account"},{"label":"change email","x":-0.4,"y":0.8,"group":"account"},{"label":"app crashes","x":-0.2,"y":-0.7,"group":"technical"},{"label":"slow sync","x":0.1,"y":-0.8,"group":"technical"},{"label":"export to CSV","x":0.5,"y":-0.5,"group":"technical"}]}
```

## How it works
**Bi-encoders.** Retrieval embedders encode queries and documents separately, so documents can be embedded once at indexing time and compared with a dot product or cosine similarity at query time. Many models are trained contrastively on pairs of queries and relevant passages. See [representation learning](#representation-learning).

**Asymmetric use.** Many models expect different prefixes or modes for queries and documents. Using the wrong one quietly lowers recall; read the model card.

**Context length.** Embedders have a maximum input length; text beyond it is truncated. Long chunks can lose their ends silently. See [chunking](#chunking).

**MTEB and its limits.** The Massive Text Embedding Benchmark compares models across retrieval, clustering, classification and other tasks in many languages. Leaderboard rank is a starting shortlist, not a decision: your domain, languages, query style and document lengths matter more.

**Dimensions and Matryoshka embeddings.** Matryoshka representation learning (Kusupati et al., 2022) trains vectors so that their first dimensions already form a useful embedding. You can truncate to save memory and speed with a gradual quality loss, instead of retraining.

**Quantization.** Store vectors in int8 (4× smaller than float32) or binary (32× smaller), and rescore the top candidates with full-precision vectors to recover most of the quality.

```viz
{"id":"vector-bytes","component":"chart","type":"bar","title":"Binary vectors are 32 times smaller than float32 for the same 1,024 dimensions","caption":"Formula view: 1,024 dimensions × bytes per dimension. Multiply by your vector count for raw index size before graph overhead.","alt":"Bar chart of bytes per 1,024-dimension vector: float32 4,096, float16 2,048, int8 1,024 and binary 128.","data":"formula","categories":["float32","float16","int8","binary"],"y":{"label":"Bytes per vector","unit":"bytes","log":true},"series":[{"name":"Bytes","points":[[0,4096],[1,2048],[2,1024],[3,128]]}]}
```

**Multilingual, domain and fine-tuned models.** Multilingual embedders map languages into one space. Domain models exist for code, law, medicine and finance. Fine-tuning an embedder on a few thousand of your own query and passage pairs, including hard negatives, is often the cheapest large retrieval win.

**Multi-vector models.** Late-interaction models such as ColBERT store one vector per token and match them at query time, trading storage for precision. See [reranking](#reranking).

## In practice
Choosing and sizing:
1. **Shortlist** three or four models from MTEB that support your languages and context length.
2. **Evaluate** recall@10 and nDCG on 50 to 200 real queries with labeled relevant passages. See [evaluating RAG](#rag-evaluation).
3. **Pick dimensions** by measuring quality at truncated sizes if the model supports Matryoshka:

```viz
{"id":"matryoshka-chart","component":"chart","type":"line","title":"Matryoshka embeddings lose quality gradually when truncated; ordinary ones collapse","caption":"Illustrative curves, not measurements. Retrieval quality relative to the full 1,024 dimensions as vectors are cut down. Measure your own model before choosing a size.","alt":"Illustrative line chart of relative retrieval quality against embedding dimensions for a Matryoshka-trained model and naive truncation of an ordinary model.","data":"illustrative","x":{"label":"Dimensions kept (log scale)","log":true},"y":{"label":"Relative retrieval quality","unit":"pct","min":0,"max":1},"series":[{"name":"Matryoshka-trained","points":[[64,0.86],[128,0.92],[256,0.96],[512,0.99],[1024,1]]},{"name":"Naive truncation","points":[[64,0.45],[128,0.6],[256,0.76],[512,0.9],[1024,1]]}]}
```

4. **Quantize** for storage, and rescore the top results with full vectors.
5. **Re-embed everything** when you change models; vectors from different models are not comparable.

```python
# Pseudocode: binary search with full-precision rescoring.
candidates = index_binary.search(binarize(embed_query(q)), k=200)   # cheap, wide
scored = [(cos(embed_query(q), full_vector(c)), c) for c in candidates]
top = sorted(scored, reverse=True)[:20]                             # precise, narrow
```

## Numbers to know
> [!number]
> Formulas and rules of thumb. Bytes per vector = dimensions × bytes per dimension: 4,096 bytes for 1,024 float32 dimensions, 128 bytes binary. One million such float32 vectors is about 4 GB before index overhead. Fine-tuning on a few thousand in-domain pairs often beats switching to a larger general model.

## Pitfalls and anti-patterns
> [!pitfall] Choosing by leaderboard rank alone
> The top MTEB model may be worse on your queries, slower, and larger than you need. Measure on your own data.

- **Wrong query or document prefix.** Read the model card for asymmetric modes.
- **Silent truncation.** Chunks longer than the model’s limit lose their endings.
- **Mixing models in one index.** Scores from different embedders are incomparable.
- **Ignoring keyword search.** Embeddings blur exact identifiers. See [hybrid retrieval](#hybrid-retrieval).

## Talk like an expert
The vocabulary: **bi-encoder**, **asymmetric embedding**, **MTEB**, **Matryoshka**, **int8 and binary quantization**, **rescoring**, **hard negatives**, **multi-vector**. Experts quote recall@k on in-domain queries, not leaderboard positions. The live debate is how much embeddings matter as agents increasingly search with keywords and tools; for lookup-style RAG they still dominate quality.

> [!hottake] Fine-tuning your embedder is the most underused lever in RAG.
> **The counterargument:** it requires labeled pairs, re-embedding the corpus and ongoing maintenance as content shifts; hybrid search plus a good reranker often closes most of the gap with no training.

## Check yourself
```quiz
embeddings
```

## Go deeper
- Kusupati et al., “Matryoshka Representation Learning” (2022).
- Muennighoff et al., “MTEB: Massive Text Embedding Benchmark” (2022).
- Karpukhin et al., “Dense Passage Retrieval” (2020).

## Related
- [Representation learning and embeddings](#representation-learning)
- [Vector search](#vector-search)
- [Chunking](#chunking)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Evaluating RAG](#rag-evaluation)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Word embeddings: from word2vec to contextual representations](#word-embeddings)
- [Encoders, decoders and encoder-decoders](#encoders-and-decoders)
- [Multilingual and low-resource language models](#multilingual-models)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
- [Playbook: Dropbox: choosing an embedding model for multilingual file search](#dropbox-semantic-search-model-selection)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Training and fine-tuning retrievers](#training-retrievers)
