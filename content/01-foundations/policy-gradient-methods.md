---
id: policy-gradient-methods
book: 1
order: "1.7.3"
title: Policy gradients, actor-critic and PPO
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [policy-gradient, ppo, actor-critic, gae, reinforcement-learning]
visuals: []
prerequisites: [rl-primer, calculus-optimization]
---
> [!tldr]
> Policy-gradient methods improve a parameterized policy directly by gradient ascent on expected return: actions that led to better-than-expected outcomes become more likely. Baselines, critics and generalized advantage estimation tame the noise, and trust regions or PPO's clipping keep each update small enough not to wreck the policy. PPO and variants such as GRPO are used to train language models with RL, so this vocabulary is the vocabulary of LLM post-training.

## Key ideas

- **The log-derivative trick turns returns into a gradient.** Because the gradient of a probability equals the probability times the gradient of its log, the gradient of expected return becomes an average of ∇log π(a|s) weighted by returns, which sampled trajectories can estimate without differentiating through the environment ([OpenAI Spinning Up: Intro to policy optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)); Sutton and Barto state this as the policy-gradient theorem and derive REINFORCE from it (Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 13](http://incompleteideas.net/book/RLbook2020.pdf) (2018)). Weighting each action only by the rewards that came after it, the reward-to-go, removes zero-mean noise and reduces the number of trajectories needed ([Spinning Up](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)).
- **Baselines, advantages and critics cut variance.** Subtracting a baseline that depends only on the state leaves the expected gradient unchanged, and the common choice, a learned state-value function, reduces variance; weighting by the advantage Q − V is the same idea ([Spinning Up](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)). Actor-critic methods go one step further: a learned state-value function, the critic, judges each action of the policy, the actor, through the one-step return (the reward plus the discounted value of the next state), which often lowers variance but introduces bias ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), section 13.5), and the asynchronous actor-critic of Mnih et al. runs many actor-learners in parallel, which the authors found stabilizes training (Mnih et al., [“Asynchronous Methods for Deep Reinforcement Learning”](https://arxiv.org/abs/1602.01783) (2016)).
- **GAE trades bias for variance with one knob, λ.** Generalized advantage estimation is an exponentially weighted average of advantage estimates, analogous to TD(λ): λ = 0 gives the one-step TD residual, which has low variance but is biased unless the value function is exact, and λ = 1 gives the discounted sum of rewards minus the value estimate, which adds no bias from the value function but has high variance (Schulman et al., [“High-Dimensional Continuous Control Using Generalized Advantage Estimation”](https://arxiv.org/abs/1506.02438) (2015)).
- **Trust regions and PPO keep each step small.** TRPO constrains every update to a trust region and resembles natural policy gradient methods, as a practical approximation of a procedure with guaranteed monotonic improvement (Schulman et al., [“Trust Region Policy Optimization”](https://arxiv.org/abs/1502.05477) (2015)). PPO reaches similar stability with first-order optimization and allows several epochs of minibatch updates per batch (Schulman et al., [“Proximal Policy Optimization Algorithms”](https://arxiv.org/abs/1707.06347) (2017)): PPO-Clip clips the probability ratio π_new/π_old to the range 1 ± ε so larger moves earn nothing extra, PPO-Penalty adds an adaptively weighted KL penalty instead, and Spinning Up's implementation also stops early when the mean KL divergence passes a threshold ([OpenAI Spinning Up: PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html)).
- **On-policy learning is costly; off-policy actor-critics reuse data.** PPO is on-policy: it learns from data collected by running the current policy ([Spinning Up: PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html)). Haarnoja et al. name on-policy learning, which needs new samples for each gradient step in TRPO, PPO and A3C, as one cause of poor sample efficiency, and off-policy algorithms aim to reuse past experience ([Haarnoja et al., 2018](https://arxiv.org/abs/1801.01290)). For continuous control, DDPG learns a deterministic policy with a Q-function critic (Lillicrap et al., [“Continuous control with deep reinforcement learning”](https://arxiv.org/abs/1509.02971) (2015)), TD3 takes the minimum of two critics to limit overestimation and delays policy updates to reduce per-update error (Fujimoto et al., [“Addressing Function Approximation Error in Actor-Critic Methods”](https://arxiv.org/abs/1802.09477) (2018)), and soft actor-critic maximizes reward plus entropy, aiming to succeed while acting as randomly as possible, with off-policy updates and stable results across seeds (Haarnoja et al., [“Soft Actor-Critic”](https://arxiv.org/abs/1801.01290) (2018)).
- **LLM RL is policy gradients with extra care.** InstructGPT's RLHF stage optimized the model with PPO (Ouyang et al., [“Training language models to follow instructions with human feedback”](https://arxiv.org/abs/2203.02155) (2022)), and GRPO drops PPO's critic and estimates the baseline from the scores of a group of sampled answers, which cuts training resources (Shao et al., [“DeepSeekMath”](https://arxiv.org/abs/2402.03300) (2024)); the LLM-specific variants and their settings are in [policy-gradient algorithms for LLMs](#llm-policy-gradients). Two warning signs to watch are policy entropy that collapses early, which Cui et al. found coincides with performance saturating in RL for reasoning models (Cui et al., [“The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models”](https://arxiv.org/abs/2505.22617) (2025)), and a KL divergence from the old policy that grows too fast, which clipping, KL penalties and early stopping exist to contain ([Spinning Up: PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html)).

## Planned visuals

- `stepper`: one REINFORCE update on a tiny policy: sample trajectories, compute rewards-to-go, subtract a baseline, and watch the probabilities of better-than-average actions rise, with the gradient estimate's spread shrinking once the baseline is added.
- `chart`: PPO's clipped objective as a function of the probability ratio, one panel for a positive and one for a negative advantage, with the flat regions beyond 1 ± ε marked (formula-based).
- `diagram`: the policy-gradient family tree from REINFORCE to actor-critic, TRPO, PPO and GRPO, and the off-policy branch of DDPG, TD3 and SAC, with each node linking to its chapter.

## Talk like an expert

Experts talk about the **score function** or **log-derivative trick**, **reward-to-go**, **baselines**, **advantages**, the **critic**, **GAE λ**, the **probability ratio**, the **clip range ε**, **KL** to the old or reference policy and **entropy**, and they read a training run through its KL and entropy curves, not only its reward curve.

## Go deeper

- Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 13 “Policy Gradient Methods”](http://incompleteideas.net/book/RLbook2020.pdf) (2018).
- [OpenAI Spinning Up: Intro to policy optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html) and [Proximal Policy Optimization](https://spinningup.openai.com/en/latest/algorithms/ppo.html).
- Schulman et al., [“Proximal Policy Optimization Algorithms”](https://arxiv.org/abs/1707.06347) (2017).
- Schulman et al., [“High-Dimensional Continuous Control Using Generalized Advantage Estimation”](https://arxiv.org/abs/1506.02438) (2015).

## Related

- [Reinforcement learning primer](#rl-primer)
- [MDPs, Bellman equations and value-based RL](#value-based-rl)
- [Policy-gradient algorithms for LLMs: from REINFORCE to GRPO and beyond](#llm-policy-gradients)
- [Preference optimization](#preference-optimization)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
- [Automatic differentiation](#automatic-differentiation)
