---
id: probability-information
book: 1
order: "1.2"
title: Probability, statistics and information theory
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [math, entropy, kl, perplexity]
visuals:
  - entropy-calc:calculator
  - ce-curve:chart
---
> [!tldr]
> Language models output probability distributions over tokens. Training minimizes cross-entropy, the surprise of the true next token; perplexity is its exponent; entropy measures uncertainty; KL divergence measures how far one distribution is from another. Statistics turns eval results into confident decisions.

## Why it matters
Loss curves, perplexity, temperature, sampling, KL penalties in RLHF, calibration and confidence intervals all rest on a small set of probabilistic ideas. Knowing them makes training reports and eval results readable.

## Intuition
Entropy is how surprised you expect to be; cross-entropy is how surprised you actually are when reality differs from your expectations. Training is learning to be less surprised by the next word.

```viz
{"id":"entropy-calc","component":"calculator","title":"A uniform choice among four tokens has 2 bits of entropy; a confident one has far less","caption":"Enter four next-token probabilities that sum to 1. Entropy measures uncertainty in bits; perplexity is the effective number of equally likely choices.","alt":"Calculator for entropy in bits and perplexity of a four-outcome probability distribution.","data":"formula","outputs":[{"id":"entropy","label":"Entropy (bits)","expr":"-(p1 * log2(p1) + p2 * log2(p2) + p3 * log2(p3) + p4 * log2(p4))","unit":"count","main":true},{"id":"perplexity","label":"Perplexity","expr":"pow(2, entropy)","unit":"count"}],"inputs":{"p1":0.25,"p2":0.25,"p3":0.25,"p4":0.25},"input_meta":{"p1":{"label":"Probability of token 1"},"p2":{"label":"Probability of token 2"},"p3":{"label":"Probability of token 3"},"p4":{"label":"Probability of token 4"}},"assumptions":["Probabilities are positive and sum to 1.","Real vocabularies have tens of thousands of tokens; the idea is the same."],"tests":[{"inputs":{},"expect":{"entropy":2,"perplexity":4},"tol":0.000001},{"inputs":{"p1":0.7,"p2":0.1,"p3":0.1,"p4":0.1},"expect":{"entropy":1.3567796,"perplexity":2.5611285},"tol":0.00001}]}
```

## How it works
**Distributions.** A model’s softmax output assigns a probability to each token; sampling draws from it. See [decoding](#decoding-sampling).

**Cross-entropy loss.** For the true token with predicted probability p, the loss is −ln p: near zero when the model is confident and right, large when it is confident and wrong.

```viz
{"id":"ce-curve","component":"chart","type":"line","title":"Cross-entropy punishes confident mistakes far more than hesitant ones","caption":"Formula view: loss −ln p for the probability p the model assigned to the correct token.","alt":"Line chart of cross-entropy loss falling from about 4.6 at p = 0.01 to 0 at p = 1.","data":"formula","x":{"label":"Probability assigned to the correct token"},"y":{"label":"Loss (nats)","min":0,"max":5},"series":[{"name":"−ln p","points":[[0.01,4.605],[0.05,2.996],[0.1,2.303],[0.25,1.386],[0.5,0.693],[0.75,0.288],[0.9,0.105],[1,0]]}]}
```

**Perplexity.** The exponential of average cross-entropy; roughly, how many equally likely tokens the model is choosing among.

**KL divergence.** A measure of how one distribution differs from another; used to keep a fine-tuned policy close to its reference in RLHF and in distillation. See [preference optimization](#preference-optimization).

**Calibration.** A model is calibrated if its 70%-confident predictions are right about 70% of the time. Post-training often hurts calibration; check it before using model confidence for routing.

**Statistics for evals.** Sampling error, confidence intervals and paired comparisons decide whether a score change is real. See [statistics for evals](#eval-statistics).

## In practice
- Read training loss in nats or bits consistently; compare perplexities only with the same tokenizer.
- Use token log-probabilities, where APIs provide them, for confidence signals, and check their calibration.
- Report eval results with intervals.

## Numbers to know
> [!number]
> Formulas. Entropy H = −Σ p log₂ p bits; perplexity = 2^H (or e^loss in nats). Cross-entropy of a correct token at probability 0.5 is about 0.69 nats.

## Pitfalls and anti-patterns
> [!pitfall] Comparing perplexity across tokenizers
> Different tokenizers split text differently, so per-token perplexities are not comparable.

- **Trusting raw model confidence.** Calibrate it first.

## Talk like an expert
The vocabulary: **probability distribution**, **softmax**, **entropy**, **cross-entropy**, **perplexity**, **KL divergence**, **calibration**, **log-probabilities**, **confidence interval**. Experts read loss curves and eval tables probabilistically. The live debate is how to get calibrated uncertainty from models trained to be helpful.

> [!hottake] Calibration is the most neglected property of production models.
> **The counterargument:** for most applications, grounding, verification and good UX matter more than calibrated probabilities, which users rarely see.

## Check yourself
```quiz
probability-information
```

## Go deeper
- Cover and Thomas, *Elements of Information Theory*.
- Guo et al., “On Calibration of Modern Neural Networks” (2017).

## Related
- [Decoding and sampling](#decoding-sampling)
- [Statistics for evals](#eval-statistics)
- [Preference optimization](#preference-optimization)
- [Linear algebra for AI](#linear-algebra)
- [Calculus and optimization](#calculus-optimization)
- [What a language model is: from n-grams to neural networks](#language-modeling)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Distributions, estimation and sampling](#distributions-and-estimation)
- [Information theory for language models](#information-theory-for-llms)
- [Loss functions](#loss-functions)
- [Uncertainty and confidence estimation for LLMs](#llm-uncertainty)
