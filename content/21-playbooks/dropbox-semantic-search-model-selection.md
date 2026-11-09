---
id: dropbox-semantic-search-model-selection
book: 21
order: "21.35"
title: "Dropbox: choosing an embedding model for multilingual file search"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [search, embeddings, multilingual, quantization, model-selection, public-record]
visuals: []
type: playbook
account: public-record
industry: "Software (file storage and search)"
use_case: "Semantic and cross-lingual search over users' text files in Nautilus, Dropbox's search engine, built on a text embedding model"
outcome: "A nearly 17% reduction in empty search sessions (zero-results rate) and a 2% lift in search session success (qualified click-through rate)"
measured_how: "Zero-results rate and qualified click-through rate, reported with the release to a subset of Pro and Essential users as an experiment in May 2024; baselines, sample size and duration not stated (Dropbox, December 2024)"
prerequisites: [embeddings, vector-search]
replications: []
---
> [!tldr]
> Dropbox added semantic search to Nautilus, its file search engine, after evaluating 11 embedding models with an adapted MTEB benchmark and test sets built from its own search logs. It chose multilingual-e5-large and stores two 8-bit embeddings per document. The post reports "a nearly 17% reduction in empty search sessions" and "a 2% lift in search session success", without describing the experiment behind them.

> [!note] From the public record
> Built from Dropbox's own published account, "Selecting a model for semantic search at Dropbox scale" (December 2024), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Nautilus, introduced in 2018, is Dropbox's search engine for documents and other files. The post says it uses "a conventional keyword-based approach", so users had to recall a file's exact name or the keywords inside it. A search for "employment contract" could miss a "job agreement". Nautilus also expects queries and documents to be in the same language. The team considered stemming, spelling correction and query expansion, but asked whether users could find content "without needing to know the exact search term". Semantic search also allows cross-lingual search. The platform is described as "indexing more than a trillion documents and exabytes of data".

## Why this approach

Semantic search relies on [vector search](#vector-search), and a document embedding model maps each document and query to [embeddings](#embeddings). The post says overall performance, in latency and quality, "would hinge on the model we used". Computing the query embedding would be in the critical path for retrieving documents, so "speed would be paramount", and a faster model would also index documents faster. The embeddings had to be similar enough to match documents with their relevant queries, but "still discriminative enough to filter out irrelevant documents".

The team evaluated available pre-trained models in-house "with speed and search quality in mind", and it "did not train on any user data". From 11 models, four of them multilingual, it selected multilingual-e5-large. The post says the model "excelled on our Dropbox datasets" and, "at the time of benchmarking", "stood out as the best multilingual model on the MTEB public leaderboard". The post names only the four models in its results table and gives no speed figures for any model.

## The approach

1. **Adapt the benchmark.** The team adapted the Massive Text Embedding Benchmark (MTEB) to its infrastructure and added document chunking, reduced precision and dimensionality, and filename embeddings.
2. **Build its own test sets.** The public re-ranking and retrieval tasks "primarily offered English-only datasets". A Kubeflow pipeline extracts anonymized query-document pairs from search logs into datasets that are deleted after 30 days. It was extended to Spanish, French, German, Japanese and Korean. See [Retrieval benchmarks and test collections](#retrieval-test-collections).
3. **Fit a storage budget.** The team set an upper bound of 4KB of vector-search metadata per document. Reducing precision to 8-bit per channel gave 1KB per embedding "with a marginal impact on quality". Each embedding is scaled so its largest channel magnitude is exactly 1.0, with the scale stored as a 32-bit float, then rounded to 8-bit signed integers, which "minimized the error on cosine similarity" over the query-document pairs in its dataset.
4. **Choose what to embed.** Two embeddings per document: one for the file path (including the filename) and one for the content up to 512 tokens.
5. **Roll out in stages.** Internal users in early 2024, an experiment for a subset of Pro and Essential users in May 2024, and general availability for all Pro and Essential users in August 2024. Business users were "coming soon in early 2025".

## The stack

As of December 2024:

- **Search engine:** Nautilus. Semantic search is "powered by Nautilus".
- **Embedding model:** multilingual-e5-large, pre-trained, with no training on user data.
- **Evaluation:** an adapted MTEB and a Kubeflow pipeline for datasets from search logs.
- **Storage:** two embeddings per document at 8 bits per channel.
- **Scope:** text files only, in this first iteration.

The post does not name the vector index, the hardware, or how semantic and keyword results are combined.

## Results, and how they were measured

**Offline.** MRR / MAP on Dropbox's custom datasets, with one embedding for the title with path and one for the first chunk of text:

| Model | English | Japanese | Spanish | Korean | German |
|---|---|---|---|---|---|
| paraphrase-multilingual-mpnet-base-v2 | 0.3299 / 0.3462 | 0.2245 / 0.2448 | 0.2367 / 0.2568 | 0.2338 / 0.2546 | 0.2879 / 0.3078 |
| paraphrase-multilingual-MiniLM-L12-v2 | 0.3108 / 0.3278 | 0.2628 / 0.2804 | 0.2043 / 0.2273 | 0.2374 / 0.2584 | 0.2355 / 0.2533 |
| multilingual-e5-large | 0.5044 / 0.5133 | 0.4265 / 0.4386 | 0.3350 / 0.3524 | 0.4003 / 0.4118 | 0.3305 / 0.3432 |
| multilingual-e5-base | 0.4492 / 0.4603 | 0.3659 / 0.3795 | 0.3330 / 0.3511 | 0.3817 / 0.3957 | 0.3405 / 0.3535 |

The post reports MRR (mean reciprocal rank) and MAP (mean average precision), "where higher is better". No French results are shown, although a French dataset was built.

**Online.** With this release, "we observed a nearly 17% reduction in empty search sessions (measured by ZRR, or zero-results rate)", and "a 2% lift in search session success (measured by qCTR, or qualified click-through rate)". The post gives these next to the May 2024 experiment and says the August 2024 general availability was "Based on these positive results".

**Not measured:** the post gives no baselines, no number of users or sessions, no duration, control design or significance test, and does not say whether the changes are relative or absolute. It publishes no latency or cost figures, no sizes for its test sets, and no quality numbers for the chunking, summarization or compression experiments.

## What failed

- **Smaller embeddings.** "However, reducing dimensionality adversely affected quality." The team kept the full dimension and used 8-bit precision instead.
- **Public benchmarks alone.** Public retrieval datasets were English-only when the team benchmarked, so it built its own.
- **Partial documents.** "While this method doesn't encompass the entire document", the post says, embedding only the first 512 tokens significantly lowered costs and processing demands.

The post reports no incidents or regressions after launch.

## What the team would do differently

The post states no lessons in that form. It concludes "we think we’ve struck the right balance between search quality, speed, and efficiency", and adds: "We’re also not done yet." Next steps are semantic search for multiple file types and Business users. Other initiatives, such as Dropbox Dash, can now use the adapted MTEB.

The wiki's reading: test sets from your own search logs, in your users' languages, let the team check a public leaderboard against its own corpus (see [Multilingual and low-resource language models](#multilingual-models)). In the German column of the table, multilingual-e5-base has a higher MRR and MAP than the chosen model, and the post does not comment on this. The online numbers would be easier to judge with the baselines and sample sizes that [online controlled experiments](#online-experiments) report.

## Disclosure

None.

## Sources

- Marta Mendez and Jongmin Baek, Dropbox, [“Selecting a model for semantic search at Dropbox scale”](https://dropbox.tech/machine-learning/selecting-model-semantic-search-dropbox-ai), dropbox.tech, 11 December 2024.

## Related

- [About playbooks](#about-playbooks)
- [Embeddings](#embeddings)
- [Vector search](#vector-search)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
