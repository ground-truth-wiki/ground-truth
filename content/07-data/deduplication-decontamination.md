---
id: deduplication-decontamination
book: 7
order: "7.4.5"
title: Deduplication and decontamination
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [deduplication, minhash, decontamination, near-duplicates, data-leakage]
visuals: []
prerequisites: [data-governance, pretraining-data]
---
> [!tldr]
> Deduplication removes copies and near-copies from a dataset, and decontamination finds and removes test items that leaked into training data. Duplicates make models memorize and repeat text, waste compute and inflate eval scores, and leaked test items make a score measure memory instead of skill. The one thing to remember: string matching only finds text that looks the same, so rephrased duplicates and leaks need embedding or model-based checks.

## Key ideas

- **Duplicates teach memorization and inflate scores.** In C4, Lee et al. found one 61-word sentence repeated over 60,000 times. Models trained on such corpora copied over 1% of their unprompted output verbatim from training data, deduplication made them emit memorized text ten times less often with the same or better accuracy in fewer steps, and train-test overlap affected over 4% of the validation sets of standard datasets (Lee et al., [“Deduplicating Training Data Makes Language Models Better”](https://arxiv.org/abs/2107.06499) (2021)).
- **Exact matches: hashes for documents, suffix arrays for spans.** Hashing each document's text, as NeMo Curator does with MD5, catches identical copies ([NVIDIA NeMo Curator, “Deduplication”](https://docs.nvidia.com/nemo/curator/latest/curate-text/process-data/deduplication/index.html)). Because whole-example matching is not enough, Lee et al. also built a suffix array over the tokenized corpus and removed any substring of at least 50 tokens that occurs verbatim in more than one example ([Lee et al., 2021](https://arxiv.org/abs/2107.06499)). At scale, DataTrove runs MinHash, sentence-level and exact-substring deduplication locally, on Slurm or on Ray, and NeMo Curator runs exact, fuzzy and semantic deduplication on GPUs ([DataTrove](https://github.com/huggingface/datatrove); [NeMo Curator](https://docs.nvidia.com/nemo/curator/latest/curate-text/process-data/deduplication/index.html)).
- **Near-duplicates: shingles, MinHash and banded LSH.** Each document becomes a set of word n-grams (shingles), its MinHash signature keeps the minimum value of each of k hash functions, and the signature is cut into b bands of r values; only documents that match on a whole band are compared, and a pair with Jaccard similarity s becomes a candidate with probability 1 − (1 − s^r)^b, so false positives and false negatives trade off along an S-curve ([datasketch, “MinHash LSH”](https://ekzhu.com/datasketch/lsh.html); [Lee et al., 2021](https://arxiv.org/abs/2107.06499)). FineWeb used 5-grams and 112 hashes in 14 bands of 8 to target documents at least 75% similar, and by that formula a pair at s = 0.75 is caught about 77% of the time, at 0.8 about 92% and at 0.5 about 5%; deduplicating each of its 96 crawl snapshots separately beat deduplicating them all together, which left a lower-quality remainder of the oldest snapshots (Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024)). The pipeline around these steps is in [Building a web-scale text pipeline](#web-data-pipeline).
- **Semantic duplicates need embeddings.** SemDeDup embeds every example with a pretrained model, clusters the embeddings with k-means, and within each cluster keeps one item from every group whose cosine similarity passes a threshold; on LAION it removed 50% of the data with minimal performance loss, effectively halving training time (Abbas et al., [“SemDeDup: Data-efficient learning at web-scale through semantic deduplication”](https://arxiv.org/abs/2303.09540) (2023)). D4 combines embedding-based deduplication with diversification for LLM pretraining and reports 20% efficiency gains and up to 2% higher average accuracy on 16 NLP tasks at 6.7B parameters (Tirumala et al., [“D4: Improving LLM Pretraining via Document De-Duplication and Diversification”](https://arxiv.org/abs/2308.12284) (2023)).
- **Duplicates across splits are leakage.** If near-copies of one item land in both training and test data, the test score measures memory, a case of [leakage](#validation-tuning). Cluster first, then split, sample or index: in a fine-tuning set, an eval set or a RAG index, one representative per cluster stops the same item from being trained on, counted or retrieved twice, and for splits, give each cluster one group id and use a group-aware splitter such as scikit-learn's GroupKFold or GroupShuffleSplit, which never put the same group in both training and test sets ([scikit-learn, “Cross-validation”](https://scikit-learn.org/stable/modules/cross_validation.html)).
- **Decontamination: n-gram overlap misses rephrased tests.** Paraphrased or translated test items slip past n-gram checks, and a 13B model that overfits such rephrased items reaches GPT-4-level scores on MMLU, GSM8K and HumanEval. Yang et al. therefore find the top-k most similar training items by embedding search and ask a strong LLM such as GPT-4 whether each pair is a rephrase, and found 8% to 18% of HumanEval overlapping with pretraining sets such as RedPajama-Data-1T and StarCoder-Data (Yang et al., [“Rethinking Benchmark and Contamination for Language Models with Rephrased Samples”](https://arxiv.org/abs/2311.04850) (2023)). Benchmark authors can help from their side: every BIG-bench task file carries a canary string meant to keep the tasks out of web-scraped training data ([BIG-bench repository](https://github.com/google/BIG-bench)).

## Planned visuals

- **`calculator`: the MinHash LSH S-curve.** Inputs: bands b, rows r and Jaccard similarity s; output: the probability that a pair becomes a candidate, 1 − (1 − s^r)^b, with tests for FineWeb's 14 × 8 setting. Formula-based.
- **`stepper`: one document through near-duplicate detection.** Shingles, MinHash signature, bands, a candidate pair, verification by exact Jaccard or edit similarity, and one document kept per cluster.
- **`compare`: n-gram overlap versus an LLM decontaminator.** The same test item and its paraphrase in a training set, side by side: what the n-gram check sees, and what embedding search plus an LLM judge sees.

## Talk like an expert

Experts talk about **exact, near and semantic duplicates**, **shingles**, **MinHash signatures**, **bands and rows**, **candidate pairs**, **per-snapshot versus global deduplication**, **train-test overlap**, **contamination** and **canary strings**. They ask how a duplicate was defined, and at what threshold, before they trust a dedup ratio, and how contamination was checked before they trust a benchmark score.

## Go deeper

- Lee et al., [“Deduplicating Training Data Makes Language Models Better”](https://arxiv.org/abs/2107.06499) (ACL 2022, arXiv 2021): exact-substring and MinHash deduplication, with the appendix on parameters.
- Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024): a full MinHash configuration and the per-snapshot ablation.
- Abbas et al., [“SemDeDup: Data-efficient learning at web-scale through semantic deduplication”](https://arxiv.org/abs/2303.09540) (2023).
- Yang et al., [“Rethinking Benchmark and Contamination for Language Models with Rephrased Samples”](https://arxiv.org/abs/2311.04850) (2023).

## Related

- [Data quality and governance](#data-governance)
- [Pretraining data](#pretraining-data)
- [Building eval datasets](#eval-datasets)
- [Benchmark literacy](#benchmark-literacy)
- [Chunking](#chunking)
- [Data selection and attribution](#data-selection-attribution)
