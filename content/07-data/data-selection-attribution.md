---
id: data-selection-attribution
book: 7
order: "7.9"
title: Data selection and attribution
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [data-selection, data-pruning, influence-functions, data-attribution, data-valuation]
visuals: []
prerequisites: [pretraining-data, fine-tuning-practice]
---
> [!tldr]
> Data selection decides which examples a model trains on, how often and in what order; data attribution works backward from a trained model's behavior to the training examples that caused it. Both put a score on individual examples, and both become expensive and approximate at LLM scale. Remember that such a score belongs to one model, one objective and one dataset, so the honest test is training with and without the data.

## Key ideas

- **Selection is an optimization over examples.** The baseline is heuristic and classifier quality filtering ([pretraining data](#pretraining-data)), and choosing pretraining mixtures has its own chapter ([data mixtures](#data-mixing)). Albalak et al. frame all of it as a selection function that maximizes an objective, built from a utility function that scores each data point and a selection mechanism that decides whether, and how often, to include it, with the goal of either matching a target distribution or diversifying, across pretraining, instruction tuning, alignment, in-context learning and task-specific fine-tuning (Albalak et al., [“A Survey on Data Selection for Language Models”](https://arxiv.org/abs/2402.16827) (2024)).
- **Importance resampling matches a target distribution.** DSIR estimates importance weights in a hashed n-gram feature space from unlabeled samples of target text and resamples raw data by those weights; it selected 100M documents from the Pile in about 4.5 hours, performed comparably to expert curation for continued pretraining on 8 target domains, and beat random selection and heuristic filtering by about 2 to 2.5% on GLUE for general-domain pretraining (Xie et al., [“Data Selection for Language Models via Importance Resampling”](https://arxiv.org/abs/2302.03169) (2023)).
- **Pruning can beat power-law scaling.** Classic [scaling laws](#scaling-laws) have loss or error falling as a power law in dataset size; Sorscher et al. argue in theory, and show with ResNets on CIFAR-10, SVHN and ImageNet, that discarding examples with a good pruning metric can make error fall faster than that, in theory even exponentially. In their benchmark of ten pruning metrics on ImageNet, most high-performing metrics scaled poorly and the best were computationally intensive and needed labels for every image, so they proposed a cheap self-supervised metric that performed comparably to the best supervised ones (Sorscher et al., [“Beyond neural scaling laws: beating power law scaling via data pruning”](https://arxiv.org/abs/2206.14486) (2022)).
- **Fine-tuning sets are small enough to score one by one.** Deita scores instruction data for complexity, quality and diversity and matched or beat open alignment models with 6K SFT examples, over 10 times fewer than its baselines (Liu et al., [“What Makes Good Data for Alignment? A Comprehensive Study of Automatic Data Selection in Instruction Tuning”](https://arxiv.org/abs/2312.15685) (2023)), and LESS stores low-dimensional gradient features for each candidate and keeps those most similar to a few examples of the target skill, where training on a 5% subset often beat training on the full dataset, and a smaller model could select useful data for a larger one (Xia et al., [“LESS: Selecting Influential Data for Targeted Instruction Tuning”](https://arxiv.org/abs/2402.04333) (2024)). Curriculum learning asks about order rather than membership, and the paper that named it found that a well-chosen selection and ordering of examples, from simpler to more complex, can improve generalization (Bengio et al., [“Curriculum Learning”](https://doi.org/10.1145/1553374.1553380) (2009)).
- **Attribution traces behavior back to training examples.** Influence functions, a tool from robust statistics, find the training points most responsible for a prediction using only gradients and Hessian-vector products, and help debug models and find dataset errors (Koh and Liang, [“Understanding Black-box Predictions via Influence Functions”](https://arxiv.org/abs/1703.04730) (2017)); Grosse et al. scaled them to LLMs of up to 52 billion parameters with the EK-FAC approximation, TF-IDF filtering and query batching, and found influence heavy-tailed but spread over many sequences rather than a handful, more abstract in larger models, and near zero when the order of key phrases was flipped (Grosse et al., [“Studying Large Language Model Generalization with Influence Functions”](https://arxiv.org/abs/2308.03296) (2023)). TRAK (Tracing with the Randomly-projected After Kernel) needs only a handful of trained models and matched attribution methods that train thousands, on image classifiers, CLIP and the language models BERT and mT5 (Park et al., [“TRAK: Attributing Model Behavior at Scale”](https://arxiv.org/abs/2303.14186) (2023)).
- **Valuation prices each example, and every score is fragile.** Data Shapley is the valuation that uniquely satisfies a set of equitable properties, estimated with Monte Carlo and gradient methods; low values flag outliers and corrupted data, high values show what data to acquire, and the paper starts from proposals to compensate people for their data while warning that a value depends on the algorithm, the metric and the rest of the dataset, and that it does not propose paying people exactly their value (Ghorbani and Zou, [“Data Shapley: Equitable Valuation of Data for Machine Learning”](https://arxiv.org/abs/1904.02868) (2019)). Influence estimates were reasonably accurate for shallow networks but often wrong for deep ones, and depended on architecture, weight decay and the test point examined (Basu et al., [“Influence Functions in Deep Learning Are Fragile”](https://arxiv.org/abs/2006.14651) (2020)).

## Planned visuals

- `tree`: data selection methods by the question they answer: what to drop (heuristic and classifier filters, pruning metrics), what matches a target (DSIR), what helps a skill (Deita scores, LESS gradients), what order (curriculum) and what mix (data mixtures), each linked to its chapter.
- `chart`: test error against dataset size on log axes, labeled illustrative, for random subsets that follow a power law and for subsets pruned with a good metric that bend below it.
- `stepper`: attributing one LLM answer: compute the gradient of the answer, compare it with projected gradients of candidate training sequences, rank the most influential ones, inspect them, and confirm by retraining without them.

## Talk like an expert

Experts keep **selection** (what to train on next) apart from **attribution** (what a trained model learned from), talk in **utility scores**, **importance weights**, **pruning metrics**, **influence**, **EK-FAC**, **TRAK scores** and **Shapley values**, and ask of any score how it was validated, ideally by retraining with and without the data.

## Go deeper

- Albalak et al., [“A Survey on Data Selection for Language Models”](https://arxiv.org/abs/2402.16827) (2024).
- Koh and Liang, [“Understanding Black-box Predictions via Influence Functions”](https://arxiv.org/abs/1703.04730) (2017).
- Grosse et al., [“Studying Large Language Model Generalization with Influence Functions”](https://arxiv.org/abs/2308.03296) (2023).
- Park et al., [“TRAK: Attributing Model Behavior at Scale”](https://arxiv.org/abs/2303.14186) (2023).

## Related

- [Pretraining data](#pretraining-data)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Data mixtures, repetition and curricula](#data-mixing)
- [Synthetic data recipes](#synthetic-data-recipes)
- [Deduplication and decontamination](#deduplication-decontamination)
- [Mechanistic interpretability](#mech-interp)
