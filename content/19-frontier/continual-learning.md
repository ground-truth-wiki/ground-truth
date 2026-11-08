---
id: continual-learning
book: 19
order: "19.3.2"
title: Continual learning and test-time adaptation
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [continual-learning, catastrophic-forgetting, test-time-training, adaptation, memory]
visuals: []
prerequisites: [fine-tuning-practice, agent-memory]
---
> [!tldr]
> Continual learning means training a model on a stream of new data or tasks without losing what it already knows. The obstacle is catastrophic forgetting: updating weights for new knowledge degrades old skills, while knowledge kept outside the weights, in context and memory, can be inspected and deleted but does not change the model. Remember that weight updates trade learning against forgetting, and that the research frontier is about getting more of the first for less of the second.

## Key ideas

- **Forgetting is the central problem, across training stages.** A survey of the field describes catastrophic forgetting as adapted models losing performance on knowledge they had before, and organizes continual learning for LLMs into continual pretraining, domain-adaptive pretraining and continual fine-tuning, along vertical continuity (general to specialized) and horizontal continuity (across time and domains) (Shi et al., [“Continual Learning of Large Language Models: A Comprehensive Survey”](https://arxiv.org/abs/2404.16789) (2024)). The recipe for adapting a base model to a domain is in [mid-training](#mid-training).
- **Classic methods replay, regularize or grow.** The survey sorts continual learning techniques into five groups, and three of them work like this: replay-based methods keep a small buffer of past data and retrain on it, regularization-based methods penalize moving far from the previous model's parameters, and architecture-based methods add capacity for new knowledge ([Shi et al., 2024](https://arxiv.org/abs/2404.16789)). The canonical regularizer, elastic weight consolidation, remembers old tasks by selectively slowing down learning on the weights that matter for them (Kirkpatrick et al., [“Overcoming catastrophic forgetting in neural networks”](https://arxiv.org/abs/1612.00796) (2016)).
- **Some updates forget less than others.** LoRA substantially underperformed full fine-tuning on code and math but better preserved the base model's skills outside the target domain (Biderman et al., [“LoRA Learns Less and Forgets Less”](https://arxiv.org/abs/2405.09673) (2024)); forgetting tracked the KL divergence between the fine-tuned and base model on the new task, and on-policy RL forgot less than supervised fine-tuning because it prefers solutions close to the base model (Shenfeld et al., [“RL's Razor: Why Online Reinforcement Learning Forgets Less”](https://arxiv.org/abs/2509.04259) (2025)). Updating only the memory-layer slots most activated by the new knowledge, relative to their use on pretraining data, cut the drop in NaturalQuestions F1 to 11%, against 89% for full fine-tuning and 71% for LoRA at the same level of learning (Lin et al., [“Continual Learning via Sparse Memory Finetuning”](https://arxiv.org/abs/2510.15103) (2025)); measure your own forgetting the same way, by scoring held-out general tasks before and after an update.
- **Test-time training adapts weights for one problem at a time.** Temporarily fine-tuning on each task's examples during inference gave up to 6x higher accuracy than fine-tuned baselines on the Abstraction and Reasoning Corpus (Akyürek et al., [“The Surprising Effectiveness of Test-Time Training for Few-Shot Learning”](https://arxiv.org/abs/2411.07279) (2024)). Architectures build the idea in: TTT layers make the hidden state a small model updated by self-supervised learning on the input sequence (Sun et al., [“Learning to (Learn at Test Time): RNNs with Expressive Hidden States”](https://arxiv.org/abs/2407.04620) (2024)), Titans adds a neural long-term memory that learns to memorize at test time (Behrouz et al., [“Titans: Learning to Memorize at Test Time”](https://arxiv.org/abs/2501.00663) (2024)), and Nested Learning treats memory as a spectrum of modules, each updating at its own frequency ([Behrouz and Mirrokni, Google Research blog, November 2025](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning/)).
- **Models that write their own updates still forget.** SEAL trains a model with reinforcement learning to generate its own fine-tuning data and update directives, rewarded by how well the updated model performs (Zweiger et al., [“Self-Adapting Language Models”](https://arxiv.org/abs/2506.10943) (2025)). Its authors report that performance on earlier tasks gradually declines as sequential self-edits accumulate, and that evaluating each self-edit takes about 30 to 45 seconds ([Zweiger et al., 2025](https://arxiv.org/abs/2506.10943)).
- **Learning in production opens an attack surface.** In poisoning experiments, 250 poisoned documents compromised models from 600 million to 13 billion parameters during pretraining, with the same dynamics during fine-tuning (Souly et al., [“Poisoning Attacks on LLMs Require a Near-constant Number of Poison Samples”](https://arxiv.org/abs/2510.07192) (2025)), so a model that trains on what users send it needs filtering, evaluation gates and rollback. Memory outside the weights, by contrast, can be inspected, corrected and deleted; see [memory](#agent-memory).

## Planned visuals

- `chart`: the forgetting comparison from sparse memory finetuning as bars: the drop in NaturalQuestions F1 after full fine-tuning, LoRA and sparse memory updates at matched learning.
- `compare`: learning in the weights versus learning in context and memory files: what persists, what can be inspected or deleted, what it costs, and how each forgets.
- `tree`: the method families with examples: replay, regularization, architecture growth, low-KL updates, test-time training, learned test-time memory and self-adaptation.

## Talk like an expert

Experts talk about the stability-plasticity trade-off, forgetting measured on held-out skills, replay ratios and KL to the base model, and they ask whether a claimed method learns in the weights or only in context. The live debate is whether continual learning is the missing capability for useful agents: Dwarkesh Patel argues that "the lack of continual learning is a huge huge problem", while Ryan Greenblatt, in the essay's comments, argues that reinforcement learning fine-tuning can be qualitatively similar to how humans learn on the job, and that the remaining gaps (self-verification and sample efficiency) are more quantitative than qualitative ([Patel, “Why I don't think AGI is right around the corner”](https://www.dwarkesh.com/p/timelines-june-2025) (2025)).

## Go deeper

- Shi et al., [“Continual Learning of Large Language Models: A Comprehensive Survey”](https://arxiv.org/abs/2404.16789) (2024).
- Kirkpatrick et al., [“Overcoming catastrophic forgetting in neural networks”](https://arxiv.org/abs/1612.00796) (2016).
- Biderman et al., [“LoRA Learns Less and Forgets Less”](https://arxiv.org/abs/2405.09673) (2024).
- Akyürek et al., [“The Surprising Effectiveness of Test-Time Training for Few-Shot Learning”](https://arxiv.org/abs/2411.07279) (2024).

## Related

- [Long-horizon autonomy](#long-horizon-autonomy)
- [Memory](#agent-memory)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Mid-training](#mid-training)
- [Open problems and big debates](#open-problems)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
