---
id: web-data-pipeline
book: 3
order: "3.1.1"
title: Building a web-scale text pipeline
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [data-pipeline, common-crawl, quality-filtering, deduplication, pretraining-data]
visuals: []
prerequisites: [pretraining-data]
---
> [!tldr]
> A web-scale text pipeline turns raw Common Crawl archives into training tokens through a chain of steps: text extraction, URL and language filters, heuristic and model-based quality filters, deduplication, PII removal and decontamination. Each step is a bet about what "good text" means, and the open recipes published since 2024 show that those bets can be measured. The one thing to remember: judge a pipeline by training small models on its output, not by reading samples.

## Key ideas

- **Start from the raw crawl, not the shortcut.** Common Crawl publishes WARC files (the raw crawl), WAT files (metadata such as headers and links) and WET files (extracted plain text only) ([Common Crawl, “Get started”](https://commoncrawl.org/get-started)). FineWeb re-extracted text from WARC with trafilatura because WET kept too much boilerplate and menu text, and DCLM found that re-extracting with resiliparse or trafilatura beat WET by at least 2.5 points on its core score (Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024); Li et al., [“DataComp-LM: In search of the next generation of training sets for language models”](https://arxiv.org/abs/2406.11794) (2024)).
- **Cheap rules run first.** Gopher's rules drop documents outside 50 to 100,000 words or a mean word length of 3 to 10 characters, documents without at least two of eight common English words such as "the" and "of", and documents with too many repeated lines, paragraphs or n-grams (Rae et al., [“Scaling Language Models: Methods, Analysis & Insights from Training Gopher”](https://arxiv.org/abs/2112.11446) (2021)). FineWeb adds a URL blocklist and a fastText English score of at least 0.65, and keeps most C4 rules but drops the terminal-punctuation rule, which alone removed about 30% of tokens ([Penedo et al., 2024](https://arxiv.org/abs/2406.17557)).
- **Model-based quality filters decide the most, and discard the most.** CCNet scored text with a 5-gram language model trained on Wikipedia and split each language into head, middle and tail by perplexity (Wenzek et al., [“CCNet: Extracting High Quality Monolingual Datasets from Web Crawl Data”](https://arxiv.org/abs/1911.00359) (2019)), while FineWeb-Edu trained a classifier on Llama-3-70B-Instruct ratings of 460,000 pages and kept 1.3T of FineWeb's 15T tokens, and DCLM kept the top 10% of documents by a fastText classifier trained on instruction data and ELI5 posts ([Penedo et al., 2024](https://arxiv.org/abs/2406.17557); [Li et al., 2024](https://arxiv.org/abs/2406.11794)). The Nemotron-CC authors note that FineWeb-Edu and DCLM discard about 90% of their data this way, which limits their use for very long training runs (Su et al., [“Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset”](https://arxiv.org/abs/2412.02595) (2024)).
- **Deduplication is a pipeline step with its own trade-offs.** Lee et al. removed repeated substrings of at least 50 tokens with a suffix array and near-duplicate documents with MinHash, found a 61-word sentence repeated over 60,000 times in C4, and saw models emit memorized text about ten times less often (Lee et al., [“Deduplicating Training Data Makes Language Models Better”](https://arxiv.org/abs/2107.06499) (2021)). FineWeb's MinHash used 5-grams and 112 hashes in 14 buckets, and deduplicating each crawl snapshot on its own beat deduplicating all 96 snapshots together, which removed up to 90% of the oldest snapshots and showed little improvement over no deduplication at all (the methods get depth in [Deduplication and decontamination](#deduplication-decontamination)) ([Penedo et al., 2024](https://arxiv.org/abs/2406.17557)).
- **PII and test data need their own passes, and string matching has limits.** FineWeb anonymized email addresses and public IP addresses with regular expressions ([Penedo et al., 2024](https://arxiv.org/abs/2406.17557)), and GPT-3 removed every 13-gram that overlapped a benchmark plus a 200-character window around it, although a bug left some overlaps in (Brown et al., [“Language Models are Few-Shot Learners”](https://arxiv.org/abs/2005.14165) (2020)). N-gram matching misses paraphrased or translated test items: a 13B model trained on such rephrasings approached GPT-4's scores on MMLU, GSM8K and HumanEval (Yang et al., [“Rethinking Benchmark and Contamination for Language Models with Rephrased Samples”](https://arxiv.org/abs/2311.04850) (2023)).
- **Recover what filters throw away, and measure every step.** Nemotron-CC combined classifier ensembles, fewer heuristic filters and synthetic rephrasing into a 6.3T-token dataset that matches DCLM on MMLU with about four times more unique real tokens ([Su et al., 2024](https://arxiv.org/abs/2412.02595)). FineWeb chose its steps with ablations, training 1.71B-parameter models on about 28B tokens (350B for some deduplication runs) and comparing benchmarks such as HellaSwag, ARC and MMLU, and released its processing library, datatrove, while the Dolma authors open-sourced their curation toolkit ([Penedo et al., 2024](https://arxiv.org/abs/2406.17557); Soldaini et al., [“Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research”](https://arxiv.org/abs/2402.00159) (2024)).

## Planned visuals

- **`stepper`:** one document's path from a WARC record to training tokens, with a frame per step (extraction, URL filter, language ID, heuristic rules, quality classifier, deduplication, PII, decontamination) showing what that step removes and why.
- **`chart`:** tokens kept at each stage for FineWeb, FineWeb-Edu, DCLM-Baseline and Nemotron-CC, as reported in their papers (`data: real`, with sources and dates).
- **`compare`:** per-snapshot versus global MinHash deduplication side by side, with what each keeps and FineWeb's ablation result.

## Talk like an expert

Experts talk about extraction, heuristic filters, quality classifiers, MinHash buckets and decontamination, and they quote how many tokens survive each stage. They trust a filter only after an ablation model trained on its output beats the baseline on benchmarks that already separate small models.

## Go deeper

- Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024).
- Li et al., [“DataComp-LM: In search of the next generation of training sets for language models”](https://arxiv.org/abs/2406.11794) (2024).
- Lee et al., [“Deduplicating Training Data Makes Language Models Better”](https://arxiv.org/abs/2107.06499) (2021).
- Su et al., [“Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset”](https://arxiv.org/abs/2412.02595) (2024).

## Related

- [Pretraining data](#pretraining-data)
- [Data mixtures, repetition and curricula](#data-mixing)
- [Open pretraining datasets](#open-pretraining-datasets)
- [Deduplication and decontamination](#deduplication-decontamination)
- [Data quality and governance](#data-governance)
- [Synthetic data](#synthetic-data)
