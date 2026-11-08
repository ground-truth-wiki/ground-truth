---
id: dpo-and-relatives
book: 3
order: "3.6.2"
title: "Direct alignment algorithms: DPO and its relatives"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [dpo, preference-optimization, kto, simpo, alignment]
visuals: []
prerequisites: [preference-optimization]
---
> [!tldr]
> Direct alignment algorithms train a language model on preference data with a simple classification-style loss, with no separate reward model and no RL loop. DPO shows that the KL-constrained RLHF objective has a closed-form optimal policy, so the policy's own log-probability ratio against a frozen reference model works as an implicit reward. Remember that these methods are offline by default: they learn only from the pairs you give them, so where the pairs came from matters more than which variant you pick.

## Key ideas

- **One derivation turns RLHF into classification.** RLHF maximizes reward minus β times the KL divergence from a reference policy, and its optimal policy is π*(y|x) = π_ref(y|x) · exp(r(x, y)/β) / Z(x), where the partition function Z(x) normalizes over all responses. Inverting this gives the implicit reward r = β log(π/π_ref) + β log Z(x); in the Bradley-Terry model Z(x) cancels between the two responses, which leaves a logistic loss on the gap between the chosen and rejected log-ratios, with β setting how far the policy may move from the reference ([Lambert, “Direct-Alignment Algorithms”, RLHF book](https://rlhfbook.com/c/08-direct-alignment); [Rafailov et al., “Direct Preference Optimization: Your Language Model is Secretly a Reward Model” (2023)](https://arxiv.org/abs/2305.18290)).
- **The reference model costs memory, and the gradient often pushes both responses down.** A simple implementation that runs the frozen reference model next to the policy doubles memory, and caching its log-probabilities over the dataset first cuts peak memory by about half ([Lambert, RLHF book](https://rlhfbook.com/c/08-direct-alignment)); as of November 2026, TRL calls this `precompute_ref_log_probs`, defaults β to 0.1 and notes that DPO usually widens the margin by suppressing the rejected response rather than raising the chosen one ([Hugging Face TRL, DPO Trainer](https://huggingface.co/docs/trl/dpo_trainer)). Razin et al. call the falling likelihood of chosen responses likelihood displacement and show the freed probability can move to responses with the opposite meaning: in their refusal experiment, Llama-3-8B-Instruct's refusal rate fell from 74.4% to 33.4%, and filtering pairs whose two responses have similar embeddings reduced the effect ([Razin et al., “Unintentional Unalignment: Likelihood Displacement in Direct Preference Optimization” (2024)](https://arxiv.org/abs/2410.08847)).
- **Each variant changes one assumption.** cDPO assumes that a fixed share of the labels is wrong ([Lambert, RLHF book](https://rlhfbook.com/c/08-direct-alignment)); IPO is the identity case of a general ΨPO objective that works directly on pairwise preferences instead of replacing them with pointwise rewards ([Azar et al., “A General Theoretical Paradigm to Understand Learning from Human Preferences” (2023)](https://arxiv.org/abs/2310.12036)); KTO learns from unpaired good or bad labels with a prospect-theory utility and matches or beats pairwise methods from 1B to 30B parameters ([Ethayarajh et al., “KTO: Model Alignment as Prospect Theoretic Optimization” (2024)](https://arxiv.org/abs/2402.01306v4)). ORPO adds a small odds-ratio penalty on the rejected response to SFT and needs no reference model ([Hong et al., “ORPO: Monolithic Preference Optimization without Reference Model” (2024)](https://arxiv.org/abs/2403.07691)), and SimPO also drops it, using the length-averaged log-probability as the reward plus a target margin ([Meng et al., “SimPO: Simple Preference Optimization with a Reference-Free Reward” (2024)](https://arxiv.org/abs/2405.14734v1)).
- **Online and self-improving versions sample from the current model.** Online AI feedback samples two responses from the current model at each step and lets an LLM annotator pick one, and in human evaluations it beat both offline direct methods and RLHF ([Guo et al., “Direct Language Model Alignment from Online AI Feedback” (2024)](https://arxiv.org/abs/2402.04792)). Self-rewarding models judge their own responses with LLM-as-a-judge prompts inside iterative DPO ([Yuan et al., “Self-Rewarding Language Models” (2024)](https://arxiv.org/abs/2401.10020)), and SPIN trains a model to tell its earlier outputs apart from human-written data, with no new labels ([Chen et al., “Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models” (2024)](https://arxiv.org/abs/2401.01335)).
- **Data beats the algorithm, and online RL still tends to win.** Ivison et al. ranked preference-data quality first, ahead of the learning algorithm, with PPO beating DPO by up to 2.5% on math and 1.2% on general tasks ([Ivison et al., “Unpacking DPO and PPO: Disentangling Best Practices for Learning from Preference Feedback” (2024)](https://arxiv.org/abs/2406.09279)), and Xu et al. found PPO ahead in every testbed, with DPO sensitive to the distribution shift between the base model's outputs and the preference data ([Xu et al., “Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study” (2024)](https://arxiv.org/abs/2404.10719)). The delta learning hypothesis says the quality gap within a pair drives learning: pairs of a 3B model's answers over a 1.5B model's answers brought an 8B model level with Tülu 3, which used much stronger supervisors ([Geng et al., “The Delta Learning Hypothesis: Preference Tuning on Weak Data can Yield Strong Gains” (2025)](https://arxiv.org/abs/2507.06187)).
- **Two dataset shapes feed the trainers.** Paired preference data has prompt, chosen and rejected columns, and unpaired data has prompt, completion and a true or false label; as of November 2026, TRL's DPOTrainer takes paired data, KTOTrainer takes either, and the ORPO, CPO and online DPO trainers sit in `trl.experimental` ([Hugging Face TRL, Dataset formats](https://huggingface.co/docs/trl/dataset_formats)). DPOTrainer's `loss_type` also selects IPO (`ipo`), robust DPO for noisy labels (`robust`) and SimPO's length normalization (`sigmoid_norm`), among others ([Hugging Face TRL, DPO Trainer](https://huggingface.co/docs/trl/dpo_trainer)).

## Planned visuals

- **`calculator`:** the DPO loss for one pair from four log-probabilities (policy and reference, chosen and rejected) and β, showing the implicit rewards, the margin, the loss and the gradient weight σ(−margin) (formula, with tests).
- **`chart`:** chosen and rejected log-probabilities over DPO training, with both falling while the margin grows, to show likelihood displacement (illustrative).
- **`tree`:** the direct-alignment family by what each method changes: noisy labels (cDPO, robust DPO), the link function (IPO), unpaired labels (KTO), no reference model (ORPO, SimPO), length normalization and margins, and online sampling (online DPO, self-rewarding, SPIN).

## Talk like an expert

Experts say DAA or direct alignment, implicit reward, β, reference model, chosen and rejected log-probs, reward margin and reward accuracy, likelihood displacement, and on-policy versus off-policy pairs. They ask where the pairs came from and how far apart chosen and rejected really are before they ask which loss was used.

## Go deeper

- Lambert, [“Direct-Alignment Algorithms”](https://rlhfbook.com/c/08-direct-alignment), chapter of the RLHF book.
- Rafailov et al., [“Direct Preference Optimization: Your Language Model is Secretly a Reward Model”](https://arxiv.org/abs/2305.18290) (2023).
- Ethayarajh et al., [“KTO: Model Alignment as Prospect Theoretic Optimization”](https://arxiv.org/abs/2402.01306v4) (2024).
- Ivison et al., [“Unpacking DPO and PPO: Disentangling Best Practices for Learning from Preference Feedback”](https://arxiv.org/abs/2406.09279) (2024).

## Related

- [Preference optimization](#preference-optimization)
- [Reward models and preference data](#reward-modeling)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Post-training: from base model to assistant](#post-training-overview)
- [Information theory for language models](#information-theory-for-llms)
