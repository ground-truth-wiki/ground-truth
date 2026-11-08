---
id: reward-modeling
book: 3
order: "3.6.1"
title: Reward models and preference data
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [reward-models, preference-data, rlhf, process-rewards, bradley-terry]
visuals: []
prerequisites: [preference-optimization]
---
> [!tldr]
> A reward model turns human or AI judgments into a score that reinforcement learning, or a best-of-n sampler, can optimize. It is the part of RLHF that defines what "better" means, so its blind spots become the policy's habits. Remember that a reward model is a proxy: push a policy against it too hard and true quality falls while the score keeps rising.

## Key ideas

- **The standard model is Bradley-Terry with a scalar head.** The Bradley-Terry model makes the probability that one response beats another a sigmoid of the difference in their scores, so the reward model minimizes −log σ(r(chosen) − r(rejected)); by default it is a language model with a linear head that maps the hidden state of the final token to one number ([Lambert, “Reward Modeling”, RLHF book](https://rlhfbook.com/c/05-reward-models)). The same chapter describes common practice: train for only one epoch to avoid overfitting, add a margin that asks for larger score gaps when raters saw larger quality gaps (Llama 2; Llama 3 removed it after seeing diminishing gains at scale), keep all pairs from one prompt in the same batch so the model does not overfit and prompts with many comparisons do not dominate (InstructGPT), and use K-wise Plackett-Luce losses for full rankings.
- **Outcome rewards, process rewards and value functions differ.** An outcome reward model predicts how likely a completion is to end in a correct answer, a process reward model scores each reasoning step, and a value function predicts the expected return from a state and is trained on the current policy's rollouts as a baseline for RL ([Lambert, RLHF book](https://rlhfbook.com/c/05-reward-models)). Process supervision significantly outperformed outcome supervision on MATH problems in Lightman et al., who released PRM800K with 800,000 step-level human labels ([Lightman et al., “Let's Verify Step by Step” (2023)](https://arxiv.org/abs/2305.20050)), and Math-Shepherd built process labels automatically, without human annotation ([Wang et al., “Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations” (2023)](https://arxiv.org/abs/2312.08935)).
- **Rewards can also be generated, or written as rules.** Generative verifiers are trained with next-token prediction, can reason in a chain of thought before judging, and beat discriminative verifiers, DPO verifiers and LLM-as-a-judge prompting for best-of-N selection in their authors' experiments ([Zhang et al., “Generative Verifiers: Reward Modeling as Next-Token Prediction” (2024)](https://arxiv.org/abs/2408.15240)). Rule Based Rewards grade responses with an LLM against written rules for desired and undesired behavior, need little human data and are easier to update than relabeled data ([Mu et al., “Rule Based Rewards for Language Model Safety” (2024)](https://arxiv.org/abs/2411.01111)); prompted judges are covered in [LLM-as-judge](#llm-as-judge).
- **Preference data is rankings, preferably on-policy, and expensive.** Common practice trains on rankings rather than ratings, prefers completions from the model being trained or its recent checkpoints, and expects human data to be costly and slow; preference data is also prone to subtle biases such as sycophancy, verbosity and formatting habits, which the chapter traces back to the human labelers ([Lambert, “Preference Data”, RLHF book](https://rlhfbook.com/c/06-preference-data)). UltraFeedback is a large example of AI feedback, with over 1 million GPT-4 feedback annotations on 250k conversations ([Cui et al., “UltraFeedback: Boosting Language Models with Scaled AI Feedback” (2023)](https://arxiv.org/abs/2310.01377)).
- **Reward-model benchmarks are useful but incomplete.** RewardBench scores reward models on prompt, chosen and rejected trios across chat, reasoning and safety ([Lambert et al., “RewardBench: Evaluating Reward Models for Language Modeling” (2024)](https://arxiv.org/abs/2403.13787)), and RewardBench 2 uses new human prompts and reports that its scores correlate highly with downstream use in best-of-N sampling and PPO training ([Malik et al., “RewardBench 2: Advancing Reward Model Evaluation” (2025)](https://arxiv.org/abs/2506.01937)). Accuracy is not the whole story: an accurate reward model that induces too little reward variance makes RLHF optimization slow, and a less accurate one that induces more variance can teach better ([Razin et al., “What Makes a Reward Model a Good Teacher? An Optimization Perspective” (2025)](https://arxiv.org/abs/2503.15477)).
- **Overoptimization has known mitigations.** With a fixed "gold" reward model standing in for people, the gold score eventually falls as a policy is optimized against a proxy reward model, with different curves for RL and best-of-n whose coefficients scale smoothly with reward-model size ([Gao et al., “Scaling Laws for Reward Model Overoptimization” (2022)](https://arxiv.org/abs/2210.10760)). Conservative objectives over reward-model ensembles reduce it, and combined with a small KL penalty prevented it in PPO ([Coste et al., “Reward Model Ensembles Help Mitigate Overoptimization” (2023)](https://arxiv.org/abs/2310.02743)); on summarization, averaging the weights of several fine-tuned reward models (WARM) gave an RL policy a 79.4% win rate against one trained with a single reward model ([Ramé et al., “WARM: On the Benefits of Weight Averaged Reward Models” (2024)](https://arxiv.org/abs/2401.12187)).

## Planned visuals

- **`calculator`:** the Bradley-Terry probability and pairwise loss from two reward scores, with an optional margin, showing how the loss falls as the gap grows (formula).
- **`chart`:** proxy and gold reward as optimization against a proxy reward model increases, for best-of-n and RL, with the gold curve rising and then falling, after Gao et al. (illustrative unless redrawn from the paper's data).
- **`compare`:** an outcome reward model and a process reward model scoring the same multi-step math solution, with the first wrong step highlighted.

## Talk like an expert

Experts talk about Bradley-Terry, chosen and rejected pairs, ORMs, PRMs, generative reward models, on-policy preference data and overoptimization. They ask how a reward model was evaluated beyond benchmark accuracy and how far the policy was allowed to move against it.

## Go deeper

- Lambert, [“Reward Modeling”](https://rlhfbook.com/c/05-reward-models), chapter of the RLHF book.
- Lightman et al., [“Let's Verify Step by Step”](https://arxiv.org/abs/2305.20050) (2023).
- Gao, Schulman and Hilton, [“Scaling Laws for Reward Model Overoptimization”](https://arxiv.org/abs/2210.10760) (2022).
- Lambert et al., [“RewardBench: Evaluating Reward Models for Language Modeling”](https://arxiv.org/abs/2403.13787) (2024).

## Related

- [Preference optimization](#preference-optimization)
- [Direct alignment algorithms: DPO and its relatives](#dpo-and-relatives)
- [LLM-as-judge done right](#llm-as-judge)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
