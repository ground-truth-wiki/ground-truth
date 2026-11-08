---
id: llm-uncertainty
book: 1
order: "1.2.4"
title: Uncertainty and confidence estimation for LLMs
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [uncertainty, calibration, confidence, selective-prediction, routing]
visuals: []
prerequisites: [probability-information, decoding-sampling]
---
> [!tldr]
> A confidence estimate tells you how much to trust one answer from a model, so a system can accept it, check it, escalate it or abstain. LLMs offer several signals (token probabilities, verbalized confidence, self-evaluation, agreement across samples), and post-training can make token probabilities less calibrated. The one thing to remember: a confidence signal is only as good as its validation on your own data.

## Key ideas

- **Two kinds of uncertainty.** Aleatoric uncertainty is noise inherent in the data; epistemic uncertainty is the model's own ignorance, which more data can explain away (Kendall and Gal, [“What Uncertainties Do We Need in Bayesian Deep Learning for Computer Vision?”](https://arxiv.org/abs/1703.04977) (2017)). Classic deep learning estimates predictive uncertainty with deep ensembles ([Lakshminarayanan et al., 2016](https://arxiv.org/abs/1612.01474)), or keeps dropout on at test time to approximate the model uncertainty of a Bayesian network ([Gal and Ghahramani, 2015](https://arxiv.org/abs/1506.02142)).
- **Models can judge their own answers.** Kadavath et al., [“Language Models (Mostly) Know What They Know”](https://arxiv.org/abs/2207.05221) (2022) asked models for P(True), the probability that a proposed answer is correct, and trained them to predict P(IK), the probability that they know the answer. Larger models were well calibrated on multiple-choice and true/false questions in the right format, but P(IK) calibration struggled on new tasks.
- **Agreement across samples, counted by meaning.** Semantic entropy samples several answers, groups those that mean the same thing, and measures entropy over the groups, so rephrasings do not count as disagreement. It needs no changes to the model and predicted question-answering accuracy better than comparable baselines (Kuhn et al., [“Semantic Uncertainty”](https://arxiv.org/abs/2302.09664) (2023)).
- **Post-training changes calibration.** In the [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774) (OpenAI, 2023), expected calibration error (ECE, defined in [classification metrics](#classification-metrics)) on an MMLU subset rose from 0.007 for the pretrained model to 0.074 after post-training. Tian et al., [“Just Ask for Calibration”](https://arxiv.org/abs/2305.14975) (2023) found that verbalized confidences from RLHF-tuned models were typically better calibrated than their token probabilities, often cutting ECE by a relative 50%.
- **Abstain to buy reliability.** Selective prediction answers only when confidence passes a threshold, trading coverage for lower risk; Geifman and El-Yaniv, [“Selective Classification for Deep Neural Networks”](https://arxiv.org/abs/1705.08500) (2017) guaranteed 2% top-5 error on ImageNet with 99.9% probability while answering almost 60% of inputs. Conformal methods extend such guarantees to generated text, returning sampled sets that contain at least one acceptable answer with high probability (Quach et al., [“Conformal Language Modeling”](https://arxiv.org/abs/2306.10193) (2023)).
- **Confidence drives routing.** An LLM cascade queries a list of models in turn and returns the first answer that a learned scoring function rates above a threshold, so cost falls when the first models are cheap and reliable; the scorer and thresholds are learned from labeled examples that should match the test distribution (Chen et al., [“FrugalGPT”](https://arxiv.org/abs/2305.05176) (2023)). Because calibration can fail on new tasks, check any such threshold on your own labeled data, and pair it with rule checks where [models can be confidently wrong](#document-extraction).

## Planned visuals

- **`chart` (illustrative):** risk-coverage curves for a useful and a useless confidence signal, showing error on answered questions falling as the system abstains more.
- **`stepper`:** semantic entropy step by step: sample answers, cluster them by meaning, compute entropy over the clusters, compare with token-level entropy.
- **`mermaid` (flowchart):** a confidence-based cascade: small model, score, accept, escalate to a larger model or send to human review.

## Talk like an expert

Experts separate discrimination (does the score rank right answers above wrong ones, often read as AUROC) from calibration (do 80% answers come true 80% of the time), and they report risk-coverage curves instead of one accuracy number. They ask where a confidence number came from (logprobs, verbalized, sampled or a trained probe) before they let it gate anything.

## Go deeper

- Kadavath et al., [“Language Models (Mostly) Know What They Know”](https://arxiv.org/abs/2207.05221) (2022).
- Kuhn et al., [“Semantic Uncertainty: Linguistic Invariances for Uncertainty Estimation in Natural Language Generation”](https://arxiv.org/abs/2302.09664) (2023).
- Tian et al., [“Just Ask for Calibration: Strategies for Eliciting Calibrated Confidence Scores from Language Models Fine-Tuned with Human Feedback”](https://arxiv.org/abs/2305.14975) (2023).
- Geifman and El-Yaniv, [“Selective Classification for Deep Neural Networks”](https://arxiv.org/abs/1705.08500) (2017).

## Related

- [Probability, statistics and information theory](#probability-information)
- [Classification and regression metrics](#classification-metrics)
- [Decoding and sampling](#decoding-sampling)
- [Hallucination and factuality](#hallucination-factuality)
- [LLM-as-judge done right](#llm-as-judge)
- [Guardrails and control](#guardrails-control)
