---
id: vector-index-internals
book: 6
order: "6.5.1"
title: Vector index internals
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [ann, hnsw, product-quantization, filtered-search, faiss]
visuals: []
prerequisites: [vector-search, linear-algebra]
---
> [!tldr]
> An approximate nearest neighbor index finds the stored vectors closest to a query without comparing it with all of them. It combines a way to visit few candidates, a graph or a set of clusters, with a way to store vectors compactly, quantization, and then rescores a shortlist. The one thing to remember: an index is described by a curve of recall against queries per second at a given memory budget, never by a single number, and filters, updates and deletes move that curve.

## Key ideas

- **Pick the metric, then normalize.** Faiss reports squared L2 distance, and inner-product search is not cosine similarity unless the vectors are normalized; for unit vectors ‖x − y‖² = 2 − 2⟨x, y⟩, so L2 and inner product rank results identically ([Faiss wiki, “MetricType and distances”](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances)). Without normalization you have maximum inner product search, where the norms of the stored vectors change the ranking.
- **Graph indexes.** HNSW stacks proximity graphs over nested subsets of the data, draws each point's top layer from an exponentially decaying distribution, and searches greedily from the top layer down with logarithmic complexity scaling (Malkov and Yashunin, [“Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs”](https://arxiv.org/abs/1603.09320) (2016)). DiskANN's Vamana graph keeps most of the index on SSD and serves a billion points from one machine with 64 GB of RAM ([Subramanya et al., 2019](https://papers.nips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html)), and FreshDiskANN adds real-time inserts and deletes to a graph index instead of periodic rebuilds ([Singh et al., 2021](https://arxiv.org/abs/2105.09613)).
- **Clusters, and why random hashing lost.** An IVF index assigns vectors to clusters of a coarse quantizer and visits only `nprobe` of them per query; the usual recommendation sets the number of clusters proportional to √N, which the Faiss authors call a rough approximation. Locality-sensitive hashing partitions space with random projections, and the same authors note that it is not data-adaptive and that random partitioning is significantly outperformed by data-aware partitioning (Douze et al., [“The Faiss library”](https://arxiv.org/abs/2401.08281) (2024)). On GPUs, a k-selection design that runs at up to 55% of theoretical peak speeds up brute-force, approximate and product-quantized search alike (Johnson et al., [“Billion-scale similarity search with GPUs”](https://arxiv.org/abs/1702.08734) (2017)).
- **Compression, then rescoring.** Product quantization splits a vector into sub-vectors and quantizes each separately, and Faiss IVF indexes by default encode each vector's residual from its cluster centroid, which is generally more accurate ([Douze et al., 2024](https://arxiv.org/abs/2401.08281)); ScaNN's anisotropic loss penalizes the error parallel to a data point more than the orthogonal error, because inner-product search cares about the top scores, not average reconstruction ([Guo et al., 2019](https://arxiv.org/abs/1908.10396)), and RaBitQ stores a D-dimensional vector as D bits with a theoretical error bound ([Gao and Long, 2024](https://arxiv.org/abs/2405.12497)). A compressed search then fetches more candidates than needed and rescores them with full vectors: in tests by Shakir, Aarsen and Lee, binary embeddings with rescoring kept up to about 96% of retrieval performance for one model, and binary quantization worked much better for some models than for others ([“Binary and Scalar Embedding Quantization for Significantly Faster & Cheaper Retrieval”](https://huggingface.co/blog/embedding-quantization) (2024)).
- **Filtered search.** Pre-filtering scans every vector that passes the filter, which scales poorly, and post-filtering must widen the search because the nearest neighbors may fail the filter; ACORN builds a denser HNSW graph without knowing the filters in advance, searches the subgraph of points that pass, and reports 2 to 1,000 times higher throughput at fixed recall than prior methods (Patel et al., [“ACORN: Performant and Predicate-Agnostic Search Over Vector Embeddings and Structured Data”](https://arxiv.org/abs/2403.04871) (2024)).
- **Reading benchmarks.** ANN-Benchmarks sweeps each algorithm's parameters and plots quality against performance, and found that very different approaches reach comparable trade-offs (Aumüller et al., [“ANN-Benchmarks”](https://arxiv.org/abs/1807.05614) (2018)). The NeurIPS'21 billion-scale challenge ranked entries by recall at a fixed query throughput, in separate tracks for limited DRAM, limited DRAM plus SSDs, and specialized hardware ([Simhadri et al., 2022](https://arxiv.org/abs/2205.03763)).

## Planned visuals

- **`stepper`:** an HNSW query descending the layers, one frame per hop, with the candidate list (`ef_search`) shown beside the graph, then the same query under a selective filter, showing how the subgraph of passing points can fall apart.
- **`explorer`:** recall against queries per second for flat, HNSW, IVF and IVF-PQ, with sliders for `nprobe`, `ef_search` and the rescoring depth, labeled illustrative unless fed with measured data.
- **`compare`:** one vector stored as float32, int8, product-quantization codes and binary bits, with bytes per vector and what rescoring recovers.

## Talk like an expert

Experts say “recall@10 at what QPS and what memory?”, and they name an index by its parts: the coarse quantizer, the graph or inverted lists, the code (PQ, scalar or binary) and the refinement step. They ask about filter selectivity, deletes and rebuild cost before they ask about peak speed.

## Go deeper

- Douze et al., [“The Faiss library”](https://arxiv.org/abs/2401.08281) (2024).
- Malkov and Yashunin, [“Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs”](https://arxiv.org/abs/1603.09320) (2016).
- Subramanya et al., [“DiskANN: Fast Accurate Billion-point Nearest Neighbor Search on a Single Node”](https://papers.nips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html) (2019).
- Patel et al., [“ACORN: Performant and Predicate-Agnostic Search Over Vector Embeddings and Structured Data”](https://arxiv.org/abs/2403.04871) (2024).

## Related

- [Vector search](#vector-search)
- [Vector databases and search engines](#vector-databases)
- [Embeddings](#embeddings)
- [Linear algebra for AI](#linear-algebra)
- [Quantization](#quantization)
