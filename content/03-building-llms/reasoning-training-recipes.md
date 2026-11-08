---
id: reasoning-training-recipes
book: 3
order: "3.7.2"
title: "Training reasoning models: cold starts, distillation and length control"
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [reasoning-models, distillation, thinking-length, rlvr, post-training]
visuals: []
prerequisites: [rlvr-reasoning]
---
> [!tldr]
> Reasoning models are built from a little supervised data, a lot of RL on checkable problems, and distillation of the result into smaller models. The decisions that matter are the cold start, which problems to train on, what to reward besides correctness, and how to stop thinking from growing longer than the task needs. Remember the open question: RL with verifiable rewards may mostly sharpen what the base model could already do, while distillation can add new reasoning patterns.

## Key ideas

- **R1-Zero showed RL alone works; R1 added stages to make it usable.** DeepSeek-R1-Zero applied large-scale RL to a base model with only rule-based accuracy and format rewards, avoiding neural reward models because of reward hacking, and it reasoned well but wrote hard-to-read, language-mixing output ([DeepSeek-AI, “DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning” (2025)](https://arxiv.org/abs/2501.12948v1)). DeepSeek-R1 added a cold start on thousands of long chain-of-thought examples, reasoning RL with a language-consistency reward, rejection sampling into about 800k SFT samples (about 600k reasoning and 200k other), and a final RL stage with preference reward models for general prompts ([DeepSeek-AI (2025)](https://arxiv.org/html/2501.12948v1)); Qwen3's flagship pipeline also has four stages, including a "thinking mode fusion" stage that adds non-thinking abilities to the thinking model ([Yang et al., “Qwen3 Technical Report” (2025)](https://arxiv.org/abs/2505.09388)).
- **Problem choice and small extra rewards shape the run.** Prompts the model solves 0% or 100% of the time give no gradient, so many recipes keep problems the starting model solves only 20 to 80% of the time, and some filter online per batch or save harder problems for later ([Lambert, “Reasoning and Inference-Time Scaling”, RLHF book](https://rlhfbook.com/c/07-reasoning)). Small format rewards are common, and multilingual models add rewards for not switching languages mid-reasoning (same source).
- **For small models, distillation often beats RL.** DeepSeek fine-tuned six dense Qwen and Llama models from 1.5B to 70B on R1 samples with SFT only, and on Qwen-32B the distilled model scored 72.6 on AIME 2024 pass@1 against 47.0 for the same base trained with large-scale RL ([DeepSeek-AI (2025)](https://arxiv.org/html/2501.12948v1)). s1 fine-tuned Qwen2.5-32B-Instruct on just 1,000 curated reasoning traces ([Muennighoff et al., “s1: Simple test-time scaling” (2025)](https://arxiv.org/abs/2501.19393)), and OpenThoughts scaled a distillation set to 1.2 million examples from a QwQ-32B teacher ([Guha et al., “OpenThoughts: Data Recipes for Reasoning Models” (2025)](https://arxiv.org/abs/2506.04178)); the methods are in [distillation for LLMs](#llm-distillation).
- **Thinking length is controlled in training and at inference.** o1-style models spend many tokens on trivial problems for little gain, which Chen et al. studied as overthinking ([Chen et al., “Do NOT Think That Much for 2+3=? On the Overthinking of o1-Like LLMs” (2024)](https://arxiv.org/abs/2412.21187)). Kimi k1.5's long2short methods use long-reasoning techniques to improve short-reasoning models ([Kimi Team, “Kimi k1.5: Scaling Reinforcement Learning with LLMs” (2025)](https://arxiv.org/abs/2501.12599)), L1 rewards keeping to a length given in the prompt ([Aggarwal and Welleck, “L1: Controlling How Long A Reasoning Model Thinks With Reinforcement Learning” (2025)](https://arxiv.org/abs/2503.04697)), s1's budget forcing ends thinking early or appends "Wait" to extend it ([Muennighoff et al. (2025)](https://arxiv.org/abs/2501.19393)), and Qwen3 puts thinking and non-thinking modes in one model with a thinking budget ([Yang et al. (2025)](https://arxiv.org/abs/2505.09388)).
- **The loop has precursors, and rubrics push it past checkable answers.** STaR generated rationales, kept those that reached correct answers, fine-tuned on them and repeated ([Zelikman et al., “STaR: Bootstrapping Reasoning With Reasoning” (2022)](https://arxiv.org/abs/2203.14465)), and process supervision of each step beat outcome supervision on MATH problems ([Lightman et al., “Let's Verify Step by Step” (2023)](https://arxiv.org/abs/2305.20050)). Rubrics as Rewards turns rubric-based feedback into the reward in medicine and science, and its best variant beat LLM-judge rewards on a Likert scale ([Gunjal et al., “Rubrics as Rewards: Reinforcement Learning Beyond Verifiable Domains” (2025)](https://arxiv.org/abs/2507.17746)).
- **Does RL teach or only elicit? Both sides have evidence.** Base models beat their RL-trained versions at large pass@k, RL's reasoning paths already lie in the base model's distribution, and distillation can add new patterns ([Yue et al., “Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?” (NeurIPS 2025)](https://neurips.cc/virtual/2025/poster/119944)); random rewards raised Qwen2.5-Math-7B by 21.4 points on MATH-500 (29.1 with true rewards) but often failed on Llama3 and OLMo2 ([Shao et al., “Spurious Rewards: Rethinking Training Signals in RLVR” (2025)](https://arxiv.org/abs/2506.10947)), and an "aha moment" already appears in DeepSeek-V3-Base ([Liu et al., “Understanding R1-Zero-Like Training: A Critical Perspective” (2025)](https://arxiv.org/abs/2503.20783)). On the other side, the authors of ProRL report that prolonged RL with KL control, reference-policy resets and a diverse task set beat base models across a wide range of pass@k values and uncovered strategies the base model could not reach ([Liu et al., “ProRL: Prolonged Reinforcement Learning Expands Reasoning Boundaries in Large Language Models” (2025)](https://arxiv.org/abs/2505.24864)).

## Planned visuals

- **`diagram`:** the R1-Zero path (base model, then RL) beside the full R1 pipeline (cold-start SFT, reasoning RL, rejection sampling and SFT, RL for all prompts) with a branch that distills into small models; each stage links to its chapter.
- **`chart`:** pass@k against k for a base model and its RL-trained version, with RL ahead at small k and the base model ahead at large k, after Yue et al. (illustrative).
- **`tree`:** ways to control thinking length: in training (length penalties, long2short, L1) and at inference (budget forcing, thinking budgets, effort levels, thinking and non-thinking modes).

## Talk like an expert

Experts talk about the cold start, rejection sampling, difficulty filtering and the solve-rate band, format and language-consistency rewards, distilled models, long2short, budget forcing, thinking budgets, hybrid thinking, overthinking and pass@k. They ask whether a small reasoning model was distilled or trained with RL, and they frame the elicitation debate as pass@1 against pass@k.

## Go deeper

- DeepSeek-AI, [“DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning”](https://arxiv.org/abs/2501.12948) (2025).
- Lambert, [“Reasoning and Inference-Time Scaling”](https://rlhfbook.com/c/07-reasoning), chapter of the RLHF book.
- Muennighoff et al., [“s1: Simple test-time scaling”](https://arxiv.org/abs/2501.19393) (2025).
- Yue et al., [“Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?”](https://neurips.cc/virtual/2025/poster/119944) (NeurIPS 2025).

## Related

- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Reasoning models and test-time compute](#reasoning-models)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [Reasoning and test-time scaling](#test-time-scaling)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [Post-training: from base model to assistant](#post-training-overview)
