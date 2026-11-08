---
id: llm-policy-gradients
book: 3
order: "3.7.1"
title: "Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond"
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [grpo, ppo, rlvr, policy-gradient, post-training]
visuals: []
prerequisites: [rlvr-reasoning, rl-primer]
---
> [!tldr]
> RL for language models treats the prompt as the state and the sampled completion as the action, and makes completions that score above a baseline more likely. PPO, RLOO, GRPO and their successors differ mainly in where the baseline comes from, how updates are clipped, how token losses are averaged and where the KL penalty sits. Remember that most "new algorithms" since GRPO fix these small choices, and that rollouts from a fast inference engine are slightly off-policy even when they are meant not to be.

## Key ideas

- **A completion is one action, and the discount is 1.** RLOO and GRPO treat the whole completion as a single bandit action with one sequence-level advantage, while PPO with a value model assigns per-token advantages in a token-level MDP; RLHF usually sets the discount to 1, because the completion as a whole is what gets optimized and discounting earlier tokens would down-weight them with no principled reason ([Lambert, “Reinforcement Learning”, RLHF book](https://rlhfbook.com/c/06-policy-gradients)). RLOO uses the mean reward of the other samples for the same prompt as its baseline (same source), and Ahmadian et al. found that such REINFORCE-style methods beat PPO, DPO and RAFT for RLHF, arguing that many PPO components are unnecessary there ([Ahmadian et al., “Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs” (2024)](https://arxiv.org/abs/2402.14740)). The general theory is in [policy gradients, actor-critic and PPO](#policy-gradient-methods).
- **PPO adds clipping and a value model; the KL term can live in two places.** PPO clips the probability ratio between the new and the old policy to [1 − ε, 1 + ε] and trains a value model next to the policy, a model that InstructGPT initialized from the reward model; reward normalization and advantage whitening are implementation choices that vary across codebases ([Lambert, RLHF book](https://rlhfbook.com/c/06-policy-gradients)). Classic RLHF and RLOO subtract the KL penalty from the reward, canonical GRPO adds it to the loss, and many reasoning codebases turn it off (same source); as of November 2026, TRL's GRPOTrainer defaults `beta` to 0.0, so it does not even load a reference model ([Hugging Face TRL, GRPO Trainer](https://huggingface.co/docs/trl/grpo_trainer)).
- **GRPO's normalizations carry biases.** GRPO drops the value model and scales each reward by its group's mean and standard deviation, and dividing by the standard deviation gives extra weight to prompts whose rewards barely vary ([Lambert, RLHF book](https://rlhfbook.com/c/06-policy-gradients)). Liu et al. also found an optimization bias that lengthens responses, especially wrong ones, and proposed Dr. GRPO, which removes the standard-deviation term and the per-response length normalization ([Liu et al., “Understanding R1-Zero-Like Training: A Critical Perspective” (2025)](https://arxiv.org/abs/2503.20783)).
- **DAPO, GSPO and CISPO each fix a failure.** DAPO raises the upper clip bound (clip-higher) against entropy collapse, filters out groups in which every sample gets the same reward, averages the loss per token so long chains of thought are not under-weighted, shapes the reward for overlong samples and drops the KL term, reaching 50 points on AIME 2024 from the Qwen2.5-32B base model ([Yu et al., “DAPO: An Open-Source LLM Reinforcement Learning System at Scale” (2025)](https://arxiv.org/abs/2503.14476)). GSPO computes one length-normalized importance ratio per sequence and clips at that level, which its authors say stabilizes RL for mixture-of-experts models and contributed to Qwen3 ([Zheng et al., “Group Sequence Policy Optimization” (2025)](https://arxiv.org/abs/2507.18071)); CISPO clips the importance-sampling weights instead of the token updates, so every token still gets a gradient ([MiniMax, “MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention” (2025)](https://arxiv.org/abs/2506.13585)).
- **Loss aggregation and entropy need watching.** Averaging per sequence gives tokens in short answers larger gradients, while averaging per token over the batch (DAPO) or dividing by a fixed maximum length (Dr. GRPO) removes that bias ([Lambert, RLHF book](https://rlhfbook.com/c/06-policy-gradients)); as of November 2026, TRL defaults `loss_type` to `"dapo"`, calls `"grpo"` not recommended, and offers `epsilon_high` for clip-higher plus entropy bonuses ([Hugging Face TRL, GRPO Trainer](https://huggingface.co/docs/trl/grpo_trainer)). Without intervention, policy entropy drops sharply early in RL for reasoning and performance saturates with it, so experts log entropy next to reward ([Cui et al., “The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models” (2025)](https://arxiv.org/abs/2505.22617)).
- **Asynchronous RL and engine mismatch make training off-policy.** Generating new samples while training on slightly older ones trained an 8B chatbot about 40% faster with matching results, and online DPO was the tested algorithm most robust to such stale data ([Noukhovitch et al., “Asynchronous RLHF: Faster and More Efficient Off-Policy RL for Language Models” (2024)](https://arxiv.org/abs/2410.18252)). Even synchronous runs drift off-policy, because the rollout engine (such as vLLM) and the trainer (such as FSDP) are different implementations, and Yao et al. correct this gap with a simple importance-sampling technique ([Yao et al., “Your Efficient RL Framework Secretly Brings You Off-Policy RL Training” (2025)](https://liyuanlucasliu.github.io/publication/feng-off-2025)); as of November 2026, TRL applies an importance-sampling correction to vLLM generations by default and runs vLLM either colocated on the training GPUs or as a separate server ([Hugging Face TRL, GRPO Trainer](https://huggingface.co/docs/trl/grpo_trainer)).

## Planned visuals

- **`calculator`:** loss aggregation for one group of completions: enter each completion's length and reward, and see the advantages with and without standard-deviation scaling and the per-token weight under GRPO, DAPO and Dr. GRPO aggregation (formula, with tests).
- **`stepper`:** one GRPO-family update from sampling a group through scoring, advantages, the clipped ratio (symmetric and clip-higher) and the update, showing what happens to a long wrong answer under each choice.
- **`diagram`:** the RL system: prompt pool, rollout engine (colocated or separate), reward functions, trainer and weight sync, with the places where staleness and the training-inference mismatch enter and the importance-sampling correction is applied.

## Talk like an expert

Experts talk about rollouts, group size, advantages, the clip ratio and clip-higher, the KL coefficient, token-level versus sequence-level loss, entropy collapse, staleness and the training-inference mismatch. They read a run through reward, entropy, response length and clip fraction together, and ask which loss aggregation a paper used before comparing its results with another.

## Go deeper

- Lambert, [“Reinforcement Learning”](https://rlhfbook.com/c/06-policy-gradients), chapter of the RLHF book.
- Hugging Face, [TRL GRPO Trainer documentation](https://huggingface.co/docs/trl/grpo_trainer).
- Yu et al., [“DAPO: An Open-Source LLM Reinforcement Learning System at Scale”](https://arxiv.org/abs/2503.14476) (2025).
- Liu et al., [“Understanding R1-Zero-Like Training: A Critical Perspective”](https://arxiv.org/abs/2503.20783) (2025).

## Related

- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Policy gradients, actor-critic and PPO](#policy-gradient-methods)
- [Training reasoning models: cold starts, distillation and length control](#reasoning-training-recipes)
- [Agentic RL and environments](#agentic-rl)
- [Nondeterminism and reproducible inference](#inference-nondeterminism)
- [RL environment harnesses](#rl-environment-harnesses)
