---
id: vector-search
book: 6
order: "6.5"
title: Vector search
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [ann, hnsw, ivf, faiss]
visuals:
  - hnsw-stepper:stepper
  - recall-latency:chart
  - index-chooser:tree
---
> [!tldr]
> Exact nearest-neighbor search compares the query with every vector, which is too slow at scale, so vector indexes approximate it. HNSW, IVF, product quantization and disk-based graphs trade a little recall for large gains in speed and memory, and you tune that trade with a few parameters.

## Why it matters
At a million vectors, brute force is still feasible; at a billion, it is not. The index you choose decides latency, memory cost and how many relevant passages you silently miss. Approximate search is also where filtering, updates and deletions get tricky, which is where many production RAG bugs live.

## Intuition
Finding the nearest café in a city by measuring the distance to every café is exact and slow. Taking the highway to the right district, then main roads to the right neighborhood, then side streets, is fast and almost always right. HNSW is that road network for vectors.

```viz
{"id":"hnsw-stepper","component":"stepper","title":"HNSW starts on a sparse top layer, moves greedily toward the query, and drops down for finer detail","caption":"A toy three-layer graph. The query lies near G. Each layer has fewer nodes and longer links than the one below; search descends from coarse to fine.","alt":"Stepper of an HNSW search descending three layers of a graph toward a query near node G.","data":"illustrative","try":"Count how many nodes the search visits compared with the eight it would check by brute force.","diagram":{"w":600,"h":200,"groups":[{"label":"Layer 2","x":0,"y":0,"w":600,"h":56},{"label":"Layer 1","x":0,"y":70,"w":600,"h":56},{"label":"Layer 0","x":0,"y":140,"w":600,"h":56}],"nodes":[
{"id":"a2","label":"A","align":"center","glyph":false,"x":80,"y":14,"w":44,"h":34},{"id":"f2","label":"F","align":"center","glyph":false,"x":440,"y":14,"w":44,"h":34},
{"id":"a1","label":"A","align":"center","glyph":false,"x":80,"y":84,"w":44,"h":34},{"id":"c1","label":"C","align":"center","glyph":false,"x":224,"y":84,"w":44,"h":34},{"id":"f1","label":"F","align":"center","glyph":false,"x":440,"y":84,"w":44,"h":34},{"id":"h1","label":"H","align":"center","glyph":false,"x":548,"y":84,"w":44,"h":34},
{"id":"a0","label":"A","align":"center","glyph":false,"x":80,"y":154,"w":44,"h":34},{"id":"b0","label":"B","align":"center","glyph":false,"x":152,"y":154,"w":44,"h":34},{"id":"c0","label":"C","align":"center","glyph":false,"x":224,"y":154,"w":44,"h":34},{"id":"d0","label":"D","align":"center","glyph":false,"x":296,"y":154,"w":44,"h":34},{"id":"e0","label":"E","align":"center","glyph":false,"x":368,"y":154,"w":44,"h":34},{"id":"f0","label":"F","align":"center","glyph":false,"x":440,"y":154,"w":44,"h":34},{"id":"g0","label":"G","role":"token","align":"center","glyph":false,"x":494,"y":154,"w":44,"h":34},{"id":"h0","label":"H","align":"center","glyph":false,"x":548,"y":154,"w":44,"h":34}],
"edges":[{"from":"a2","to":"f2","arrow":false},{"from":"a1","to":"c1","arrow":false},{"from":"c1","to":"f1","arrow":false},{"from":"f1","to":"h1","arrow":false},{"from":"a0","to":"b0","arrow":false},{"from":"b0","to":"c0","arrow":false},{"from":"c0","to":"d0","arrow":false},{"from":"d0","to":"e0","arrow":false},{"from":"e0","to":"f0","arrow":false},{"from":"f0","to":"g0","arrow":false},{"from":"g0","to":"h0","arrow":false}]},
"frames":[
{"label":"Enter","highlight":["a2"],"caption":"Search starts at the entry point on the top layer, node A, far from the query."},
{"label":"Greedy hop","highlight":["a2","f2"],"edges":["a2>f2"],"caption":"On layer 2, F is closer to the query than A, so search moves to F. No neighbor of F is closer, so this layer is done."},
{"label":"Descend","highlight":["f2","f1"],"caption":"Search drops to F on layer 1, where nodes have more, shorter links."},
{"label":"Refine","highlight":["f1","h1"],"edges":["f1>h1"],"caption":"On layer 1, H is closer to the query than F. Search moves to H and stops when no neighbor is closer."},
{"label":"Bottom layer","highlight":["h1","h0"],"caption":"Search drops to H on layer 0, which contains every vector."},
{"label":"Best neighbors","highlight":["g0","h0","f0"],"edges":["g0>h0","f0>g0"],"caption":"A local search on layer 0 keeps a candidate list of size ef. It finds G, then returns the top k: G, H and F. It visited 6 nodes instead of comparing all 8; at a billion vectors the saving is enormous."}]}
```

## How it works
**Exact versus approximate.** Flat (brute-force) search computes similarity to every vector: perfect recall, cost linear in corpus size. Approximate nearest neighbor (ANN) indexes visit a small fraction of vectors and accept that some true neighbors are missed. Measure that with **recall@k**: the fraction of the true top k that the index returns.

**HNSW** (Malkov and Yashunin, 2016) builds a multi-layer proximity graph. `M` sets links per node (more links, better recall, more memory); `ef_construction` sets build-time effort; `ef_search` sets the candidate list size at query time and is the main latency-recall knob. Fast and accurate; memory-hungry because vectors and graph live in RAM.

**IVF** (inverted file) clusters vectors with k-means and searches only the `nprobe` nearest clusters. Cheaper memory than HNSW, sensitive to cluster quality.

**Product quantization (PQ)** splits vectors into sub-vectors and replaces each with a short code, shrinking memory many times over at some accuracy cost. IVF-PQ combines both and is a FAISS staple.

**DiskANN and ScaNN.** DiskANN keeps a graph mostly on SSD for billion-scale corpora on modest memory; Google’s ScaNN uses anisotropic quantization tuned for maximum inner product search.

**Filtered search.** Real queries add filters (tenant, date, permission). Filtering after search can return too few results; filtering during graph traversal can disconnect the graph when filters are very selective. Check how your engine handles restrictive filters, and test with your real filter mix.

**Updates and deletes.** Graph indexes handle inserts well and deletions less well; many engines mark deletions and rebuild periodically. Plan for it. See [production RAG](#production-rag).

```viz
{"id":"recall-latency","component":"chart","type":"scatter","title":"Raising ef_search buys recall with latency, with sharply diminishing returns","caption":"Illustrative HNSW operating points, not measurements. Going from ef 128 to 512 roughly triples latency for about one point of recall. Benchmark your own index and data.","alt":"Illustrative scatter of recall at 10 against query latency for HNSW at ef_search values from 16 to 512.","data":"illustrative","x":{"label":"Query latency (ms, log scale)","log":true},"y":{"label":"Recall@10","unit":"pct","min":0.8,"max":1},"series":[{"name":"HNSW","points":[[0.4,0.86,"ef 16"],[0.6,0.92,"ef 32"],[1,0.96,"ef 64"],[1.8,0.985,"ef 128"],[3.4,0.994,"ef 256"],[6.5,0.998,"ef 512"]]}]}
```

## In practice
```viz
{"id":"index-chooser","component":"tree","title":"Corpus size and memory budget pick the index family","caption":"Expand by your situation. Start simple: flat search is fine longer than most teams expect.","alt":"Decision tree for choosing between flat, HNSW, IVF-PQ and disk-based vector indexes.","data":"illustrative","open":1,"root":{"label":"How many vectors, and how much memory?","children":[
{"label":"Under about a million","children":[{"label":"Flat search or HNSW; flat gives perfect recall and simple updates"}]},
{"label":"Millions, memory available","children":[{"label":"HNSW; tune ef_search for your recall target"}]},
{"label":"Hundreds of millions, memory tight","children":[{"label":"IVF-PQ or quantized vectors with rescoring"}]},
{"label":"Billions","children":[{"label":"Disk-based graphs such as DiskANN, or a managed service built for that scale","link":"#vector-databases"}]}]}}
```

Tuning procedure:
1. Compute exact top-k for a few hundred real queries with flat search: your ground truth.
2. Build the ANN index and measure recall@k and latency at several settings.
3. Pick the cheapest setting that meets your recall target at your latency budget.
4. Re-test with real filters and after large updates.

## Numbers to know
> [!number]
> Rules of thumb. HNSW graph overhead is often a sizable fraction of the vector memory, depending on `M`. Flat search over a million vectors is typically fast enough on modern hardware for moderate query rates. A recall@10 of 95% or more is a common target for RAG.

## Pitfalls and anti-patterns
> [!pitfall] Never measuring recall
> ANN indexes fail silently: they return plausible neighbors, just not all the right ones. Compare against exact search on a sample.

- **Ignoring filters in benchmarks.** Unfiltered benchmarks overstate production recall.
- **Default parameters forever.** Defaults suit someone else’s data.
- **Deletions that never happen.** Marked-deleted vectors can still surface until rebuilds.

## Talk like an expert
The vocabulary: **ANN**, **recall@k**, **HNSW**, `M`, `ef_search`, **IVF**, `nprobe`, **product quantization**, **DiskANN**, **filtered search**, **flat index**. Experts say “recall at what latency?” and treat index choice as an operations decision. The live debate is whether vector search becomes a commodity feature of every database, which much of the market suggests.

> [!hottake] Most teams would be fine with flat search and should stop tuning HNSW.
> **The counterargument:** latency and cost at real query rates, and the memory of large corpora, make approximate indexes necessary for many production systems well before a billion vectors.

## Check yourself
```quiz
vector-search
```

## Go deeper
- Malkov and Yashunin, “Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs” (2016).
- Jégou et al., “Product Quantization for Nearest Neighbor Search” (2011).
- The FAISS documentation and the ANN-Benchmarks project.

## Related
- [Embeddings](#embeddings)
- [Vector databases and search engines](#vector-databases)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Production RAG](#production-rag)
- [Linear algebra for AI](#linear-algebra)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Recommender systems](#recommender-systems)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Vector index internals](#vector-index-internals)
