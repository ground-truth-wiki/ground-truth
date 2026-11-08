---
id: data-mixing
book: 3
order: "3.1.2"
title: Data mixtures, repetition and curricula
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [data-mixtures, repetition, curriculum, annealing, pretraining-data]
visuals: []
prerequisites: [pretraining-data, scaling-laws]
---
> [!tldr]
> A data mixture sets how much of each source a model sees (web, code, math, books, other languages), how often each source repeats, and how the mix changes over training. The mix shapes capabilities, not only the total token count, and teams such as Llama 3's choose it with experiments on small models rather than by hand. The one thing to remember: a mix chosen at small scale is a prediction, and it needs checking at the target scale.

## Key ideas

- **Weights are not proportional to size.** GPT-3 drew 60% of its training examples from filtered Common Crawl and 3% from Wikipedia, so over 300B tokens it saw Common Crawl 0.44 times and Wikipedia 3.4 times (Brown et al., [“Language Models are Few-Shot Learners”](https://arxiv.org/abs/2005.14165) (2020)). Llama 3's final mix was roughly 50% general knowledge, 25% math and reasoning, 17% code and 8% multilingual tokens, set with a knowledge classifier that downsampled categories over-represented on the web and with scaling-law experiments on small models (Grattafiori et al., [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024)).
- **Repetition is cheaper than it looks, up to a point.** Across about 400 training runs, repeating data for up to 4 epochs changed loss negligibly compared with unique data at the same compute, and with more repetition the value of extra compute eventually fell to zero (Muennighoff et al., [“Scaling Data-Constrained Language Models”](https://arxiv.org/abs/2305.16264) (2023)). The same paper tests adding code and dropping common quality filters as ways to stretch scarce data ([Muennighoff et al., 2023](https://arxiv.org/abs/2305.16264)).
- **Small proxy models choose the mix.** DoReMi trains a 280M-parameter proxy with group distributionally robust optimization to set domain weights for an 8B model, which then reached baseline accuracy in 2.6 times fewer steps (Xie et al., [“DoReMi: Optimizing Data Mixtures Speeds Up Language Model Pretraining”](https://arxiv.org/abs/2305.10429) (2023)). RegMix fits a regression over 512 models of 1M parameters and matches or beats DoReMi with about a tenth of its compute, and data mixing laws predict performance from mixture proportions before a full run (Liu et al., [“RegMix: Data Mixture as Regression for Language Model Pre-training”](https://arxiv.org/abs/2407.01492) (2024); Ye et al., [“Data Mixing Laws: Optimizing Data Mixtures by Predicting Language Modeling Performance”](https://arxiv.org/abs/2403.16952) (2024)).
- **The mix changes over training.** Llama 3 annealed the learning rate to zero over its final 40M tokens while upsampling very high-quality sources, and judged small new datasets by annealing a half-trained 8B model on 40B tokens with 30% of the mix from the candidate ([Grattafiori et al., 2024](https://arxiv.org/abs/2407.21783)). OLMo 2's [mid-training](#mid-training) used Dolmino Mix 1124 samples of 50B, 100B and 300B tokens, assessed candidate math sources with short "micro-annealing" runs, and averaged models annealed on different data orders (Team OLMo et al., [“2 OLMo 2 Furious”](https://arxiv.org/abs/2501.00656) (2024)).
- **Synthetic rephrasing stretches unique tokens.** WRAP rewrote C4 documents in styles such as Wikipedia-like prose and question-answer format, trained on the originals and the rewrites together, and sped up pretraining about threefold (Maini et al., [“Rephrasing the Web: A Recipe for Compute and Data-Efficient Language Modeling”](https://arxiv.org/abs/2401.16380) (2024)). Nemotron-CC used rephrasing and classifier ensembles to build a 6.3T-token set that matches DCLM on MMLU with about four times more unique real tokens (Su et al., [“Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset”](https://arxiv.org/abs/2412.02595) (2024)).
- **Small-scale decisions transfer only partly.** Across 25 corpora, rankings from 150M-parameter models got about 80% of pairwise comparisons at 1B parameters right, and none of eight scaling-law methods beat that simple baseline at the same compute (Magnusson et al., [“DataDecide: How to Predict Best Pretraining Data with Small Experiments”](https://arxiv.org/abs/2504.11393) (2025)). Benchmark-shaped mixes are the other trap; Llama 3, for one, states that it kept the training sets of common benchmarks out of its annealing data ([Grattafiori et al., 2024](https://arxiv.org/abs/2407.21783)).

## Planned visuals

- **`calculator`:** epochs per source from mix weight, source size and total training tokens (epochs = weight × total tokens ÷ source tokens), defaulting to GPT-3's table and flagging any source past about four epochs.
- **`budget`:** Llama 3's final pretraining mix as a stacked bar of general knowledge, math and reasoning, code and multilingual shares (`data: real`, from the report).
- **` ```mermaid ` (flowchart):** choosing a mix: proxy runs or regression over small models, a candidate mix, a check at a larger scale, then the main mix followed by an annealing or mid-training mix.

## Talk like an expert

Experts speak of domain weights, epochs per source, upsampling, annealing mixes and proxy runs. Before crediting a model's math or code scores they ask what was in the annealing mix, and before trusting a mix they ask at what scale it was chosen.

## Go deeper

- Xie et al., [“DoReMi: Optimizing Data Mixtures Speeds Up Language Model Pretraining”](https://arxiv.org/abs/2305.10429) (2023).
- Muennighoff et al., [“Scaling Data-Constrained Language Models”](https://arxiv.org/abs/2305.16264) (2023).
- Team OLMo et al., [“2 OLMo 2 Furious”](https://arxiv.org/abs/2501.00656) (2024).
- Magnusson et al., [“DataDecide: How to Predict Best Pretraining Data with Small Experiments”](https://arxiv.org/abs/2504.11393) (2025).

## Related

- [Pretraining data](#pretraining-data)
- [Mid-training](#mid-training)
- [Scaling laws and compute](#scaling-laws)
- [Building a web-scale text pipeline](#web-data-pipeline)
- [Evaluating models during pretraining](#base-model-evaluation)
- [Synthetic data](#synthetic-data)
