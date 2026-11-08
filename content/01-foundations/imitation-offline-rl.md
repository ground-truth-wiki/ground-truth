---
id: imitation-offline-rl
book: 1
order: "1.7.5"
title: Imitation learning and offline RL
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [imitation-learning, behavior-cloning, offline-rl, inverse-rl, reward-design]
visuals: []
prerequisites: [rl-primer]
---
> [!tldr]
> Imitation learning trains a policy from an expert's demonstrations, and offline RL trains one from a fixed log of past interactions and rewards, with no new data collection. Both avoid online trial and error, which can be expensive or dangerous, and both hit the same wall: the learned policy reaches states, or picks actions, that the data never covered. Remember that supervised fine-tuning of a language model on demonstrations is behavior cloning under another name.

## Key ideas

- **Behavior cloning is supervised learning, and its errors compound.** A classifier trained on the expert's states and actions that errs with probability ε can make as many as T²ε mistakes over T steps, because after one mistake it meets states the expert never showed it (Ross et al., [“A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning”](https://arxiv.org/abs/1011.0686) (2011), citing Ross and Bagnell, 2010). Robot policies learned from teleoperated demonstrations face the same problem: the authors of ALOHA name errors that "compound over time" as one of the challenges of imitation learning (Zhao et al., [“Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware”](https://arxiv.org/abs/2304.13705) (2023)).
- **DAgger asks the expert about the learner's own states.** Dataset Aggregation runs the current policy, has the expert label the states it visits, adds them to the dataset and retrains, so the data comes to cover the states the learned policy actually reaches; the paper casts this as no-regret online learning, which gives guarantees under the learner's own state distribution (Ross et al., [“A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning”](https://arxiv.org/abs/1011.0686) (2011)).
- **Inverse RL recovers a reward, but not a unique one.** Inverse RL tries to infer the expert's reward from behavior and then train with RL, but this cannot be done exactly, because a policy can be optimal for many rewards and every policy is optimal under a constant reward (Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., section 17.4](http://incompleteideas.net/book/RLbook2020.pdf) (2018)). Generative adversarial imitation learning (GAIL) skips the slow, indirect route of inverse RL followed by RL and extracts a policy directly from demonstrations, by analogy with generative adversarial networks (Ho and Ermon, [“Generative Adversarial Imitation Learning”](https://arxiv.org/abs/1606.03476) (2016)).
- **Offline RL fails by trusting the values of unseen actions.** Offline RL learns from previously collected data without new online collection, and because its Bellman backups query actions outside the data, a policy trained to maximize the learned Q-values learns to pick actions whose values are wrongly high, with no interaction to correct them (Levine et al., [“Offline Reinforcement Learning: Tutorial, Review, and Perspectives on Open Problems”](https://arxiv.org/abs/2005.01643) (2020)). Remedies keep the policy close to the data, as batch-constrained RL does against what its authors call extrapolation error (Fujimoto et al., [“Off-Policy Deep Reinforcement Learning without Exploration”](https://arxiv.org/abs/1812.02900) (2018)), or learn a conservative Q-function whose expected policy value is a lower bound on the true value (Kumar et al., [“Conservative Q-Learning for Offline Reinforcement Learning”](https://arxiv.org/abs/2006.04779) (2020)).
- **Sequence models, and judging a policy without running it.** Decision Transformer recasts RL as conditional sequence modeling: a causally masked transformer outputs actions conditioned on the desired return, past states and past actions (Chen et al., [“Decision Transformer: Reinforcement Learning via Sequence Modeling”](https://arxiv.org/abs/2106.01345) (2021)). Estimating how well a new policy would do from data collected by another policy is off-policy evaluation, and the most direct way to do it is importance sampling (Levine et al., [tutorial, section 3](https://arxiv.org/abs/2005.01643)).
- **Reward design, and why all this matters for LLMs.** Sparse rewards can leave an agent wandering aimlessly for long periods, shaping starts from a reward that is not sparse given the agent's initial behavior and moves it gradually toward the real one, and intrinsically motivated RL lets rewards depend on internal signals such as learning progress ([Sutton and Barto, section 17.4](http://incompleteideas.net/book/RLbook2020.pdf)). WebGPT shows the link to language models: it used "behavior cloning (i.e., supervised fine-tuning)" on demonstrations, then rejection sampling against a reward model trained on human comparisons (Nakano et al., [“WebGPT: Browser-assisted question-answering with human feedback”](https://arxiv.org/abs/2112.09332) (2021)). Earlier, deep RL agents had been trained from human preferences between pairs of trajectory segments, without access to the reward function (Christiano et al., [“Deep Reinforcement Learning from Human Preferences”](https://arxiv.org/abs/1706.03741) (2017)).

## Planned visuals

- `stepper`: compounding error in behavior cloning: a cloned policy drifts off the expert's path one small mistake at a time, then DAgger adds expert labels on the drifted states and the next policy stays on track.
- `tree`: methods by the data they need: demonstrations (behavior cloning, DAgger, inverse RL, GAIL), logged rewards (batch-constrained RL, CQL, Decision Transformer) and preferences (reward models, RLHF), each leaf linked to its chapter.
- `compare`: online RL next to offline RL: who collects the data, what corrects an overestimated value, and how a policy is evaluated before it is deployed.

## Talk like an expert

Experts start from the data: expert demonstrations, an expert they can query, logged interactions from a behavior policy, or preferences. They talk about compounding errors, distribution shift, out-of-distribution actions, conservatism and policy constraints, and they ask how an offline policy will be evaluated before it touches the real system.

## Go deeper

- Ross et al., [“A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning”](https://arxiv.org/abs/1011.0686) (2011).
- Levine et al., [“Offline Reinforcement Learning: Tutorial, Review, and Perspectives on Open Problems”](https://arxiv.org/abs/2005.01643) (2020).
- Ho and Ermon, [“Generative Adversarial Imitation Learning”](https://arxiv.org/abs/1606.03476) (2016).
- Kumar et al., [“Conservative Q-Learning for Offline Reinforcement Learning”](https://arxiv.org/abs/2006.04779) (2020).

## Related

- [Reinforcement learning primer](#rl-primer)
- [Supervised fine-tuning](#sft)
- [Embodied and robotics agents](#embodied-agents)
- [Preference optimization](#preference-optimization)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [MDPs, Bellman equations and value-based RL](#value-based-rl)
