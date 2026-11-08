---
id: optimizers
book: 1
order: "1.3.2"
title: Optimizers in depth
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [optimizers, adam, adamw, muon, training]
visuals: []
prerequisites: [calculus-optimization]
---
> [!tldr]
> An optimizer turns gradients into parameter updates: how far to step, in which direction, and with how much memory of past steps. AdamW has been the default for large language models; memory-saving variants cut its cost, and preconditioned and orthogonalized methods such as Shampoo and Muon now compete with it. Remember that an optimizer's claimed speedup means little until it beats a well-tuned baseline on the same budget.

## Key ideas

- **Adam adapts the step per parameter.** It keeps running averages of the gradient and its square, corrects their bias toward zero early in training, and divides one by the square root of the other; the paper's defaults are a step size of 0.001, β1 = 0.9, β2 = 0.999 and ε = 10⁻⁸ (Kingma and Ba, [“Adam: A Method for Stochastic Optimization”](https://arxiv.org/abs/1412.6980) (2014)).
- **Weight decay is not L2 regularization for Adam.** The two are equivalent for plain SGD but not for adaptive methods; AdamW decouples weight decay from the gradient step, which also decouples the best weight decay from the learning rate (Loshchilov and Hutter, [“Decoupled Weight Decay Regularization”](https://arxiv.org/abs/1711.05101) (2017)).
- **Optimizer state is the largest part of model memory.** Mixed-precision Adam needs about 16 bytes per parameter: 2 for 16-bit weights, 2 for gradients and 12 for 32-bit master weights, momentum and variance, so the optimizer states usually take the most memory, and ZeRO shards them across data-parallel workers (Rajbhandari et al., [“ZeRO”](https://arxiv.org/abs/1910.02054) (2019)). Adafactor stores only row and column statistics of the second moment ([Shazeer and Stern, 2018](https://arxiv.org/abs/1804.04235)), 8-bit optimizers quantize the states block-wise and match 32-bit results ([Dettmers et al., 2021](https://arxiv.org/abs/2110.02861)), and Lion keeps only momentum and takes the sign of its update, so every parameter moves by the same magnitude ([Chen et al., 2023](https://arxiv.org/abs/2302.06675)).
- **Beyond one number per parameter.** Shampoo keeps a preconditioning matrix for each dimension of a weight tensor ([Gupta et al., 2018](https://arxiv.org/abs/1802.09568)), and SOAP runs Adam in the eigenbasis of Shampoo's preconditioner ([Vyas et al., 2024](https://arxiv.org/abs/2409.11321)). Muon orthogonalizes the momentum update of 2D hidden-layer weights with a few Newton-Schulz steps, while embeddings, the output head and scalar or vector parameters stay on AdamW ([Jordan et al., 2024](https://kellerjordan.github.io/posts/muon/)); as of November 2026 it ships as `torch.optim.Muon` ([PyTorch 2.15 docs](https://docs.pytorch.org/docs/2.15/generated/torch.optim.Muon.html)).
- **Muon at scale, as dated examples.** Liu et al., [“Muon is Scalable for LLM Training”](https://arxiv.org/abs/2502.16982) (2025) treat AdamW as the de facto optimizer for large-scale LLM training and report that Muon reaches about 2× its compute efficiency under compute-optimal training. They trained Moonlight, a 3B/16B-parameter mixture-of-experts model, on 5.7T tokens. Kimi K2 (2025), with 1 trillion total and 32 billion activated parameters, was pretrained on 15.5T tokens with a Muon variant, MuonClip, and reported zero loss spikes ([Kimi Team, 2025](https://arxiv.org/abs/2507.20534)).
- **Compare optimizers fairly.** The AlgoPerf competition fixes the hardware and workloads and scores time to a target result; Distributed Shampoo won the external-tuning ruleset and Schedule-Free AdamW the self-tuning one, and the authors discuss how hard fair comparison is to engineer (Kasimbeg et al., [“Accelerating neural network training: An analysis of the AlgoPerf competition”](https://proceedings.iclr.cc/paper_files/paper/2025/hash/6bdde0373d53d4a501249547084bed43-Abstract-Conference.html) (2025)). Schedule-Free removes the need to know the stopping step in advance (Defazio et al., [“The Road Less Scheduled”](https://arxiv.org/abs/2405.15682) (2024)).

## Planned visuals

- **`explorer`:** a loss landscape where SGD, momentum, Adam and Muon race from a start point the reader drags, with a learning-rate slider (the Book 1 signature visual for this topic).
- **`budget`:** optimizer-state bytes per parameter for SGD with momentum, Adam in mixed precision, 8-bit Adam and Adafactor, stacked against the weights and gradients.
- **`matrix`:** a dated table of the optimizer, betas, weight decay and schedule that open model reports state, each row with its source.

## Talk like an expert

Experts talk about first and second moments, preconditioners and decoupled weight decay, and they quote optimizer state in bytes per parameter. They distrust a speedup until it beats a well-tuned AdamW baseline at the same compute budget.

## Go deeper

- Kingma and Ba, [“Adam: A Method for Stochastic Optimization”](https://arxiv.org/abs/1412.6980) (2014).
- Loshchilov and Hutter, [“Decoupled Weight Decay Regularization”](https://arxiv.org/abs/1711.05101) (2017).
- Jordan et al., [“Muon: An optimizer for hidden layers in neural networks”](https://kellerjordan.github.io/posts/muon/) (2024).
- Kasimbeg et al., [“Accelerating neural network training: An analysis of the AlgoPerf competition”](https://proceedings.iclr.cc/paper_files/paper/2025/hash/6bdde0373d53d4a501249547084bed43-Abstract-Conference.html) (2025).

## Related

- [Calculus and optimization](#calculus-optimization)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [Distributed training](#distributed-training)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
- [Training stability: loss spikes and divergence](#training-stability)
