---
id: trainable-deep-networks
book: 1
order: "1.5.1"
title: "Making deep networks trainable: initialization, normalization and residuals"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [initialization, normalization, residual-connections, dropout, activations]
visuals: []
prerequisites: [neural-networks]
---
> [!tldr]
> A deep network multiplies its signal by one weight matrix per layer, so activations and gradients tend to shrink toward zero or blow up as depth grows. Careful initialization, normalization layers and residual connections keep that signal at a usable scale, and together they are why networks with a hundred or more layers train at all. The one thing to remember: when a deep network will not train, check the scale of activations and gradients layer by layer before you blame the data.

## Key ideas

- **Depth multiplies.** The gradient that reaches an early layer is a product of one matrix per later layer, so it can vanish (a sigmoid’s gradient vanishes for both large and small inputs) or explode (a product of 100 random Gaussian matrices blows up), and weights that all start at the same value never break their symmetry ([Dive into Deep Learning, “Numerical Stability and Initialization”](https://d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html)). The first checks for a network that will not learn: an initial loss that matches chance (about 2.302 for ten classes, since −ln 0.1 ≈ 2.302), the ability to overfit about 20 examples to zero loss, and per-layer histograms of activations and gradients ([CS231n notes, “Neural Networks Part 3: Learning and Evaluation”](https://cs231n.github.io/neural-networks-3/)).
- **Initialize to keep the variance steady.** Keeping activation variance constant needs n_in·σ² = 1 on the forward pass and n_out·σ² = 1 on the backward pass, so Xavier (Glorot) initialization compromises at σ² = 2 / (n_in + n_out), and for ReLU layers He et al. derived an initialization that accounts for the rectifier, usually written σ² = 2 / n_in, which let them train very deep rectified models from scratch ([Dive into Deep Learning](https://d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html); Glorot and Bengio, [“Understanding the difficulty of training deep feedforward neural networks”](https://proceedings.mlr.press/v9/glorot10a.html) (2010); He et al., [“Delving Deep into Rectifiers”](https://arxiv.org/abs/1502.01852) (2015); [CS231n notes, “Neural Networks Part 2”](https://cs231n.github.io/neural-networks-2/)). Under the Maximal Update Parametrization (μP), many optimal hyperparameters stay stable as model size changes, so they can be tuned on a small model and transferred to a large one; see [learning rate, batch size and schedules](#training-hyperparameters) (Yang et al., [“Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer”](https://arxiv.org/abs/2203.03466) (2022)).
- **Batch normalization, and the debate about why it works.** BatchNorm normalizes each channel with the mean and variance of the current mini-batch in training and with running estimates of them in evaluation, so the two modes normalize with different statistics ([PyTorch documentation, `torch.nn.BatchNorm2d`](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm2d.html)); Ioffe and Szegedy reported much higher usable learning rates, less sensitivity to initialization and a regularizing effect that sometimes made dropout unnecessary, and explained it by reduced “internal covariate shift” (Ioffe and Szegedy, [“Batch Normalization”](https://arxiv.org/abs/1502.03167) (2015)). Santurkar et al. found that the distributional stability of layer inputs has little to do with BatchNorm’s success and argued that the real effect is a significantly smoother loss landscape (Santurkar et al., [“How Does Batch Normalization Help Optimization?”](https://arxiv.org/abs/1805.11604) (2018)).
- **Normalizing without the batch.** BatchNorm’s error rises quickly as batches shrink, because batch statistics become inaccurate, while group normalization computes the mean and variance over groups of channels within one example and is independent of batch size (Wu and He, [“Group Normalization”](https://arxiv.org/abs/1803.08494) (2018)). Layer normalization uses all the units of a layer in a single example, so it does the same computation in training and at test time and applies to recurrent networks by computing the statistics separately at each time step ([Ba et al., “Layer Normalization” (2016)](https://arxiv.org/abs/1607.06450)), and RMSNorm drops LayerNorm’s re-centering and rescales by the root mean square alone, with comparable quality and lower running time (Zhang and Sennrich, [“Root Mean Square Layer Normalization”](https://arxiv.org/abs/1910.07467) (2019)).
- **Residual connections, and where the norm goes.** ResNets reformulate layers to learn residual functions with reference to their inputs; these networks were easier to optimize, reached 152 layers and won the ILSVRC 2015 classification task (He et al., [“Deep Residual Learning for Image Recognition”](https://arxiv.org/abs/1512.03385) (2015)). In [transformer blocks](#transformer-block), post-norm (normalization between residual blocks) has large expected gradients near the output at initialization and needs a learning-rate warm-up, while pre-norm (normalization inside each residual branch) has well-behaved gradients and trained comparably without warm-up (Xiong et al., [“On Layer Normalization in the Transformer Architecture”](https://arxiv.org/abs/2002.04745) (2020)).
- **Activations and dropout.** GELU, x·Φ(x), weights inputs by their value instead of gating them by sign as ReLU does; SiLU multiplies its input by the input’s sigmoid; and gated linear units multiply two linear projections, one passed through an activation, where Shazeer found variants such as GEGLU and SwiGLU improved transformer feed-forward layers over ReLU and GELU (Hendrycks and Gimpel, [“Gaussian Error Linear Units (GELUs)”](https://arxiv.org/abs/1606.08415) (2016); Elfwing et al., [“Sigmoid-Weighted Linear Units for Neural Network Function Approximation in Reinforcement Learning”](https://arxiv.org/abs/1702.03118) (2017); Shazeer, [“GLU Variants Improve Transformer”](https://arxiv.org/abs/2002.05202) (2020)). Dropout randomly removes units and their connections during training and approximates averaging all those thinned networks at test time (Srivastava et al., [“Dropout: A Simple Way to Prevent Neural Networks from Overfitting”](https://jmlr.org/papers/v15/srivastava14a.html) (2014)).

## Planned visuals

- **`chart`: the signal through 50 layers.** The standard deviation of activations at each layer of a deep ReLU network under three initializations (too small, Xavier, He), computed from a seeded simulation, so the reader sees one collapse, one drift and one hold steady.
- **`diagram`: what each normalization averages over.** A batch × channels × positions tensor with the slice that BatchNorm, LayerNorm, GroupNorm and RMSNorm each compute statistics over, plus which ones depend on the batch.
- **`stepper`: debugging a network that will not train.** Check the initial loss against chance, overfit a tiny subset, read per-layer activation and gradient histograms, check the ratio of update size to weight size, then adjust initialization, normalization or the learning rate.

## Talk like an expert

Experts talk about **signal propagation**, **fan-in and fan-out**, **Kaiming init**, **pre-norm versus post-norm**, the **residual stream** and **warm-up**, and they diagnose a run from per-layer activation and gradient statistics; loss spikes at large scale are a separate topic, covered in [training stability](#training-stability).

## Go deeper

- Glorot and Bengio, [“Understanding the difficulty of training deep feedforward neural networks”](https://proceedings.mlr.press/v9/glorot10a.html) (AISTATS 2010).
- Ioffe and Szegedy, [“Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift”](https://arxiv.org/abs/1502.03167) (2015).
- He et al., [“Deep Residual Learning for Image Recognition”](https://arxiv.org/abs/1512.03385) (2015).
- Xiong et al., [“On Layer Normalization in the Transformer Architecture”](https://arxiv.org/abs/2002.04745) (ICML 2020).

## Related

- [Neural networks](#neural-networks)
- [The transformer block](#transformer-block)
- [Training neural networks in practice](#training-neural-networks)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [Training stability: loss spikes and divergence](#training-stability)
- [Architecture choices in modern LLMs](#architecture-choices)
