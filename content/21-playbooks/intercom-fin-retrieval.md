---
id: intercom-fin-retrieval
book: 21
order: "21.21"
title: "Intercom Fin: a fine-tuned embedding model and an in-house reranker"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [customer-support, rag, reranking, embeddings, fine-tuning, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (customer support)"
use_case: "Retrieving and ranking knowledge-base passages for Fin, an AI agent that answers customer support questions with RAG"
outcome: "Statistically significant rise in resolution rate (p < 0.01) in production A/B tests for both changes, effect sizes withheld; reranking costs reduced by 80%"
measured_how: "Resolution rate in production A/B tests (a two-arm, 1.5M-conversation test for the reranker; no sample or period stated for the embedding tests), plus internal offline benchmarks (Intercom, two Fin research posts, 11 September 2025)"
prerequisites: [rag-fundamentals, reranking]
replications: []
---
> [!tldr]
> For Fin, its customer support AI agent, Intercom fine-tuned an open embedding model on its own support data and replaced Cohere Rerank-v3.5 with Fin-cx-reranker, its own ModernBERT-based model. Both changes brought a statistically significant improvement in resolution rate in production A/B tests, with effect sizes unpublished, and the reranker "reduced reranking costs by 80%".

> [!note] From the public record
> Built from Intercom's own published accounts, "How We Built a World-Class Reranker for Fin" (September 2025) and "Finetuning Retrieval for Fin" (September 2025), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Fin answers support questions with retrieval-augmented generation. It summarizes the conversation into "a short, focused query", fetches 40 candidate passages by embedding similarity, reranks them, and keeps the top-ranked passages for the answer.

Reranking ran on Cohere Rerank-v3.5, a commercial reranker "offering high-quality results but incurring substantial costs". Retrieval used bge-large-en-v1.5 for English and multilingual-e5-base for multilingual content, adopted about a year before the post. Switching embedding models is expensive: "Each change would require recomputing embeddings for over 300 million documents", and each needs a time-consuming production A/B test.

## Why this approach

**Reranker.** Open-source models (BGE-large and BGE-m3) "couldn’t achieve required performance levels", and an LLM-based reranker "caused latency issues". So the team built its own reranker for English customer support, to "match or exceed Cohere’s quality, run efficiently on standard GPUs, and reduce vendor dependency". See [Reranking](#reranking).

**Embedding model.** The team benchmarked a shortlist of models on its own data, because in its experience the top model on general benchmarks such as MTEB "doesn’t always lead to good performance on domain-specific use cases like Fin". Voyage-Large-3 scored best but is closed-weight and cannot be fine-tuned. Stella 1.5B and Stella 400M led the open-weight models, but Stella's non-standard architecture "lacks support for training and inference tools in our stack". Snowflake Arctic 2 (568M parameters) became the base: it balanced performance and practicality, uses the XLM-RoBERTa architecture, and is multilingual. See [Training and fine-tuning retrievers](#training-retrievers).

## The approach

1. **Reranker.** Fin-cx-reranker scores each query and passage pair with ModernBERT-large, mean pooling and a linear layer. It was trained on 400,000 real Fin queries, each with 40 candidate passages, 16M pairs in total, with labels from an LLM-based pointwise reranker and a RankNet loss. See [Learning to rank](#learning-to-rank).
2. **Embedding training data.** The team mined ~2 million real user queries from logs of an earlier experiment in which an LLM scored retrieved passages. Hard positives were documents Fin used and the LLM scored high; hard negatives were documents Fin did not use and the LLM scored low. Only apps that allow training on their data were included.
3. **Embedding fine-tuning.** InfoNCE loss with 1 hard positive and 4 hard negatives, 2 epochs, effective batch size 256, AdamW, starting learning rate 1e-5 with linear decay.

## The stack

As of September 2025, as the posts name it: semantic search only, with no hybrid search or BM25; bge-large-en-v1.5 and multilingual-e5-base in production, tested against a fine-tuned Snowflake Arctic 2 (snowflake-arctic-embed-l-v2.0) running with the Text Embeddings Inference (TEI) toolkit; fine-tuning on Intercom's own AWS infrastructure; Fin-cx-reranker on ModernBERT-large with Hugging Face Transformers. The reranker's teacher LLM is not named.

## Results, and how they were measured

- **Reranker, offline.** On FinRank-en-v1 (3,000 real English queries from 1k+ customer apps, ideal rankings from a two-stage LLM oracle), MAP went from 0.521 for Cohere Rerank-v3.5 to 0.612 (+17.5 %), NDCG@10 from 0.570 to 0.665 (+16.7 %), Recall@10 from 0.636 to 0.720 (+13.1 %) and Kendall tau from 0.326 to 0.400 (+22.7 %).
- **Reranker, backtest.** On 1,500 recent conversations from 685 apps, Precision @1500 tok was 0.239 ± 0.004 for Cohere and 0.254 ± 0.005 for Fin-cx-reranker; Recall @1500 tok was 0.677 ± 0.010 and 0.698 ± 0.010.
- **Reranker, online.** "We ran a two-arm, 1.5M-conversation A/B test, resulting in no change in latency (P50 ≈150 ms)", with "a statistically significant improvement in Resolution Rate over Cohere Rerank‑v3.5 (p < 0.01)".
- **Embedding model, offline.** On the in-domain benchmark (~3,000 user queries, all languages), precision rose from 45.60% for base Snowflake Arctic 2 to 72.31%, and Recall@5 from 86.80% to 96.45%: "precision increased by around 30 points, and Recall@5 increased by 10 points". BGE Large, the English production model, scored 33.20% and 78.00% in the earlier comparison, which did not include multilingual-e5-base. On out-of-distribution apps, precision went from 40.69% to 65.25%.
- **Embedding model, online.** Two A/B tests, English-only and non-English, compared it with the production setup. Resolution rate, "the percentage of conversations Fin resolved without human intervention", was the primary metric and answer sent rate the secondary. "We saw statistically significant improvements in both metrics (with p-value < 0.01)", in both tests. Fin cited more documents, and "Other key metrics such as cost and latency remained stable".

**Not measured:** neither post gives the resolution-rate effect sizes (withheld "for competitive reasons"), test durations, traffic in the embedding tests, absolute costs or how the 80% was calculated. The reranker benchmark's ideal rankings came from a two-stage LLM oracle, with Fin's cited passages moved to the top for confirmed resolutions. Neither post reports a human review of LLM-made labels.

## What failed

- **Earlier reranker options.** BGE-large and BGE-m3 fell short, and the LLM-based reranker "caused latency issues".
- **Voyage-Large-3 in production.** The team tried it as a stronger baseline, "however we had trouble scaling that model for our use case", and then focused on models under 1B parameters.
- **Out-of-distribution data.** "Performance on the out-of-distribution dataset was lower than on the in-domain benchmark, as expected", for all models.
- **Scope.** The reranker covers English only.

## What the team would do differently

Neither post says what the team would redo. The reranker post names next steps, "refining label quality by re-annotating with stronger models, and extending our reranker beyond English", and concludes that "targeted, domain-specific models can indeed outperform top commercial solutions".

The wiki's reading:

- **Keep the LLM out of the request path.** Both posts turn LLM relevance judgments into training labels for smaller models that serve live traffic.
- **Let the online test carry the claim.** Much of the offline ground truth comes from LLMs, so the resolution-rate A/B tests are the stronger evidence. See [Online controlled experiments for AI features](#online-experiments).
- **Price in re-indexing.** A new embedding model means re-embedding the corpus; a new reranker does not. See [Embeddings](#embeddings).

## Disclosure

None.

## Sources

- Ramil Yarullin, Intercom, [“How We Built a World-Class Reranker for Fin”](https://fin.ai/research/how-we-built-a-world-class-reranker-for-fin/), Fin research (fin.ai/research), 11 September 2025.
- Dhruv Patel, Intercom, [“Finetuning Retrieval for Fin”](https://fin.ai/research/finetuning-retrieval-for-fin), Fin research (fin.ai/research), 11 September 2025.

## Related

- [About playbooks](#about-playbooks)
- [Reranking](#reranking)
- [Training and fine-tuning retrievers](#training-retrievers)
- [Evaluating RAG](#rag-evaluation)
- [Customer-support and enterprise workflow agents](#support-agents)
