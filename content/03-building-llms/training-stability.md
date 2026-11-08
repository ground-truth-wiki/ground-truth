---
id: training-stability
book: 3
order: "3.3.3"
title: "Training stability: loss spikes and divergence"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [training-stability, loss-spikes, z-loss, qk-norm, pretraining]
visuals: []
prerequisites: [distributed-training, calculus-optimization]
---
> [!tldr]
> A large training run is unstable when its loss or gradient norm jumps suddenly, and it diverges when the loss never comes back down. Spikes waste compute and can end a run, so model reports now describe the changes they made to prevent them. Remember that many known fixes keep logits from growing without bound: attention logits, output logits and router logits.

## Key ideas

- **Watch the gradient norm, not only the loss.** The OLMo 2 team found that gradient-norm spikes often came before loss spikes, and measured instability with a "spike score": the share of values more than seven standard deviations away from a rolling average of the last 1,000 values ([Team OLMo, “2 OLMo 2 Furious” (2024)](https://arxiv.org/html/2501.00656v3)). Vanishing and exploding gradients, the older form of the problem in deep networks, are covered in [Making deep networks trainable](#trainable-deep-networks).
- **Spikes come from data meeting a model state.** PaLM's largest model spiked about 20 times despite gradient clipping; the team restarted from a checkpoint about 100 steps before each spike and skipped about 200 to 500 batches, and since the same batches did not cause a spike from an earlier checkpoint, they concluded that spikes come from specific batches combined with a particular parameter state ([Chowdhery et al., “PaLM: Scaling Language Modeling with Pathways” (2022)](https://arxiv.org/abs/2204.02311)). OLMo 2 removed documents with a run of 32 or more repeated n-grams and masked such runs in the loss, which reduced gradient spikes but did not remove them ([Team OLMo, 2024](https://arxiv.org/html/2501.00656v3)).
- **Logits that grow too large are a known mechanism.** In ViT-22B, attention logits grew until attention weights were almost one-hot, and applying LayerNorm to queries and keys (QK-norm) fixed the divergence ([Dehghani et al., “Scaling Vision Transformers to 22 Billion Parameters” (2023)](https://arxiv.org/abs/2302.05442)); an auxiliary z-loss of 10⁻⁴·log²Z pushes log Z, the log of the output softmax normalizer, toward 0 ([Chowdhery et al., 2022](https://arxiv.org/abs/2204.02311)), and a router z-loss does the same for the gating logits of mixture-of-experts models ([Zoph et al., “ST-MoE: Designing Stable and Transferable Sparse Expert Models” (2022)](https://arxiv.org/abs/2202.08906)). Both logit failures appear in small models at high learning rates, so cheap small-scale proxies can test fixes before a large run ([Wortsman et al., “Small-scale proxies for large-scale Transformer training instabilities” (2023)](https://arxiv.org/abs/2309.14322)).
- **Open reports show the fixes in use, with dates.** Gemma 2 (2024) soft-capped logits as soft_cap · tanh(logits / soft_cap), with 50 in the self-attention layers and 30 at the final layer ([Gemma Team, “Gemma 2: Improving Open Language Models at a Practical Size” (2024)](https://arxiv.org/html/2408.00118v3)), and Gemma 3 (2025) replaced soft-capping with QK-norm ([Gemma Team, “Gemma 3 Technical Report” (2025)](https://arxiv.org/html/2503.19786)). OLMo 2 combined QK-norm, z-loss and no weight decay on embeddings. In its ablation of a new initialization, which draws every parameter from a normal distribution with standard deviation 0.02, the gradient-norm spike score fell from 0.40 to 0.03 ([Team OLMo, 2024](https://arxiv.org/html/2501.00656v3)).
- **Optimizer settings can cause trouble too.** Wortsman et al. show that the default AdamW ε becomes too large once gradients shrink, so updates become too small, and that a longer warmup and weight decay set independently of the learning rate both reduce how sensitive the final loss is to the learning rate, while μP kept the best learning rate stable across the model sizes they tested but did not reduce that sensitivity in their experiments ([Wortsman et al., 2023](https://arxiv.org/html/2309.14322)); OLMo 2 lowered ε from 10⁻⁵ to 10⁻⁸ ([Team OLMo, 2024](https://arxiv.org/html/2501.00656v3)). Precision failures (overflow, rounding, scaling) are covered in [Mixed and low-precision training](#low-precision-training).
- **Read stability claims for their exact wording.** DeepSeek-V3 (2024) reports no "irrecoverable" loss spikes and no rollbacks, which still allows spikes that recovered on their own ([DeepSeek-AI, “DeepSeek-V3 Technical Report” (2024)](https://arxiv.org/abs/2412.19437)), while Kimi K2 (2025) reports "zero loss spike" over 15.5T tokens with its MuonClip optimizer ([Kimi Team, “Kimi K2: Open Agentic Intelligence” (2025)](https://arxiv.org/abs/2507.20534)). The loss-landscape ideas engineers hear about are older and partly contested: saddle points rather than poor local minima as the main obstacle ([Dauphin et al., “Identifying and attacking the saddle point problem in high-dimensional non-convex optimization” (2014)](https://arxiv.org/abs/1406.2572)), flat minima linked to better generalization ([Keskar et al., “On Large-Batch Training for Deep Learning: Generalization Gap and Sharp Minima” (2016)](https://arxiv.org/abs/1609.04836)) against the argument that the symmetries of rectifier networks allow equivalent models at arbitrarily sharper minima ([Dinh et al., “Sharp Minima Can Generalize For Deep Nets” (2017)](https://arxiv.org/abs/1703.04933)), and grokking, where generalization arrives well past the point of overfitting ([Power et al., “Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets” (2022)](https://arxiv.org/abs/2201.02177)).

## Planned visuals

- **`chart`:** a loss curve and a gradient-norm curve on a shared step axis, showing a healthy run, a recoverable spike, a divergence and the PaLM-style rewind and batch skip (illustrative).
- **`tree`:** a diagnosis tree from symptom (loss spike, gradient-norm spike, slow gradient-norm growth, divergence) to likely cause and the mitigation reports used, each leaf linked to its source.
- **`matrix`:** a dated table of the stability measures open model reports state (z-loss, QK-norm, soft-capping, initialization, embedding weight decay, ε), one row per report.

## Talk like an expert

Experts talk about attention-logit growth, output-logit divergence, z-loss, QK-norm and spike scores, and they test a mitigation on small proxies at high learning rates before trusting it at scale. They read "no loss spikes" in a report as a claim about one run, with its own data, optimizer and architecture.

## Go deeper

- Chowdhery et al., [“PaLM: Scaling Language Modeling with Pathways”](https://arxiv.org/abs/2204.02311) (2022), section 5.1.
- Wortsman et al., [“Small-scale proxies for large-scale Transformer training instabilities”](https://arxiv.org/abs/2309.14322) (2023).
- Team OLMo, [“2 OLMo 2 Furious”](https://arxiv.org/abs/2501.00656) (2024), section 3 on pretraining stability.
- Zoph et al., [“ST-MoE: Designing Stable and Transferable Sparse Expert Models”](https://arxiv.org/abs/2202.08906) (2022).

## Related

- [Distributed training](#distributed-training)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [Mixed and low-precision training](#low-precision-training)
- [Architecture choices in modern LLMs](#architecture-choices)
- [The pretraining run, end to end](#pretraining-run)
