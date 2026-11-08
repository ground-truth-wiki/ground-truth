---
id: active-learning-weak-supervision
book: 7
order: "7.2.2"
title: Active learning and weak supervision
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [active-learning, weak-supervision, labeling-functions, llm-labeling, annotation-cost]
visuals: []
prerequisites: [labeling-annotation, classical-ml]
---
> [!tldr]
> Labels cost money and expert time, and two families of methods stretch a labeling budget. Active learning lets the model choose which examples a person labels next; weak supervision replaces hand labels with many cheap, noisy labeling functions, LLM prompts among them, and a label model that weighs them. Both produce training data, not test data: keep a randomly sampled, human-labeled set to measure the result.

## Key ideas

- **Active learning asks an oracle about the examples that teach the most.** The learner sends queries to an oracle, usually a human annotator, in one of three settings: it synthesizes new examples, decides one by one on a stream, or ranks a whole pool of unlabeled data (Settles, [“Active Learning Literature Survey”](https://burrsettles.com/pub/settles.activelearning.pdf) (2009, updated 2010)). Uncertainty sampling queries the least confident prediction, the smallest margin between the top two classes, or the highest entropy, which all pick the same example in binary tasks; query by committee asks where several models disagree ([Settles, 2010](https://burrsettles.com/pub/settles.activelearning.pdf)).
- **A batch needs diversity as well as uncertainty.** Settles cites a study (Guo and Schuurmans, 2008) in which off-the-shelf query strategies, applied myopically to pick batches, were often much worse than random sampling ([Settles, 2010](https://burrsettles.com/pub/settles.activelearning.pdf)). Sener and Savarese found many heuristics weak for CNNs in batch mode and instead choose a core set on which a trained model stays competitive for the remaining data (Sener and Savarese, [“Active Learning for Convolutional Neural Networks: A Core-Set Approach”](https://arxiv.org/abs/1708.00489) (2017)); BADGE picks points that are spread out and large in a "hallucinated" gradient space, trading off uncertainty and diversity without hand-tuned hyperparameters (Ash et al., [“Deep Batch Active Learning by Diverse, Uncertain Gradient Lower Bounds”](https://arxiv.org/abs/1906.03671) (2019)).
- **Actively chosen data is biased, and stopping is usually an economic decision.** A training set built by an active learner is tied to the model that selected it and is not drawn from the natural distribution, so it may help a different model class less; Settles adds, from his own experience, that the real stopping point in practice comes from economic or other external factors, likely well before a learner's own stability signal ([Settles, 2010](https://burrsettles.com/pub/settles.activelearning.pdf)). The same bias is why an actively selected set should not double as an eval set; the NLP survey by Zhang et al. covers how to start and when to stop ([“A Survey of Active Learning for Natural Language Processing”](https://arxiv.org/abs/2210.10109) (2022)).
- **Weak supervision programs labels instead of hand-writing them.** In data programming, people write labeling functions from heuristics; each labels a subset of the data, the functions may be noisy and conflict, and a generative label model estimates their accuracies and denoises their votes into training labels for a noise-aware end model (Ratner et al., [“Data Programming: Creating Large Training Sets, Quickly”](https://arxiv.org/abs/1605.07723) (2016)). Snorkel does this without ground truth; in its user study, subject matter experts built models 2.8 times faster than with seven hours of hand labeling and improved predictive performance by 45.5% on average (Ratner et al., [“Snorkel: Rapid Training Data Creation with Weak Supervision”](https://arxiv.org/abs/1711.10160) (2017)).
- **LLMs label well on some tasks and poorly on others.** On 2,382 tweets and five tasks such as relevance, stance, topic and frame detection, zero-shot ChatGPT beat crowd workers in accuracy on four of five tasks at under $0.003 per annotation, about twenty times cheaper than MTurk (Gilardi et al., [“ChatGPT Outperforms Crowd-Workers for Text-Annotation Tasks”](https://arxiv.org/abs/2303.15056) (2023)). Replicating 27 tasks from 11 social science datasets with GPT-4, Pangakis et al. found performance "highly contingent" on the dataset and task type, and recommend validating against human labels task by task (Pangakis et al., [“Automated Annotation with Generative AI Requires Validation”](https://arxiv.org/abs/2306.00176) (2023)).
- **One loop can combine LLM labels, weak labels and human review.** Prompted LLMs can act as labeling functions whose votes Snorkel denoises; on the WRENCH benchmark this reduced errors by 19.5% on average relative to zero-shot prompting (Smith et al., [“Language Models in the Loop: Incorporating Prompting into Weak Supervision”](https://arxiv.org/abs/2205.02318) (2022)). People then review the items where sources conflict or the model is unsure, and each route's cost should include the human time to write labeling functions and to validate LLM labels against a human-labeled sample, which Pangakis et al. recommend for every task ([Pangakis et al., 2023](https://arxiv.org/abs/2306.00176)).

## Planned visuals

- `stepper`: a pool-based active learning loop on a two-dimensional toy dataset: train, score the pool by uncertainty, query a batch, retrain; the frames show the decision boundary moving and one cluster that uncertainty sampling never visits. Illustrative.
- `chart`: learning curves of accuracy against the number of labels for random sampling, uncertainty sampling and a diversity-aware batch method, labeled illustrative, showing where active learning saves labels and where it falls behind random.
- `diagram`: a weak supervision pipeline: labeling functions (keywords, heuristics, LLM prompts) feed a label matrix with abstains, overlaps and conflicts, then a label model, probabilistic labels and an end model, with a human-labeled test set kept apart.

## Talk like an expert

Experts talk about the **oracle**, **pool-based** selection, **query strategies**, **uncertainty sampling**, **query by committee**, **cold start**, **labeling functions**, the **label model**, **coverage**, **conflicts** and **probabilistic labels**, and they ask two questions first: what does one useful label cost by each route, and which untouched, randomly sampled set will measure the result?

## Go deeper

- Settles, [“Active Learning Literature Survey”](https://burrsettles.com/pub/settles.activelearning.pdf) (2009, updated 2010).
- Zhang et al., [“A Survey of Active Learning for Natural Language Processing”](https://arxiv.org/abs/2210.10109) (2022).
- Ratner et al., [“Snorkel: Rapid Training Data Creation with Weak Supervision”](https://arxiv.org/abs/1711.10160) (2017).
- Pangakis et al., [“Automated Annotation with Generative AI Requires Validation”](https://arxiv.org/abs/2306.00176) (2023).

## Related

- [Labeling and annotation](#labeling-annotation)
- [Label quality: agreement, aggregation and label errors](#label-quality)
- [Synthetic data](#synthetic-data)
- [The data flywheel](#data-flywheel)
- [Classical ML essentials](#classical-ml)
- [Data strategy](#data-strategy)
