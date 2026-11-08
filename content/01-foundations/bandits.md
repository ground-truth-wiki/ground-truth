---
id: bandits
book: 1
order: "1.7.1"
title: Multi-armed and contextual bandits
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [bandits, exploration, thompson-sampling, ucb, off-policy-evaluation]
visuals: []
prerequisites: [rl-primer, probability-information]
---
> [!tldr]
> A bandit problem is reinforcement learning in which each action affects only the immediate reward: choose one of several actions, see the reward for that action only, and repeat, trying to collect as much reward as possible. It is exploration versus exploitation in its simplest form, and its algorithms (epsilon-greedy, UCB, Thompson sampling, LinUCB) run adaptive experiments, recommendations and model routing. Remember that a bandit minimizes the reward lost while learning, its regret, while an A/B test aims at a clean comparison.

## Key ideas

- **Estimate each action's value, then decide how much to explore.** In the k-armed bandit each action has an unknown mean reward; you keep a running estimate per action, updated incrementally as Q ← Q + (R − Q)/n, or with a constant step size that weights recent rewards more when the rewards drift over time (Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 2](http://incompleteideas.net/book/RLbook2020.pdf) (2018)). Epsilon-greedy explores at random with probability ε, optimistic initial values make every untried action look attractive at first, and gradient bandits learn action preferences that a softmax turns into probabilities ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf)).
- **Regret is the price of learning.** Regret is the gap between the total expected reward of the best policy in a comparison class and the total expected reward the learner collects; a good learner's regret grows sublinearly, and for stochastic Bernoulli bandits every policy has worst-case regret of at least order √n over n rounds, while some policies achieve O(√n) (Lattimore and Szepesvári, [*Bandit Algorithms*](https://tor-lattimore.com/downloads/book/book.pdf) (2020)).
- **Optimism and posterior sampling explore where it pays.** UCB picks the action with the highest estimate plus an uncertainty bonus c·√(ln t / N(a)) that shrinks each time the action is tried ([Sutton and Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf)), and Thompson sampling draws a plausible mean reward for each action from its posterior and plays the best draw, which for success-or-failure rewards means sampling from beta distributions (Russo et al., [“A Tutorial on Thompson Sampling”](https://arxiv.org/abs/1707.02038) (2017)). When rewards may be set by an adversary rather than drawn from fixed distributions, Exp3 plays actions with probabilities from exponential weights on importance-weighted reward estimates ([Lattimore and Szepesvári, 2020](https://tor-lattimore.com/downloads/book/book.pdf)).
- **Contextual bandits personalize the choice.** A contextual bandit sees features of the user or item before it acts; LinUCB models the expected reward as linear in those features, and on Yahoo! front-page news recommendation the authors report a 12.5% click lift over a context-free bandit (Li et al., [“A Contextual-Bandit Approach to Personalized News Article Recommendation”](https://arxiv.org/abs/1003.0146) (2010)). The same framing fits LLM routing: PILOT extends LinUCB to choose a model per query under a budget, learning only from feedback on the model it actually called (Panda et al., [“Adaptive LLM Routing under Budget Constraints”](https://arxiv.org/abs/2508.21141) (2025)).
- **Bandits and A/B tests answer different questions.** A classic A/B test splits traffic in fixed shares and decides at the end which version is better, while a bandit shifts traffic toward the better version as evidence arrives ([Lattimore and Szepesvári, 2020](https://tor-lattimore.com/downloads/book/book.pdf)); the price is that, under natural conditions, sample means from adaptively collected data are biased downward, and Nie et al. propose a debiasing method (Nie et al., [“Why Adaptively Collected Data Have Negative Bias and How to Correct for It”](https://arxiv.org/abs/1708.01977) (2017)). When only the final choice matters, the problem becomes pure exploration ([Lattimore and Szepesvári, 2020](https://tor-lattimore.com/downloads/book/book.pdf), chapter 33): Hyperband treats hyperparameter configurations as arms and stops weak ones early (Li et al., [“Hyperband”](https://arxiv.org/abs/1603.06560) (2016)).
- **Evaluate a new policy offline from logged decisions.** Logs show only the reward of the action taken; inverse propensity scoring reweights each logged reward by one over the probability that the logging policy chose that action, which corrects the action proportions but has high variance, a reward model (the direct method) needs an accurate model of rewards, and the doubly robust estimator combines both and stays unbiased if either one is correct (Dudík et al., [“Doubly Robust Policy Evaluation and Learning”](https://arxiv.org/abs/1103.4601) (2011)). If the logging policy chose actions uniformly at random, any bandit algorithm can be evaluated reliably offline by replaying the logs ([Li et al., 2010](https://arxiv.org/abs/1003.0146)).

## Planned visuals

- `chart`: cumulative regret over time for greedy, epsilon-greedy, UCB and Thompson sampling on one simulated Bernoulli bandit, labeled illustrative, showing that greedy can lock onto a bad arm while UCB and Thompson sampling flatten out.
- `stepper`: Thompson sampling on three arms: each frame shows the beta posteriors, the sampled values, the chosen arm, the reward and the updated posterior, until one arm dominates.
- `compare`: an A/B test next to a bandit on the same two variants: fixed traffic shares and a decision at the end versus traffic that shifts during the test, with reward lost and the clarity of the final estimate side by side.

## Talk like an expert

Experts talk about **arms**, **regret**, **explore-exploit**, **UCB**, **Thompson sampling**, **contextual bandits**, **propensities**, **IPS** and **doubly robust** estimates, and they first ask whether the goal is to earn reward during the experiment or to identify the best arm, and whether every decision is logged with its probability.

## Go deeper

- Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 2 “Multi-armed Bandits”](http://incompleteideas.net/book/RLbook2020.pdf) (2018).
- Lattimore and Szepesvári, [*Bandit Algorithms*](https://tor-lattimore.com/downloads/book/book.pdf) (2020), the free edition of the Cambridge University Press book.
- Russo et al., [“A Tutorial on Thompson Sampling”](https://arxiv.org/abs/1707.02038) (2017).
- Dudík et al., [“Doubly Robust Policy Evaluation and Learning”](https://arxiv.org/abs/1103.4601) (2011).

## Related

- [Reinforcement learning primer](#rl-primer)
- [Online evaluation](#online-evaluation)
- [Online controlled experiments for AI features](#online-experiments)
- [MDPs, Bellman equations and value-based RL](#value-based-rl)
- [Recommender systems](#recommender-systems)
- [Gateways and routers](#gateways-routers)
