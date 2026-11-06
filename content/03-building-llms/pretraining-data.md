---
id: pretraining-data
book: 3
order: "3.1"
title: Pretraining data
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [data, pretraining, dedup]
visuals:
  - data-funnel:chart
  - data-sources:tree
---
> [!tldr]
> Pretraining data is mostly filtered web text plus code, books, papers and curated sources, amounting to trillions of tokens. Quality filtering, deduplication, mixing and decontamination matter as much as quantity, and data choices shape what a model knows, how it writes and what it gets wrong.

## Why it matters
A model is largely its data. Teams that train, fine-tune or evaluate models need to understand where capabilities and biases come from, why benchmark contamination happens, why some languages are served worse, and why “more data” has given way to “better data”.

## Intuition
Pretraining data curation is panning for gold. Most of what you scoop from the web is gravel; each filter keeps a smaller, richer portion, and the final mix decides what the model learns to value.

```viz
{"id":"data-funnel","component":"chart","type":"bar","title":"Most of a raw web crawl never reaches the training set","caption":"Illustrative share of documents remaining after each stage of a typical web-data pipeline; real pipelines differ in order and strictness.","alt":"Illustrative bar chart of the share of documents remaining after URL filtering, text extraction, language identification, quality filtering, deduplication and decontamination.","data":"illustrative","categories":["Raw crawl","URL and safety filters","Text extraction","Language ID","Quality filters","Deduplication","Decontamination"],"y":{"label":"Documents remaining","unit":"pct","min":0,"max":1},"series":[{"name":"Share remaining","points":[[0,1],[1,0.85],[2,0.7],[3,0.42],[4,0.2],[5,0.1],[6,0.099]]}]}
```

## How it works
**Sources.**

```viz
{"id":"data-sources","component":"tree","title":"Five kinds of source make up most pretraining mixes","caption":"Expand a source for what it contributes and its main risks.","alt":"Tree of pretraining data sources: web crawls, code, books and papers, curated reference, and synthetic data.","data":"illustrative","open":1,"root":{"label":"Pretraining data sources","children":[
{"label":"Web crawls","children":[{"label":"Common Crawl and others: breadth and scale; noise, spam, toxicity and duplication"}]},
{"label":"Code","children":[{"label":"Public repositories: reasoning structure and programming skill; licenses and secrets in code"}]},
{"label":"Books and papers","children":[{"label":"Long-form, high-quality text; copyright and licensing questions"}]},
{"label":"Curated reference","children":[{"label":"Encyclopedias, textbooks, Q&A sites: factual density; small relative to the web"}]},
{"label":"Synthetic data","children":[{"label":"Model-generated textbooks, problems and rewrites: targeted skills; risk of narrowing diversity","link":"#synthetic-data"}]}]}}
```

**Filtering.** Heuristic filters (length, symbol ratios, repetition), model-based quality classifiers, and safety filters. FineWeb-Edu (Hugging Face, 2024) used an educational-quality classifier; DCLM (2024) showed model-based filtering at scale beats heuristics.

**Deduplication.** Exact and near-duplicate removal (for example with MinHash) reduces memorization and wasted compute, and improves quality.

**Mixing.** The proportions of web, code, math, multilingual and curated data shape capabilities; mixes often change over training, with higher-quality data later. See [mid-training](#mid-training).

**Decontamination.** Removing benchmark test items from training data keeps evaluations honest; it is hard to do completely. See [benchmark literacy](#benchmark-literacy).

**Scale.** Open datasets such as FineWeb (about 15 trillion tokens) and frontier models trained on tens of trillions of tokens show the scale; Llama 3 reported about 15 trillion training tokens.

**Legal and ethical questions.** Copyright, consent, licenses and personal data in training corpora are the subject of litigation and regulation. See [governance](#governance-regulation).

## In practice
For teams that do not pretrain:
- Check model cards for data cutoffs, languages and known gaps before choosing a model.
- Expect weaker performance where training data is thin: low-resource languages, niche domains, recent events.
- Assume public benchmarks may be partly contaminated; build your own evals.
- For fine-tuning, the same principles apply at small scale: filter, deduplicate, balance, decontaminate.

## Numbers to know
> [!number]
> Rules of thumb. Modern pretraining runs use trillions to tens of trillions of tokens. Only a small fraction of a raw web crawl survives quality filtering and deduplication.

## Pitfalls and anti-patterns
> [!pitfall] Quantity over quality
> Adding unfiltered data can lower model quality; filtering and deduplication often beat scale.

- **Ignoring contamination.** Inflated benchmark scores mislead model choices.
- **Assuming coverage.** A model’s knowledge mirrors its data’s gaps and biases.

## Talk like an expert
The vocabulary: **Common Crawl**, **quality classifier**, **deduplication**, **MinHash**, **data mixture**, **annealing data**, **decontamination**, **data cutoff**, **tokens seen**. Experts describe models by data as much as by architecture. The live debate is the data wall: whether high-quality human text runs out, and how much synthetic data can substitute.

> [!hottake] Data quality, not architecture, has driven most open-model progress since 2023.
> **The counterargument:** architecture and training changes such as mixture of experts, better optimizers and reinforcement learning on verifiable tasks have also delivered large gains that data alone would not.

## Check yourself
```quiz
pretraining-data
```

## Go deeper
- Penedo et al., “The FineWeb Datasets” (2024); Li et al., “DataComp-LM” (2024).
- Lee et al., “Deduplicating Training Data Makes Language Models Better” (2021).

## Related
- [Data quality and governance](#data-governance)
- [Scaling laws and compute](#scaling-laws)
- [Synthetic data](#synthetic-data)
- [Mid-training](#mid-training)
- [Benchmark literacy](#benchmark-literacy)
- [Data strategy](#data-strategy)
