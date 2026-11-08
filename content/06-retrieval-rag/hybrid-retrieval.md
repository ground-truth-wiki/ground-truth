---
id: hybrid-retrieval
book: 6
order: "6.7"
title: Lexical and hybrid retrieval
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [bm25, hybrid, rrf, splade]
visuals:
  - rrf-explorer:explorer
  - keyword-vector-compare:compare
---
> [!tldr]
> Keyword search finds exact terms, identifiers and rare words; vector search finds paraphrases. Run both and fuse the rankings, usually with reciprocal rank fusion, and you beat either alone on the mix of queries real users send.

## Why it matters
Every embedding model blurs something: product codes, error messages, names, acronyms, version numbers. Every keyword index misses something: synonyms, paraphrases, questions phrased unlike the answer. Users send both kinds of query, often in the same session. Hybrid retrieval is the cheapest robust fix, and it is the default in most production RAG systems.

## Intuition
Two librarians search for your request. One reads the catalog literally and finds every book with the exact words. The other understands what you mean and finds books that say it differently. Ask both and trust the books both recommend.

```viz
{"id":"rrf-explorer","component":"explorer","model":"rrf","title":"Documents that rank well on both lists rise to the top, even if neither list put them first","caption":"Illustrative ranked lists for one query. Move the weights to favor keywords or vectors, and the constant k to change how much first place matters.","alt":"Table of documents with keyword and vector ranks and their fused RRF scores, updated as k and weights change.","data":"illustrative","try":"Set k to 1 and see the first-place documents pull ahead; set it to 100 and consensus wins."}
```

## How it works
**BM25.** The classic lexical ranking function scores a document by how often query terms appear in it (with diminishing returns), how rare those terms are across the corpus (inverse document frequency), and its length relative to the average. It needs no training, handles rare terms superbly and runs on any search engine. Robertson and Zaragoza’s 2009 survey, “The Probabilistic Relevance Framework: BM25 and Beyond”, is the standard reference.

**When keywords win.** Exact identifiers (`ERR_CONN_RESET`, `SKU-4821`), names, acronyms, code symbols, legal citations and any term the embedder never learned. Also very short queries, where an embedding has little to work with.

**When vectors win.** Paraphrases (“money back” for “refund”), questions phrased unlike the answer, other languages, and conceptual queries.

**Learned sparse retrieval.** Models such as SPLADE expand documents and queries into weighted vocabulary terms, keeping inverted-index speed while learning synonyms. A strong middle ground when you can run the model.

**Reciprocal rank fusion.** Merge ranked lists using only ranks:

```math
\mathrm{RRF}(d) = \sum_{r \in \text{rankers}} \frac{w_r}{k + \mathrm{rank}_r(d)}
```

Cormack et al. (2009) used k = 60 and equal weights. Because only ranks matter, BM25 scores and cosine similarities never need to be calibrated against each other. A smaller k rewards first places more; a larger k rewards agreement.

**Weighted score fusion.** Normalize scores (for example min-max per query) and combine with tuned weights. It can beat RRF when you have labeled data to tune on, and is more fragile when score distributions shift.

## In practice
Each method has queries it is blind to:

```viz
{"id":"keyword-vector-compare","component":"compare","title":"Keyword search finds the error code; vector search finds the paraphrase; each misses what the other finds","caption":"Illustrative top results for two queries. Hover the marks to see which method found the right document and why.","alt":"Comparison of keyword and vector search results for an exact error-code query and a paraphrased question.","data":"illustrative","mono":false,"a":{"title":"Query 1: “ERR_CONN_RESET after upgrade”","text":"Keyword (BM25) top result: Troubleshooting ERR_CONN_RESET in proxy 4.2. Correct.\nVector top result: General network troubleshooting guide. Related, but it never mentions the error code.","mono":false},"b":{"title":"Query 2: “can I get my money back if I cancel?”","text":"Keyword (BM25) top result: Cancel a meeting invitation. Wrong: matched “cancel”.\nVector top result: Refund policy for subscription cancellations. Correct.","mono":false},"links":[{"a":"Troubleshooting ERR_CONN_RESET in proxy 4.2. Correct.","note":"Exact identifiers are where BM25 shines; embeddings blur rare tokens."},{"a":"General network troubleshooting guide.","note":"The embedding matched the topic, not the specific error."},{"b":"Cancel a meeting invitation. Wrong: matched “cancel”.","note":"Keyword matching cannot tell which sense of a word is meant."},{"b":"Refund policy for subscription cancellations. Correct.","note":"“Money back” and “refund” are close in embedding space, far apart as strings."}]}
```

A standard hybrid pipeline:

```python
# Pseudocode: hybrid retrieval with reciprocal rank fusion.
def hybrid(query, k=60, n=50, filters=None):
    lex = bm25.search(query, n=n, filters=filters)            # ids in rank order
    vec = vectors.search(embed(query), n=n, filters=filters)
    scores = {}
    for ranked in (lex, vec):
        for rank, doc_id in enumerate(ranked, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)[:n]    # then rerank
```

- **Apply the same filters to both retrievers**, or one list will contain documents the user may not see.
- **Retrieve generously** from each (dozens), fuse, then [rerank](#reranking).
- **Measure each retriever alone and fused** on labeled queries; keep hybrid only if it wins, which it usually does. See [evaluating RAG](#rag-evaluation).

## Numbers to know
> [!number]
> Facts and rules of thumb. The original RRF paper used k = 60. Retrieving 20 to 100 candidates from each retriever before fusion is a common range. Hybrid search usually helps most on corpora full of identifiers, such as code, tickets and product catalogs.

## Pitfalls and anti-patterns
> [!pitfall] Vector-only search on identifier-heavy data
> Support tickets, logs and code are full of exact tokens that embeddings blur. Add keyword search before tuning anything else.

- **Fusing raw scores.** BM25 scores and cosine similarities live on different scales; use RRF or normalize.
- **Different filters per retriever.** Leaks restricted documents or skews fusion.
- **Assuming a fixed best weight.** Query mixes change; re-check weights on fresh data.

## Talk like an expert
The vocabulary: **BM25**, **inverse document frequency**, **lexical versus dense retrieval**, **learned sparse retrieval**, **SPLADE**, **reciprocal rank fusion**, **score normalization**. Experts ask “did you try BM25?” whenever vector search misses an exact match. The live debate is whether learned sparse models make the two-index setup unnecessary; in practice many teams still run both.

> [!hottake] BM25 is still the most underrated component in RAG.
> **The counterargument:** for conversational, paraphrase-heavy queries over clean prose, dense retrieval with a good reranker can match hybrid quality with one less index to run.

## Check yourself
```quiz
hybrid-retrieval
```

## Go deeper
- Robertson and Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond” (2009).
- Cormack, Clarke and Büttcher, “Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods” (2009).
- Formal et al., “SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking” (2021).

## Related
- [Vector search](#vector-search)
- [Reranking](#reranking)
- [Query understanding](#query-understanding)
- [Embeddings](#embeddings)
- [RAG fundamentals](#rag-fundamentals)
