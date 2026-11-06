---
id: rl-primer
book: 1
order: "1.7"
title: Reinforcement learning primer
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [rl, ppo, policy-gradient]
visuals:
  - gridworld:stepper
  - rl-concepts:tree
---
> [!tldr]
> Reinforcement learning trains an agent to choose actions that maximize long-term reward through trial and error. Its vocabulary of policies, rewards, returns, value functions, exploration and on- versus off-policy learning underlies RLHF, reasoning models and agent training.

## Why it matters
The biggest recent advances in language models came from applying RL: preference training, reasoning and agentic skills. Understanding the basics makes those methods, and their failure modes such as reward hacking, understandable.

## Intuition
Training a dog with treats: the dog tries things, gets rewarded sometimes, and gradually learns which behaviors lead to treats, including ones whose reward comes several steps later.

```viz
{"id":"gridworld","component":"stepper","title":"Value estimates spread backward from the goal until the agent knows the best path","caption":"An illustrative 4 × 4 gridworld with the goal in the bottom-right corner (+1). Each frame shows estimated values after more learning.","alt":"Stepper of value estimates in a gridworld propagating backward from the goal over iterations.","data":"illustrative","frames":[
{"label":"Start","caption":"The agent knows nothing; every value is zero except the goal.","matrix":{"rows":["row 1","row 2","row 3","row 4"],"cols":["c1","c2","c3","c4"],"values":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,1]],"min":0,"max":1}},
{"label":"After a few episodes","caption":"Cells next to the goal learn they are valuable.","matrix":{"rows":["row 1","row 2","row 3","row 4"],"cols":["c1","c2","c3","c4"],"values":[[0,0,0,0],[0,0,0,0.1],[0,0,0.1,0.9],[0,0.1,0.9,1]],"min":0,"max":1}},
{"label":"Converged","caption":"Values decline with distance from the goal (discounted). Moving toward higher values is the optimal policy.","matrix":{"rows":["row 1","row 2","row 3","row 4"],"cols":["c1","c2","c3","c4"],"values":[[0.53,0.59,0.66,0.73],[0.59,0.66,0.73,0.81],[0.66,0.73,0.81,0.9],[0.73,0.81,0.9,1]],"min":0,"max":1}}]}
```

## How it works
**The setup.** An agent observes a state, takes an action, receives a reward and a new state, repeatedly. The goal is to maximize return: the (discounted) sum of future rewards.

**Policies and values.** A policy maps states to actions; a value function estimates expected return from a state or state–action pair. Q-learning learns action values; policy-gradient methods (REINFORCE, PPO) adjust the policy directly; actor–critic methods combine both.

```viz
{"id":"rl-concepts","component":"tree","title":"Six ideas that carry over from classic RL to language model training","caption":"Expand each concept for its meaning in LLM training.","alt":"Tree of reinforcement learning concepts with their language model training equivalents.","data":"illustrative","open":1,"root":{"label":"RL concepts and their LLM versions","children":[
{"label":"Policy","children":[{"label":"The language model itself: it chooses the next token or action"}]},
{"label":"Reward","children":[{"label":"A reward model, human preference, verifier or task outcome","link":"#rlvr-reasoning"}]},
{"label":"Credit assignment","children":[{"label":"Which tokens or steps earned the reward; hard for long outputs and agents","link":"#agentic-rl"}]},
{"label":"Exploration","children":[{"label":"Sampling diverse outputs at non-zero temperature"}]},
{"label":"On- versus off-policy","children":[{"label":"Learning from the current model’s samples (PPO, GRPO) or from fixed data (DPO)","link":"#preference-optimization"}]},
{"label":"Reward hacking","children":[{"label":"Exploiting flaws in the reward instead of doing the task","link":"#alignment-concepts"}]}]}}
```

**Exploration versus exploitation.** Agents must try new actions to discover better ones while using what they know.

**Milestones.** TD-Gammon (1992), DQN on Atari (Mnih et al., 2015), AlphaGo (Silver et al., 2016) and AlphaZero (2017) showed RL’s power in games; RLHF and RLVR brought it to language models.

## In practice
- When reading about RL training of models, identify the policy, the reward source and whether learning is on- or off-policy.
- Expect reward hacking whenever a reward is imperfect, and inspect high-reward samples.

## Numbers to know
> [!number]
> Rules of thumb. Discount factors near 0.9 to 0.99 are common in classic RL. RL is sample-hungry; language model RL needs many rollouts per update.

## Pitfalls and anti-patterns
> [!pitfall] Trusting a rising reward curve
> Rewards measure what you wrote down, not what you meant.

## Talk like an expert
The vocabulary: **agent**, **environment**, **state**, **action**, **reward**, **return**, **discount**, **policy**, **value function**, **Q-learning**, **policy gradient**, **PPO**, **exploration**. Experts frame model training choices in RL terms. The live debate is how far RL can push language models beyond what pretraining provides.

> [!hottake] RL is now the most important stage of training frontier models.
> **The counterargument:** RL depends on strong pretrained models and mostly sharpens their latent abilities; pretraining still determines most of what a model knows.

## Check yourself
```quiz
rl-primer
```

## Go deeper
- Sutton and Barto, *Reinforcement Learning: An Introduction* (2nd edition, 2018).
- Schulman et al., “Proximal Policy Optimization Algorithms” (2017).

## Related
- [RL with verifiable rewards](#rlvr-reasoning)
- [Preference optimization](#preference-optimization)
- [Agentic RL and environments](#agentic-rl)
- [RL environment harnesses](#rl-environment-harnesses)
- [Alignment concepts](#alignment-concepts)
