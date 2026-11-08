---
id: scaling-laws
book: 3
order: "3.2"
title: Scaling laws and compute
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [scaling, chinchilla, compute]
visuals:
  - scaling-chart:chart
  - chinchilla-calc:calculator
---
> [!tldr]
> Model loss falls predictably as a power law in parameters, data and compute. Chinchilla showed compute-optimal training uses about 20 tokens per parameter; modern models train far longer to make inference cheaper. Training compute is roughly 6 × parameters × tokens, and test-time compute is now a second axis of scaling.

## Why it matters
Scaling laws explain why the field spent billions on compute, why models are “overtrained” relative to Chinchilla, and why reasoning models spend more compute per answer. They also let you estimate training costs and compare models’ training budgets from published numbers.

## Intuition
Scaling laws are the fuel-efficiency curves of AI: double the fuel and you go further, but each doubling buys a little less. Knowing the curve tells you how to split the fuel between a bigger engine and a longer drive.

```viz
{"id":"scaling-chart","component":"chart","type":"line","title":"Loss falls steadily with every tenfold increase in compute, with diminishing returns","caption":"Illustrative curve with the power-law shape reported in scaling-law papers, approaching an irreducible loss; not real measurements.","alt":"Illustrative log-scale line chart of training loss falling with training compute from 10^19 to 10^25 FLOP.","data":"illustrative","x":{"label":"Training compute (FLOP, log scale)","log":true},"y":{"label":"Training loss","min":1.5,"max":4},"series":[{"name":"Compute-optimal models","points":[[1e19,3.6],[1e20,3.2],[1e21,2.85],[1e22,2.55],[1e23,2.3],[1e24,2.1],[1e25,1.95]]}]}
```

## How it works
**Power laws.** Kaplan et al. (2020) found loss falls as a power law in parameters, data and compute over many orders of magnitude, which made it possible to predict large models’ performance from small runs.

**Compute-optimal training.** Hoffmann et al. (2022), the Chinchilla paper, found that for a fixed compute budget, parameters and tokens should grow together, at about 20 training tokens per parameter; Chinchilla (70B parameters, 1.4T tokens) beat the much larger Gopher.

**Training compute.** About 6 FLOPs per parameter per token (2 forward, 4 backward):

```viz
{"id":"chinchilla-calc","component":"calculator","title":"Chinchilla used about 5.9 × 10²³ FLOP; Llama 3 8B trained on about 94 times its compute-optimal token count","caption":"Formula view: compute ≈ 6 × parameters × tokens, and the Chinchilla rule of about 20 tokens per parameter. Defaults reproduce Chinchilla; try 8 billion parameters and 15 trillion tokens.","alt":"Calculator for training compute in units of 10^21 FLOP, compute-optimal token count and the ratio of actual to optimal tokens.","data":"formula","outputs":[{"id":"zflop","label":"Training compute (×10²¹ FLOP)","expr":"6 * params_b * tokens_t","unit":"count","main":true},{"id":"opt_tokens_t","label":"Chinchilla-optimal tokens (trillions)","expr":"20 * params_b / 1000","unit":"count"},{"id":"ratio","label":"Actual ÷ optimal tokens","expr":"tokens_t / opt_tokens_t","unit":"count"}],"inputs":{"params_b":70,"tokens_t":1.4},"input_meta":{"params_b":{"label":"Parameters","unit":"billions"},"tokens_t":{"label":"Training tokens","unit":"trillions"}},"assumptions":["Dense model; for MoE use active parameters for compute.","Ignores attention FLOPs, which matter at long sequence lengths."],"tests":[{"inputs":{},"expect":{"zflop":588,"opt_tokens_t":1.4,"ratio":1},"tol":0.000001},{"inputs":{"params_b":8,"tokens_t":15},"expect":{"zflop":720,"ratio":93.75},"tol":0.000001}]}
```

**Inference-aware scaling.** A model served billions of times is cheaper to run if it is smaller; so labs train smaller models on far more tokens than Chinchilla-optimal, accepting extra training compute for cheaper inference.

**Data constraints.** When unique high-quality data runs out, repeating data has diminishing returns (Muennighoff et al., 2023), which motivates better filtering and synthetic data. See [pretraining data](#pretraining-data).

**Test-time compute.** Reasoning models scale performance with compute spent while answering: longer thinking, more samples, search. See [reasoning models](#reasoning-models) and [test-time scaling](#test-time-scaling).

**Emergence and predictability.** Some capabilities appear to jump suddenly with scale; part of that apparent emergence comes from the choice of metric, as smoother metrics show more gradual improvement (Schaeffer et al., 2023).

## In practice
- Estimate training cost from parameters and tokens; divide by achievable FLOPs per GPU to get GPU-hours. See [numbers to know](#numbers-to-know).
- Read “trained on N tokens” in model cards relative to the Chinchilla ratio to understand the trade-off a lab made.
- For fine-tuning, compute is small relative to pretraining; data quality dominates. See [fine-tuning in practice](#fine-tuning-practice).

## Numbers to know
> [!number]
> Formulas. Training FLOPs ≈ 6 × N × D. Compute-optimal D ≈ 20 × N. Forward pass ≈ 2 × N FLOPs per token. Chinchilla: 70B parameters, 1.4T tokens, about 5.9 × 10²³ FLOP.

## Pitfalls and anti-patterns
> [!pitfall] Extrapolating scaling curves to capabilities
> Loss falls smoothly; specific capabilities and benchmark scores can behave very differently.

- **Ignoring inference cost.** A compute-optimal model may be the wrong model to serve at scale.

## Talk like an expert
The vocabulary: **scaling law**, **power law**, **compute-optimal**, **Chinchilla ratio**, **overtraining**, **6ND**, **irreducible loss**, **test-time compute**, **emergence**. Experts quote training budgets in FLOP and tokens per parameter. The live debate is how long pretraining scaling continues to pay, and how much future progress comes from test-time compute and reinforcement learning instead.

> [!hottake] Pretraining scaling is slowing; reinforcement learning and test-time compute are where the next gains come from.
> **The counterargument:** each generation of pretraining has continued to deliver gains, and stronger base models make reinforcement learning and reasoning more effective, so the axes compound rather than compete.

## Check yourself
```quiz
scaling-laws
```

## Go deeper
- Kaplan et al., “Scaling Laws for Neural Language Models” (2020).
- Hoffmann et al., “Training Compute-Optimal Large Language Models” (2022).
- Muennighoff et al., “Scaling Data-Constrained Language Models” (2023).

## Related
- [Pretraining data](#pretraining-data)
- [Distributed training](#distributed-training)
- [Reasoning models and test-time compute](#reasoning-models)
- [Numbers every AI engineer should know](#numbers-to-know)
- [Reasoning and test-time scaling](#test-time-scaling)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [The pretraining run, end to end](#pretraining-run)
- [Data mixtures, repetition and curricula](#data-mixing)
- [Evaluating models during pretraining](#base-model-evaluation)
- [Scaling trends and limits: compute, cost, data and power](#scaling-trends-limits)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Compute accounting: FLOP, GPU-hours and utilization](#compute-accounting)
