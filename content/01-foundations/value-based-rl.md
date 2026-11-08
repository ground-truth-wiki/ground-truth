---
id: value-based-rl
book: 1
order: "1.7.2"
title: MDPs, Bellman equations and value-based RL
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [mdp, bellman-equation, q-learning, temporal-difference, dqn]
visuals: []
prerequisites: [rl-primer]
---
> [!tldr]
> A Markov decision process (MDP) describes a problem as states, actions, rewards and transition probabilities, and value-based RL learns how much future reward each state or action is worth, then acts on those values. Bellman equations give values a recursive structure that dynamic programming, temporal-difference learning, Q-learning and DQN all exploit. Remember the deadly triad: function approximation, bootstrapping and off-policy training together can make value learning diverge.

## Key ideas

- **MDPs, returns and the Markov property.** In an MDP the next state and reward depend only on the current state and action, so the state must carry everything about the past that matters for the future (Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 3](http://incompleteideas.net/book/RLbook2020.pdf) (2018)). The agent maximizes the return, a sum of rewards over a finite episode or, for tasks that never end, a discounted sum with a factor γ below 1 that keeps the total finite as long as rewards are bounded ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), section 3.3); if the agent sees only an observation that leaves out part of the state, the problem is partially observed ([OpenAI Spinning Up: Key concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)).
- **Value functions and Bellman equations.** The state value V^π(s) is the expected return from s when following policy π, the action value Q^π(s, a) is the expected return after first taking action a, and the advantage A^π(s, a) = Q^π(s, a) − V^π(s) says how much better a is than the policy's average action; the Bellman expectation equation writes a value as the expected immediate reward plus the discounted value of the next state, and the optimality equation replaces the policy's average over actions with a maximum ([OpenAI Spinning Up](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)).
- **Dynamic programming and generalized policy iteration.** With a known model, policy evaluation computes the values of a policy, policy improvement makes the policy greedy with respect to them, policy iteration alternates the two and value iteration folds them into a single sweep; Sutton and Barto call any interleaving of evaluation and improvement generalized policy iteration and note that almost all RL methods fit it ([chapter 4](http://incompleteideas.net/book/RLbook2020.pdf)).
- **Monte Carlo waits, temporal difference bootstraps.** Monte Carlo methods update toward the actual return of an episode, while TD methods update toward R + γV(s′), using their own estimate of the next state, and the gap R + γV(s′) − V(s) is the TD error; SARSA learns the values of the policy it follows (on-policy), Q-learning learns the values of the greedy policy while exploring (off-policy), and n-step returns and eligibility traces interpolate between TD and Monte Carlo ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), chapters 6, 7 and 12). The same interpolation reappears as the λ of generalized advantage estimation (Schulman et al., [“High-Dimensional Continuous Control Using Generalized Advantage Estimation”](https://arxiv.org/abs/1506.02438) (2015)).
- **The deadly triad, and how DQN copes with it.** Combining function approximation, bootstrapping and off-policy training risks instability and divergence ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), section 11.3). DQN learned to play seven Atari games from raw pixels with a convolutional Q-network and experience replay (Mnih et al., [“Playing Atari with Deep Reinforcement Learning”](https://arxiv.org/abs/1312.5602) (2013)), and its 2015 version also computes targets with a target network that is copied from the online network only every τ steps; because the max in the Q-learning target uses the same values both to select and to evaluate an action, it tends to pick overestimated values, so Double DQN selects the next action with the online network but evaluates it with the target network, which reduces DQN's overestimation (van Hasselt et al., [“Deep Reinforcement Learning with Double Q-learning”](https://arxiv.org/abs/1509.06461) (2015)).
- **Why LLM post-training builds on policy gradients.** Policy-gradient methods optimize a parameterized policy directly instead of deriving it from action values, and for discrete actions a natural and common parameterization is a softmax over preferences that a neural network can compute ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), section 13.1); a language model's next-token distribution has exactly that form. InstructGPT's RLHF stage used PPO (Ouyang et al., [“Training language models to follow instructions with human feedback”](https://arxiv.org/abs/2203.02155) (2022)), and GRPO, a PPO variant, drops the learned value function and estimates its baseline from the scores of a group of sampled answers (Shao et al., [“DeepSeekMath”](https://arxiv.org/abs/2402.03300) (2024)). Value functions survive there as critics and baselines, covered in [policy gradients, actor-critic and PPO](#policy-gradient-methods).

## Planned visuals

- `stepper`: one Q-learning update on a small gridworld: the transition, the TD target, the TD error and the new Q-value, then the same update in DQN with a minibatch from the replay buffer and a frozen target network.
- `compare`: SARSA next to Q-learning on the cliff-walking gridworld from Sutton and Barto (Example 6.6): the on-policy learner takes the safer path away from the cliff, the off-policy learner learns the optimal path along its edge.
- `diagram`: value-learning methods placed by the width of their updates (sample or expected) and their depth (one-step bootstrapping or full returns), with TD, dynamic programming, Monte Carlo and exhaustive search in the corners, after Figure 8.11 of Sutton and Barto.

## Talk like an expert

Experts talk about the **MDP**, the **Markov property**, **discount**, **Bellman backups**, **bootstrapping**, the **TD error**, **on-policy** versus **off-policy**, **replay buffers**, **target networks**, **overestimation** and the **deadly triad**, and they frame any method by how it estimates values and how it turns those values into a policy.

## Go deeper

- Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed.](http://incompleteideas.net/book/RLbook2020.pdf) (2018), chapters 3 to 6 and 9 to 12.
- [OpenAI Spinning Up: Key concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html).
- van Hasselt et al., [“Deep Reinforcement Learning with Double Q-learning”](https://arxiv.org/abs/1509.06461) (2015).
- [CS 285 Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/), UC Berkeley, Spring 2026, with lectures on value-based RL and Q-learning in practice.

## Related

- [Reinforcement learning primer](#rl-primer)
- [Policy gradients, actor-critic and PPO](#policy-gradient-methods)
- [Multi-armed and contextual bandits](#bandits)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [RL with verifiable rewards and reasoning models](#rlvr-reasoning)
