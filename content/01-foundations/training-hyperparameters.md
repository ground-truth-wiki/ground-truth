---
id: training-hyperparameters
book: 1
order: "1.3.3"
title: Learning rate, batch size and schedules
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [learning-rate, batch-size, schedules, hyperparameters, mup]
visuals: []
prerequisites: [calculus-optimization]
---
> [!tldr]
> The learning rate sets the step size, the batch size sets how many tokens each step sees, and the schedule changes the learning rate over the run. Together they decide whether training converges, how fast, and how much compute is wasted. The one thing to remember: they interact with each other and with model size, so a value tuned in one setting often does not transfer unchanged to another.

## Key ideas

- **A published recipe, as a dated example.** LLaMA trained with AdamW (β1 = 0.9, β2 = 0.95), a peak learning rate of 3 × 10⁻⁴ for the two smaller models and 1.5 × 10⁻⁴ for the two larger ones, 2,000 warmup steps, a cosine schedule ending at 10% of the peak, weight decay 0.1, gradient clipping 1.0 and batches of 4M tokens (Touvron et al., [“LLaMA: Open and Efficient Foundation Language Models”](https://arxiv.org/abs/2302.13971) (2023)). Fine-tuning defaults are lower: as of November 2026, TRL's SFT trainer defaults to a learning rate of 2 × 10⁻⁵ and suggests about 10⁻⁴ when training adapters ([TRL SFT Trainer docs](https://huggingface.co/docs/trl/sft_trainer)).
- **Schedules that do not fix the run length.** The Warmup-Stable-Decay (WSD) scheduler holds the learning rate constant after warmup and decays only at the end (about 10% of training sufficed in its experiments), so a checkpoint from before the decay can keep training, which also makes data-model scaling studies cheaper (Hu et al., [“MiniCPM”](https://arxiv.org/abs/2404.06395) (2024)). Hägele et al., [“Scaling Laws and Compute-Optimal Training Beyond Fixed Training Durations”](https://arxiv.org/abs/2405.18392) (2024) found that a constant rate with a cooldown scales like cosine decay, which ties a run to a fixed length, and that stochastic weight averaging helps along the way.
- **Batch size in tokens, ramped up.** Large runs count the global batch in tokens and may grow it during training. Llama 3 405B started at 4M tokens, doubled to 8M (with the sequence length going from 4,096 to 8,192) after 252M tokens and to 16M after 2.87T tokens, using smaller batches early for stability and larger ones later for efficiency (Grattafiori et al., [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024)).
- **There is a largest useful batch.** The gradient noise scale predicts the largest batch size that still uses data efficiently, and it grows as the loss falls (McCandlish et al., [“An Empirical Model of Large-Batch Training”](https://arxiv.org/abs/1812.06162) (2018)). For language-model pretraining, Zhang et al., [“How Does Critical Batch Size Scale in Pre-training?”](https://arxiv.org/abs/2410.21676) (2024) found the critical batch size scales mainly with data size, not model size.
- **The learning rate moves with the batch.** For SGD, the linear scaling rule raises the learning rate in proportion to the batch size, with a warmup; it trained ResNet-50 at a batch of 8,192 images on 256 GPUs in one hour (Goyal et al., [“Accurate, Large Minibatch SGD”](https://arxiv.org/abs/1706.02677) (2017)). For Adam and RMSprop, Malladi et al., [“On the SDEs and Scaling Rules for Adaptive Gradient Algorithms”](https://arxiv.org/abs/2205.10287) (2022) derive a square-root scaling rule for their hyperparameters instead.
- **Transfer hyperparameters across sizes with μP.** Under the Maximal Update Parametrization, many optimal hyperparameters stay stable as the model grows, so they can be tuned on a small proxy; tuning a 40M-parameter model beat published GPT-3 6.7B results at about 7% of its pretraining cost (Yang et al., [“Tensor Programs V”](https://arxiv.org/abs/2203.03466) (2022)). In the standard parametrization, the best learning rate of an MLP shifted by roughly an order of magnitude as its width grew from 256 to 8,192, and the smallest model's best value did very badly or diverged on the largest (same source).

## Planned visuals

- **`chart` (formula):** cosine, warmup-stable-decay and constant-with-cooldown schedules on one axis, with the run extended halfway to show which schedules can continue from a mid-run checkpoint.
- **`calculator`:** global batch in tokens as micro-batch × sequence length × accumulation steps × data-parallel devices, and the optimizer steps needed for a token budget.
- **`chart` (real data):** the Llama 3 405B batch-size ramp against tokens seen, sourced from its report.

## Talk like an expert

Experts quote batch size in tokens, not sequences, talk about the peak learning rate, warmup and the cooldown or anneal, and ask whether a hyperparameter was tuned at the target scale or transferred from a proxy model.

## Go deeper

- McCandlish et al., [“An Empirical Model of Large-Batch Training”](https://arxiv.org/abs/1812.06162) (2018).
- Goyal et al., [“Accurate, Large Minibatch SGD: Training ImageNet in 1 Hour”](https://arxiv.org/abs/1706.02677) (2017).
- Hägele et al., [“Scaling Laws and Compute-Optimal Training Beyond Fixed Training Durations”](https://arxiv.org/abs/2405.18392) (2024).
- Yang et al., [“Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer”](https://arxiv.org/abs/2203.03466) (2022).

## Related

- [Calculus and optimization](#calculus-optimization)
- [Optimizers in depth](#optimizers)
- [Scaling laws and compute](#scaling-laws)
- [Training neural networks in practice](#training-neural-networks)
- [The pretraining run, end to end](#pretraining-run)
- [Training stability: loss spikes and divergence](#training-stability)
