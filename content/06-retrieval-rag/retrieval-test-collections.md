---
id: retrieval-test-collections
book: 6
order: "6.14.1"
title: Retrieval benchmarks and test collections
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [test-collections, trec, beir, relevance-judgments, retrieval-evaluation]
visuals: []
prerequisites: [rag-evaluation]
---
> [!tldr]
> A test collection is a fixed set of documents, queries and relevance judgments that lets you compare retrieval systems without users in the loop. TREC, BEIR and the collections that followed them work this way, and it is the right shape for the retrieval tests of your own RAG system. The one thing to remember: a score is only as good as its judgments, because unjudged documents count as not relevant, and a leaderboard rank measured on someone else's queries does not transfer to yours.

## Key ideas

- **The Cranfield paradigm.** A test collection has three parts: a set of documents, a set of information need statements called topics, and relevance judgments that say which documents are relevant to which topic; it abstracts away particular users and tasks, and doing that abstract task well is, in Voorhees's words, “necessary (though not sufficient)” to support a wide range of information-seeking tasks ([Voorhees, “TREC: Continuing information retrieval's tradition of experimentation” (CACM 2007)](https://doi.org/10.1145/1297797.1297822)). TREC, started in 1992, runs this experiment in cycles: for each TREC, participants run their own systems on shared data, and NIST pools and judges the results ([TREC overview](https://trec.nist.gov/overview.html)).
- **Pooling, and the documents nobody judged.** Judging every document for every topic is infeasible, so TREC judges only a pool, the union of each participant's top X results (X is usually 100), and treats every unjudged document as not relevant ([Voorhees, 2007](https://doi.org/10.1145/1297797.1297822)). That assumption penalizes systems unlike those in the pool: on TREC-COVID, 14.4% of the dense retriever ANCE's top-10 results had never been judged, and judging them moved its nDCG@10 from 0.654, just below BM25, to 0.735, 6.7 points above it ([Thakur et al., “BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models” (2021)](https://arxiv.org/abs/2104.08663)).
- **Metrics and significance.** The standard tool, trec_eval, scores a run against a file of judgments (qrels) and prints per-query results with `-q`; precision and recall ignore rank, MRR and MAP are rank-aware but binary, and nDCG@k also handles graded judgments, which is why BEIR reports nDCG@10 on every dataset ([usnistgov/trec_eval](https://github.com/usnistgov/trec_eval), [Thakur et al., 2021](https://arxiv.org/abs/2104.08663); formulas in [Evaluating RAG](#rag-evaluation)). Compare systems with a paired test over per-query scores: on TREC runs, the randomization, bootstrap and t tests agreed closely, while the Wilcoxon and sign tests had a poor ability to detect significance and could lead to false detections ([Smucker et al., “A Comparison of Statistical Significance Tests for Information Retrieval Evaluation” (CIKM 2007)](https://doi.org/10.1145/1321440.1321528)).
- **The benchmark lineage.** The TREC 2019 Deep Learning track paired large training sets with blind, reusable test sets ([Craswell et al., “Overview of the TREC 2019 deep learning track” (2020)](https://arxiv.org/abs/2003.07820)); BEIR then tested zero-shot transfer across 18 datasets and found “BM25 is a robust baseline” ([Thakur et al., 2021](https://arxiv.org/abs/2104.08663)), and MMTEB grew the MTEB embedding benchmark to more than 500 tasks in more than 250 languages ([Enevoldsen et al., “MMTEB: Massive Multilingual Text Embedding Benchmark” (2025)](https://arxiv.org/abs/2502.13595v2)). Specialized collections followed: MIRACL for 18 languages with native-speaker judgments ([Zhang et al., 2022](https://arxiv.org/abs/2210.09984)), BRIGHT for queries that need reasoning to find the relevant document ([Su et al., 2024](https://arxiv.org/abs/2407.12883)), and ViDoRe for page-level retrieval of visually rich documents ([Faysse et al., 2024](https://arxiv.org/abs/2407.01449)).
- **Why leaderboard numbers do not transfer.** BEIR found that in-domain performance does not predict zero-shot generalization, and that many models that beat BM25 in-domain did poorly on its datasets ([Thakur et al., 2021](https://arxiv.org/abs/2104.08663)); on BRIGHT, a model that led the MTEB leaderboard with 59.0 nDCG@10 scored 18.3 ([Su et al., “BRIGHT: A Realistic and Challenging Benchmark for Reasoning-Intensive Retrieval” (2024)](https://arxiv.org/abs/2407.12883)). Domain, query style and document type decide the ranking, so treat a leaderboard as a shortlist and see [Benchmark literacy](#benchmark-literacy) for contamination and other reasons scores mislead.
- **LLM judgments and your own collection.** LLM relevance labels matched human labellers in accuracy and are used for large-scale labelling at Bing, but small prompt changes, even paraphrases, changed their accuracy ([Thomas et al., “Large language models can accurately predict searcher preferences” (2023)](https://arxiv.org/abs/2309.10621)); Clarke and Dietz simulate a case in which every system uses the judging LLM as its final reranker and find that LLM-based assessment can distort system rankings ([Clarke and Dietz, “LLM-based relevance assessment still can't replace human relevance assessment” (2024)](https://arxiv.org/abs/2412.17156v3)). For a RAG system, collect real queries, pool candidates from several different retrievers, as BEIR recommends for fair pools, judge the pool, check any LLM judge against a human-labeled sample, and keep the qrels under version control.

## Planned visuals

- **`stepper`:** building a pooled test collection: topics, ranked runs from three different systems, the top-k pool, judging, the qrels, and a final frame where a new system retrieves a relevant document nobody judged.
- **`chart`:** BEIR's TREC-COVID hole analysis: nDCG@10 for BM25, ANCE, TAS-B, ColBERT and other systems before and after the unjudged top-10 results were judged (real data from Thakur et al., 2021, Table 4).
- **`compare`:** a qrels file and a run file side by side, with linked highlights showing how trec_eval matches them by query and document id, and what happens to a retrieved document that is missing from the qrels.

## Talk like an expert

Experts talk about **topics**, **qrels**, **runs**, **pools**, **judgment depth** and **holes**, report nDCG@10 or recall@k together with how the collection was judged, and ask whether the pool contained systems like theirs. They treat public leaderboards as a shortlist and a small in-domain test collection as the decision ([Embeddings](#embeddings)).

## Go deeper

- Voorhees, [“TREC: Continuing information retrieval's tradition of experimentation”](https://doi.org/10.1145/1297797.1297822) (Communications of the ACM, 2007).
- Thakur et al., [“BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models”](https://arxiv.org/abs/2104.08663) (2021), section 6 on annotation selection bias.
- Thomas et al., [“Large language models can accurately predict searcher preferences”](https://arxiv.org/abs/2309.10621) (2023).
- Clarke and Dietz, [“LLM-based relevance assessment still can't replace human relevance assessment”](https://arxiv.org/abs/2412.17156v3) (2024).

## Related

- [Evaluating RAG](#rag-evaluation)
- [Information retrieval foundations](#ir-foundations)
- [Embeddings](#embeddings)
- [Statistics for evals](#eval-statistics)
- [Benchmark literacy](#benchmark-literacy)
- [Building eval datasets](#eval-datasets)
