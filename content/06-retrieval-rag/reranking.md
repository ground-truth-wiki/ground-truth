---
id: reranking
book: 6
order: "6.9"
title: Reranking
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [reranking, cross-encoder, colbert]
visuals:
  - rerank-before-after:compare
  - rerank-latency:calculator
  - two-stage-funnel:diagram
---
> [!tldr]
> A reranker reads each candidate together with the query and reorders them far more accurately than first-stage search can. Retrieve wide for recall, rerank narrow for precision; it is the cheapest large quality gain in most RAG systems, if you can afford tens to hundreds of milliseconds.

## Why it matters
First-stage retrievers compress every document into a vector or a bag of words before the query is known, so they rank coarsely. The passage that answers the question often sits at rank 10 or 20, below plausible-looking neighbors. The generator sees only the top few, so getting the right passage from rank 14 to rank 1 is often the difference between a right and a wrong answer.

## Intuition
First-stage search is skimming titles in a library catalog to pull fifty books off the shelf. Reranking is actually opening each book to the relevant page and deciding which five to put on the reader’s desk.

```viz
{"id":"two-stage-funnel","component":"diagram","title":"Cheap search narrows millions to dozens; an expensive reranker narrows dozens to a handful","caption":"The two-stage design: each stage is as expensive per item as its budget allows. Click a stage for its chapter.","alt":"Funnel diagram from a corpus of a million chunks through hybrid retrieval to 50 candidates, reranking to 8, and generation.","data":"illustrative","w":600,"h":90,"nodes":[{"id":"corpus","label":"1M chunks","sub":"the corpus","role":"data","x":0,"y":16,"w":130,"h":58},{"id":"ret","label":"Retrieve 50","sub":"BM25 + vectors","role":"tool","x":157,"y":16,"w":130,"h":58,"link":"#hybrid-retrieval"},{"id":"rr","label":"Rerank to 8","sub":"cross-encoder","role":"model","x":314,"y":16,"w":130,"h":58},{"id":"gen","label":"Generate","sub":"answer, cite","role":"model","x":470,"y":16,"w":130,"h":58,"link":"#grounding-citations"}],"edges":[{"from":"corpus","to":"ret"},{"from":"ret","to":"rr"},{"from":"rr","to":"gen"}]}
```

## How it works
**Cross-encoders.** The query and a candidate passage go through a transformer together, so every query token can attend to every passage token, and the model outputs a relevance score. Accurate, but it must run once per candidate at query time, so it is used on tens to hundreds of candidates, never the whole corpus.

**Late interaction.** ColBERT (Khattab and Zaharia, 2020) stores a vector per token for every document and, at query time, matches each query token to its best document token. Better than single-vector retrieval, cheaper than cross-encoders, at a large storage cost.

**LLM rerankers.** Ask a general model to score candidates or to order a list. Flexible (they can follow instructions such as “prefer the newest policy”) and expensive; listwise prompts suffer from position bias, so randomize order or score pointwise. See [LLM-as-judge](#llm-as-judge).

**Hosted and open rerankers.** Several providers offer reranking APIs, and strong open cross-encoder models exist; evaluate them on your own queries.

```viz
{"id":"rerank-before-after","component":"compare","title":"The passage that answers the question moves from rank 14 to rank 1","caption":"Illustrative ranked lists for “Can contractors use the VPN from personal laptops?”. Hover the marks.","alt":"Comparison of a first-stage ranked list and the same candidates after cross-encoder reranking.","data":"illustrative","a":{"title":"First stage (hybrid search)","text":"1. VPN setup guide for employees\n2. Contractor onboarding checklist\n3. Laptop refresh program\n4. VPN troubleshooting FAQ\n...\n14. Device policy: contractors may use personal\n    devices only through the virtual desktop"},"b":{"title":"After reranking","text":"1. Device policy: contractors may use personal\n   devices only through the virtual desktop\n2. Contractor onboarding checklist\n3. VPN setup guide for employees\n4. VPN troubleshooting FAQ"},"links":[{"a":"14. Device policy: contractors may use personal","b":"1. Device policy: contractors may use personal","note":"The cross-encoder reads the passage with the question and recognizes the direct answer."},{"a":"1. VPN setup guide for employees","b":"3. VPN setup guide for employees","note":"High keyword and vector similarity, but it does not answer the question about contractors."},{"a":"3. Laptop refresh program","note":"Dropped below the cut: topically close, irrelevant to the question."}]}
```

## In practice
Rerank within a latency budget:

```viz
{"id":"rerank-latency","component":"calculator","title":"Reranking cost scales with candidates divided by batch size","caption":"Enter your own measurements. Defaults are illustrative. Halving the candidates or doubling the batch size roughly halves reranking time.","alt":"Calculator for reranking latency from candidate count, batch size and time per batch, plus retrieval time.","data":"formula","outputs":[{"id":"batches","label":"Batches","expr":"ceil(candidates / batch_size)","unit":"count"},{"id":"rerank_ms","label":"Reranking time","expr":"batches * ms_per_batch","unit":"ms"},{"id":"total_ms","label":"Retrieval plus reranking","expr":"retrieval_ms + rerank_ms","unit":"ms","main":true}],"inputs":{"candidates":50,"batch_size":16,"ms_per_batch":40,"retrieval_ms":30},"input_meta":{"candidates":{"label":"Candidates to rerank"},"batch_size":{"label":"Batch size"},"ms_per_batch":{"label":"Time per batch","unit":"ms, measured"},"retrieval_ms":{"label":"First-stage retrieval","unit":"ms"}},"assumptions":["Batches run sequentially on one device; parallel workers divide the time.","Time per batch depends on passage length and model size; measure it."],"tests":[{"inputs":{},"expect":{"batches":4,"rerank_ms":160,"total_ms":190}},{"inputs":{"candidates":20},"expect":{"batches":2,"rerank_ms":80,"total_ms":110}}]}
```

Practical rules:
- **Retrieve 20 to 100, keep 5 to 10.** Measure where recall stops improving.
- **Rerank against the condensed question**, not the expanded variants. See [query understanding](#query-understanding).
- **Truncate passages** to the reranker’s input limit deliberately, keeping titles and the most relevant part.
- **Cache** reranker scores for repeated query and passage pairs.
- **Evaluate with nDCG and recall@k** before and after reranking. See [evaluating RAG](#rag-evaluation).

## Numbers to know
> [!number]
> Rules of thumb. Cross-encoder reranking of a few dozen short passages typically takes tens to a few hundred milliseconds on a GPU, more on CPU. Reranking usually improves the precision of the top few results substantially; if it does not, check whether the right passage was retrieved at all.

## Pitfalls and anti-patterns
> [!pitfall] Reranking candidates that never contained the answer
> A reranker can only reorder what retrieval returned. Check recall@k of the first stage before blaming the reranker.

- **Reranking too few candidates.** The right passage is often below rank 10.
- **LLM listwise reranking without bias control.** Position bias reshuffles results by order, not relevance.
- **Ignoring latency at the tail.** Long passages and large batches spike p99.

## Talk like an expert
The vocabulary: **cross-encoder**, **bi-encoder**, **late interaction**, **ColBERT**, **pointwise, pairwise and listwise reranking**, **two-stage retrieval**, **candidate depth**. Experts say “retrieve for recall, rerank for precision” and tune the candidate depth with data. The live debate is whether long-context models make reranking unnecessary by reading all candidates; cost, latency and distraction keep reranking in most pipelines.

> [!hottake] If you add one thing to a basic RAG system, add a reranker.
> **The counterargument:** if retrieval recall is low, a reranker cannot help; for many systems, hybrid search or better chunking is the first fix and reranking the second.

## Check yourself
```quiz
reranking
```

## Go deeper
- Nogueira and Cho, “Passage Re-ranking with BERT” (2019).
- Khattab and Zaharia, “ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT” (2020).

## Related
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Embeddings](#embeddings)
- [Evaluating RAG](#rag-evaluation)
- [RAG fundamentals](#rag-fundamentals)
- [LLM-as-judge done right](#llm-as-judge)
- [Recommender systems](#recommender-systems)
- [Encoders, decoders and encoder-decoders](#encoders-and-decoders)
- [Playbook: Intercom Fin: a fine-tuned embedding model and an in-house reranker](#intercom-fin-retrieval)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Learning to rank](#learning-to-rank)
