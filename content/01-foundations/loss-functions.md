---
id: loss-functions
book: 1
order: "1.2.3"
title: Loss functions
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [loss-functions, cross-entropy, maximum-likelihood, label-smoothing, training]
visuals: []
prerequisites: [probability-information, neural-networks]
---
> [!tldr]
> A loss function turns "how wrong was this prediction?" into one number that training can push down. The most common losses are negative log-likelihoods: cross-entropy for classes and tokens, squared error for Gaussian noise. Remember that the details around the formula (which tokens count, how you average, where the logits sit in memory) matter as much as the formula itself.

## Key ideas

- **Maximum likelihood explains the most common losses.** Choosing the parameters that make the data most probable is the same as minimizing the negative log-likelihood, and its average over examples is the cross-entropy ([Dive into Deep Learning, 22.7](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/maximum-likelihood.html)). Under Gaussian noise, minimizing mean squared error is maximum likelihood too ([Dive into Deep Learning, 3.1.3](https://d2l.ai/chapter_linear-regression/linear-regression.html)).
- **The standard toolbox works on raw scores.** PyTorch ships L1 (mean absolute error), MSE, Huber, cross-entropy, binary cross-entropy, KL divergence, hinge, margin-ranking and triplet losses ([PyTorch 2.15 loss functions](https://docs.pytorch.org/docs/2.15/nn.html)), and its cross-entropy expects unnormalized logits ([CrossEntropyLoss](https://docs.pytorch.org/docs/2.15/generated/torch.nn.CrossEntropyLoss.html)). Huber is less sensitive to outliers than MSE ([HuberLoss](https://docs.pytorch.org/docs/2.15/generated/torch.nn.HuberLoss.html)), and fusing the sigmoid into binary cross-entropy is more numerically stable than applying them one after the other ([BCEWithLogitsLoss](https://docs.pytorch.org/docs/2.15/generated/torch.nn.BCEWithLogitsLoss.html)).
- **Label smoothing trades sharp targets for calibration.** It mixes the one-hot target with a uniform distribution ([CrossEntropyLoss](https://docs.pytorch.org/docs/2.15/generated/torch.nn.CrossEntropyLoss.html)). Müller et al., [“When Does Label Smoothing Help?”](https://arxiv.org/abs/1906.02629) (2019) found it improves calibration but makes a teacher trained with it much less useful for knowledge distillation.
- **Pairwise losses learn from comparisons.** A reward model under the Bradley-Terry preference model minimizes \( -\log \sigma(r(x, y_w) - r(x, y_l)) \), a binary cross-entropy on which of two answers won. DPO rewrites that same preference loss in terms of the policy through a change of variables, so no separate reward model is trained (Rafailov et al., [“Direct Preference Optimization”](https://arxiv.org/abs/2305.18290) (2023)).
- **In language models, the loss is per token.** Targets are the inputs shifted by one token, and masked positions (padding, and by default the prompt in prompt-completion data) get an ignore index of `-100` ([TRL SFT Trainer docs](https://huggingface.co/docs/trl/sft_trainer), as of November 2026). With gradient accumulation, divide the summed token losses by the total number of non-padding tokens instead of averaging per-micro-batch means, a mismatch Hugging Face fixed in its Trainer in October 2024 ([Hugging Face blog](https://huggingface.co/blog/gradient_accumulation)).
- **At scale, the loss is engineered too.** ST-MoE trains on \( L_{CE} + c_B L_B + c_z L_Z \), adding a load-balancing loss that spreads tokens across experts and a router z-loss that keeps router logits small for stability (Zoph et al., [“ST-MoE”](https://arxiv.org/abs/2202.08906) (2022)). Large-vocabulary logits can dominate memory: Wijmans et al., [“Cut Your Losses in Large-Vocabulary Language Models”](https://arxiv.org/abs/2411.09009) (2024) cut the loss computation for Gemma 2 (2B) from 24 GB to 1 MB by never materializing them.

## Planned visuals

- **`chart` (formula):** cross-entropy, squared error and hinge loss plotted against how much probability or margin the model gives the right answer, showing which loss punishes confident mistakes hardest.
- **`tokens`:** a chat example as a token strip, with prompt and padding tokens masked out of the loss, and a toggle between per-micro-batch and per-token averaging under gradient accumulation.
- **`calculator`:** logit memory as tokens per batch × vocabulary size × bytes per value, showing why large vocabularies need fused or chunked cross-entropy.

## Talk like an expert

Practitioners say "NLL", "logits", "loss masking" and "token-normalized loss", and they read losses in nats per token (divide by ln 2 for bits). Before comparing two loss curves, they ask what each one was averaged over.

## Go deeper

- Zhang et al., [*Dive into Deep Learning*, section 22.7 “Maximum Likelihood”](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/maximum-likelihood.html).
- [PyTorch 2.15 loss functions](https://docs.pytorch.org/docs/2.15/nn.html), the reference for each loss and its reduction.
- Rafailov et al., [“Direct Preference Optimization: Your Language Model is Secretly a Reward Model”](https://arxiv.org/abs/2305.18290) (2023).
- Wijmans et al., [“Cut Your Losses in Large-Vocabulary Language Models”](https://arxiv.org/abs/2411.09009) (2024).

## Related

- [Probability, statistics and information theory](#probability-information)
- [Information theory for language models](#information-theory-for-llms)
- [Reward models and preference data](#reward-modeling)
- [Supervised fine-tuning](#sft)
- [Classification and regression metrics](#classification-metrics)
- [Training neural networks in practice](#training-neural-networks)
