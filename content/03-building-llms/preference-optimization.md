---
id: preference-optimization
book: 3
order: "3.6"
title: Preference optimization
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [rlhf, dpo, reward-model]
visuals:
  - rlhf-vs-dpo:compare
  - rlhf-pipeline:diagram
---
> [!tldr]
> Preference optimization teaches a model which of two acceptable answers is better. RLHF trains a reward model on human comparisons and optimizes the policy against it with reinforcement learning; DPO and its relatives optimize directly on preference pairs without a separate reward model. AI feedback (RLAIF, Constitutional AI) scales the comparisons.

## Why it matters
Preference training is what made assistants helpful, polite and safer, and it is how most models acquire their characteristic style. It also introduces familiar failures: sycophancy, verbosity and reward hacking. Teams with preference data from their own users can use the same methods.

## Intuition
SFT shows a student model answers. Preference optimization is a teacher saying “this answer is better than that one” thousands of times, until the student learns what the teacher values, including the teacher’s blind spots.

```viz
{"id":"rlhf-pipeline","component":"diagram","title":"Classic RLHF: demonstrations, comparisons, a reward model and reinforcement learning with a leash","caption":"The InstructGPT-style pipeline. The KL penalty keeps the policy close to the SFT model so it cannot drift into reward hacks. Click a box for its chapter.","alt":"Diagram of the RLHF pipeline: SFT model, human comparisons, reward model training, and PPO optimization with a KL penalty to the reference model.","data":"illustrative","w":600,"h":200,"nodes":[
{"id":"sft","label":"SFT model","role":"model","x":0,"y":0,"w":150,"h":56,"link":"#sft"},
{"id":"pairs","label":"Human comparisons","sub":"A better than B","role":"human","x":225,"y":0,"w":150,"h":56,"link":"#labeling-annotation"},
{"id":"rm","label":"Reward model","role":"tool","x":450,"y":0,"w":150,"h":56},
{"id":"ppo","label":"RL (PPO)","sub":"maximize reward","role":"agent","x":450,"y":140,"w":150,"h":56,"link":"#rl-primer"},
{"id":"kl","label":"KL penalty","sub":"stay near SFT","role":"untrusted","x":225,"y":140,"w":150,"h":56},
{"id":"policy","label":"Aligned policy","role":"model","x":0,"y":140,"w":150,"h":56}],
"edges":[{"from":"sft","to":"pairs","label":"samples"},{"from":"pairs","to":"rm","label":"train"},{"from":"rm","to":"ppo","label":"rewards"},{"from":"kl","to":"ppo","style":"dashed"},{"from":"ppo","to":"policy"}]}
```

## How it works
**RLHF.** Collect pairs of responses ranked by people, train a reward model to predict the preferred one, then optimize the policy with reinforcement learning (typically PPO) to maximize reward minus a KL penalty that keeps it near the SFT model (Christiano et al., 2017; Ouyang et al., 2022, InstructGPT).

**DPO and relatives.** Direct Preference Optimization (Rafailov et al., 2023) derives a loss that trains the policy directly on preference pairs, with no reward model or RL loop. Variants such as IPO, KTO (which needs only good or bad labels), ORPO and SimPO trade off simplicity, stability and data needs.

```viz
{"id":"rlhf-vs-dpo","component":"compare","title":"RLHF learns a reward and then optimizes it; DPO learns from the pairs directly","caption":"Hover the marks. Both start from an SFT model and preference pairs.","alt":"Comparison of RLHF with a reward model and PPO versus Direct Preference Optimization.","data":"illustrative","mono":false,"a":{"title":"RLHF (reward model + PPO)","text":"Train a reward model on pairs. Generate fresh samples from the policy, score them, and update with PPO under a KL penalty. Flexible and strong; complex, expensive and sensitive to reward hacking.","mono":false},"b":{"title":"DPO","text":"Use a closed-form loss on preferred and rejected responses, relative to a frozen reference model. No reward model, no sampling loop. Simple and stable; learns only from the fixed pairs you collected.","mono":false},"links":[{"a":"Train a reward model on pairs.","b":"No reward model, no sampling loop.","note":"DPO folds the reward model into the loss."},{"a":"Generate fresh samples from the policy","b":"learns only from the fixed pairs you collected.","note":"Online methods explore beyond the dataset; offline DPO cannot."},{"a":"sensitive to reward hacking","note":"Optimizing a learned reward hard enough exploits its errors (Gao et al., 2022)."}]}
```

**AI feedback.** Constitutional AI (Bai et al., 2022) uses a model guided by written principles to critique and compare responses; RLAIF generally replaces some human comparisons with model judgments, which scales cheaply and inherits the judge’s biases. See [LLM-as-judge](#llm-as-judge).

**Known side effects.** Length bias (longer answers win comparisons), sycophancy (agreeable answers win), and overoptimization (scores keep rising while real quality falls). See [alignment concepts](#alignment-concepts).

## In practice
- Use DPO-style methods for most product fine-tunes with preference data; they are simpler and cheaper.
- Collect pairs from your own model’s outputs on your own prompts, judged by people or calibrated judges.
- Control for length in comparisons, and evaluate sycophancy explicitly.
- Keep a held-out human-judged set to catch overoptimization.

## Numbers to know
> [!number]
> Rules of thumb. Thousands to tens of thousands of preference pairs are typical for product fine-tunes. Stronger KL penalties keep models safer from reward hacking at some cost in reward.

## Pitfalls and anti-patterns
> [!pitfall] Optimizing a reward model too hard
> Past a point, reward rises while human-judged quality falls. Monitor both.

- **Length-biased pairs.** The model learns to ramble.
- **Off-policy pairs.** Pairs generated by a very different model teach less.

## Talk like an expert
The vocabulary: **reward model**, **PPO**, **KL penalty**, **reference model**, **DPO**, **KTO**, **RLAIF**, **Constitutional AI**, **overoptimization**, **length bias**. Experts ask whether preference data was on-policy and length-controlled. The live debate is how much preference optimization still matters relative to reinforcement learning with verifiable rewards.

> [!hottake] Preference optimization taught models to please, and much of today’s sycophancy comes from it.
> **The counterargument:** preference training also made models far more helpful and safer, and better data, judges and objectives can reduce sycophancy without giving up those gains.

## Check yourself
```quiz
preference-optimization
```

## Go deeper
- Ouyang et al., “Training language models to follow instructions with human feedback” (2022).
- Rafailov et al., “Direct Preference Optimization” (2023).
- Bai et al., “Constitutional AI: Harmlessness from AI Feedback” (2022).
- Gao, Schulman and Hilton, “Scaling Laws for Reward Model Overoptimization” (2022).

## Related
- [Supervised fine-tuning](#sft)
- [RL with verifiable rewards](#rlvr-reasoning)
- [Alignment concepts](#alignment-concepts)
- [Reinforcement learning primer](#rl-primer)
- [Safety and character training](#safety-character-training)
- [Information theory for language models](#information-theory-for-llms)
- [Loss functions](#loss-functions)
- [Policy gradients, actor-critic and PPO](#policy-gradient-methods)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [Post-training: from base model to assistant](#post-training-overview)
- [Judge models, juries and meta-evaluation](#judge-models-meta-evaluation)
- [Scalable oversight: debate, amplification and weak-to-strong](#scalable-oversight)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Reward models and preference data](#reward-modeling)
- [Direct alignment algorithms: DPO and its relatives](#dpo-and-relatives)
