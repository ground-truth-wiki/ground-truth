---
id: calculus-optimization
book: 1
order: "1.3"
title: Calculus and optimization
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [math, gradients, adam, optimizers]
visuals:
  - lr-schedule:chart
  - optimizer-compare:compare
---
> [!tldr]
> Training minimizes a loss by following its gradient downhill. Backpropagation computes gradients efficiently; optimizers such as Adam and AdamW adapt step sizes per parameter; learning-rate schedules with warmup and decay, gradient clipping and weight decay keep training stable.

## Why it matters
Learning rate, warmup, batch size and optimizer choice decide whether a fine-tune converges, diverges or overfits. Understanding them turns hyperparameters from magic numbers into knobs you can reason about.

## Intuition
Training is walking down a foggy mountain by feel: the gradient tells you which way is downhill, the learning rate how big a step to take, and momentum keeps you rolling through small bumps.

```viz
{"id":"lr-schedule","component":"chart","type":"line","title":"Warm up, then decay: the most common learning-rate schedule","caption":"Formula view: linear warmup over 1,000 steps to a peak of 3 × 10⁻⁴, then cosine decay to 3 × 10⁻⁵ at step 10,000.","alt":"Line chart of a learning rate warming up linearly to a peak and decaying along a cosine curve.","data":"formula","x":{"label":"Training step"},"y":{"label":"Learning rate (×10⁻⁴)","min":0,"max":3.5},"series":[{"name":"Learning rate","points":[[0,0],[500,1.5],[1000,3],[3000,2.68],[5500,1.65],[8000,0.62],[10000,0.3]]}]}
```

## How it works
**Gradients and backpropagation.** The gradient of the loss with respect to each parameter says how changing it would change the loss; backpropagation computes all of them with the chain rule in about twice the cost of a forward pass. See [neural networks](#neural-networks).

**Stochastic gradient descent.** Estimate the gradient on a mini-batch and step against it; noise from small batches can help generalization.

**Momentum and Adam.** Momentum averages past gradients to smooth the path; Adam (Kingma and Ba, 2014) also scales each parameter’s step by a running estimate of its gradient magnitude; AdamW (Loshchilov and Hutter, 2017) decouples weight decay. Newer optimizers now run at scale: Muon, which orthogonalizes momentum updates for hidden-layer weight matrices, pretrained the 1-trillion-parameter Kimi K2 as the variant MuonClip (2025), and as of November 2026 it ships in torch.optim.

```viz
{"id":"optimizer-compare","component":"compare","title":"Plain SGD versus Adam on the same problem","caption":"Simplified. Hover the marks.","alt":"Comparison of stochastic gradient descent and Adam in how they choose step sizes.","data":"illustrative","mono":false,"a":{"title":"SGD with momentum","text":"One learning rate for every parameter. Steps follow the averaged gradient. Sensitive to scale differences between parameters; often generalizes well with careful tuning.","mono":false},"b":{"title":"Adam or AdamW","text":"Each parameter gets its own effective step size from running averages of the gradient and its square. Robust to scale differences; the default for transformers. Costs two extra values per parameter of memory.","mono":false},"links":[{"a":"One learning rate for every parameter.","b":"Each parameter gets its own effective step size","note":"Adaptive steps handle parameters with very different gradient scales."},{"b":"Costs two extra values per parameter of memory.","note":"Part of the 16 bytes per parameter of training state."}]}
```

**Stability tools.** Warmup avoids large early steps; decay (cosine or linear) refines late; gradient clipping caps rare huge gradients; weight decay limits weight growth; mixed precision with loss scaling avoids underflow in FP16, while BF16 has FP32’s exponent range and usually needs no loss scaling. See [distributed training](#distributed-training).

**Loss landscapes.** High-dimensional losses have many good minima; flat minima are often linked to better generalization (Keskar et al., 2016), though sharpness depends on how the network is parametrized (Dinh et al., 2017), so the link is debated; large learning rates can cause loss spikes and divergence.

## In practice
- For fine-tuning, start with the recipe’s learning rate and warmup; lower the learning rate first if loss spikes.
- Watch training and validation loss together to spot overfitting.
- Use gradient clipping by default; log gradient norms.

## Numbers to know
> [!number]
> Rules of thumb. Fine-tuning learning rates are usually far smaller than pretraining peaks; LoRA tolerates higher rates than full fine-tuning. Warmup of a few hundred to a few thousand steps is common.

## Pitfalls and anti-patterns
> [!pitfall] Raising the learning rate to train faster
> Too large a rate causes spikes and divergence; lower rates with more steps are usually safer.

- **Ignoring validation loss.** Training loss always goes down; validation tells you whether learning generalizes.

## Talk like an expert
The vocabulary: **gradient**, **backpropagation**, **learning rate**, **warmup**, **cosine decay**, **momentum**, **Adam**, **AdamW**, **weight decay**, **gradient clipping**, **loss spike**. Experts diagnose training from loss and gradient-norm curves. The live debate is whether new optimizers will displace Adam at scale.

> [!hottake] Learning rate is the only hyperparameter most fine-tunes need to tune.
> **The counterargument:** data quality, number of epochs and batch size often matter as much, and a perfect learning rate cannot rescue bad data.

## Check yourself
```quiz
calculus-optimization
```

## Go deeper
- Kingma and Ba, “Adam” (2014); Loshchilov and Hutter, “Decoupled Weight Decay Regularization” (2017).
- Goodfellow, Bengio and Courville, *Deep Learning*, chapter 8.

## Related
- [Neural networks](#neural-networks)
- [Distributed training](#distributed-training)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Probability and information theory](#probability-information)
- [Linear algebra for AI](#linear-algebra)
