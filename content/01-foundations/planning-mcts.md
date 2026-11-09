---
id: planning-mcts
book: 1
order: "1.7.4"
title: Model-based RL, planning and Monte Carlo tree search
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [mcts, planning, model-based-rl, alphazero, world-models]
visuals: []
prerequisites: [rl-primer]
---
> [!tldr]
> Model-based reinforcement learning gives an agent a model that predicts how the environment responds to its actions, so it can plan: try actions in simulation before taking them for real. Monte Carlo tree search (MCTS) is the planning method behind AlphaGo, AlphaZero and MuZero, where a learned policy and value guide the search and the search in turn trains the network. Remember that a plan is only as good as its model, and an agent can exploit the model's mistakes.

## Key ideas

- **A model predicts the next state and reward; planning turns it into a policy.** Sutton and Barto define a model as anything an agent can use to predict how the environment responds to its actions, call methods that require a model model-based and methods that can work without one model-free, the first relying mainly on planning and the second mainly on learning, and their Dyna architecture combines both by learning a model from real experience and planning with simulated experience from it (Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed., chapter 8](http://incompleteideas.net/book/RLbook2020.pdf) (2018)). The payoff can be much better sample efficiency, and the catch, in OpenAI's words, is that "bias in the model can be exploited by the agent" ([OpenAI Spinning Up: Kinds of RL algorithms](https://spinningup.openai.com/en/latest/spinningup/rl_intro2.html)).
- **Background planning versus decision-time planning.** Dyna improves values for many states ahead of time, while decision-time planning starts fresh at each state to choose one action: heuristic search backs values up a tree of continuations, and rollout algorithms average the returns of simulated trajectories for each candidate action, aiming to improve on the rollout policy rather than to find an optimal one ([Sutton and Barto, sections 8.8 to 8.10](http://incompleteideas.net/book/RLbook2020.pdf)). Model-predictive control works the same way: plan over a fixed window, execute the first action, discard the rest of the plan and plan again ([Spinning Up](https://spinningup.openai.com/en/latest/spinningup/rl_intro2.html)).
- **MCTS repeats selection, expansion, simulation and backup.** A tree policy walks down the tree, the tree may grow by one or more nodes, a rollout policy plays the episode out, and the return is backed up into the action values along the path; the move finally played is, for example, the root action with the highest value or the most visits ([Sutton and Barto, section 8.11](http://incompleteideas.net/book/RLbook2020.pdf)). The tree policy balances exploration and exploitation with a bandit rule, as in UCT (Kocsis and Szepesvári, [“Bandit Based Monte-Carlo Planning”](https://doi.org/10.1007/11871842_29) (2006)), and MuZero's version of the upper confidence bound adds the network's prior action probabilities, which count for less as a node is visited more often (Schrittwieser et al., [“Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model”](https://arxiv.org/abs/1911.08265) (2019)).
- **From AlphaGo to AlphaZero: networks guide search, search trains networks.** AlphaGo guided MCTS with policy and value networks learned by reinforcement learning from a start trained on human expert moves, while AlphaGo Zero used no human data, ran MCTS throughout self-play and followed the search's move probabilities, which improved on the network's own, so its authors wrote that MCTS "may therefore be viewed as a powerful policy improvement operator" ([Sutton and Barto, section 16.6](http://incompleteideas.net/book/RLbook2020.pdf)). AlphaZero applied the recipe to chess and shogi as well as Go, from random play and the rules alone, training its network toward the search's move distribution and the game outcome (Silver et al., [“Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm”](https://arxiv.org/abs/1712.01815) (2017)), and expert iteration names the pattern, with tree search as the expert and a neural network as its apprentice (Anthony et al., [“Thinking Fast and Slow with Deep Learning and Tree Search”](https://arxiv.org/abs/1705.08439) (2017)).
- **Learned models: MuZero and the Dreamer line.** MuZero is not given the rules: it learns a model that predicts only what planning needs (the reward, the policy and the value) from a hidden state that does not have to match the true environment state, and it matched AlphaZero's superhuman play in Go, chess and shogi (Schrittwieser et al., [“Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model”](https://arxiv.org/abs/1911.08265) (2019)). DreamerV3 learns a model of the environment and improves its behavior by imagining future scenarios, with a single configuration across more than 150 tasks (Hafner et al., [“Mastering Diverse Domains through World Models”](https://arxiv.org/abs/2301.04104) (2023)).
- **The same pattern returns in test-time search for language models.** Tree of Thoughts lets a model consider several reasoning paths, evaluate its own choices, and look ahead or backtrack (Yao et al., [“Tree of Thoughts: Deliberate Problem Solving with Large Language Models”](https://arxiv.org/abs/2305.10601) (2023)), and LATS, covered with best-of-n and verifiers in [test-time search](#test-time-search), runs MCTS with language-model value functions, self-reflection and environment feedback (Zhou et al., [“Language Agent Tree Search Unifies Reasoning Acting and Planning in Language Models”](https://arxiv.org/abs/2310.04406) (2023)).

## Planned visuals

- `stepper`: one MCTS iteration on a small game tree, frame by frame: selection by the tree policy, expansion, a rollout (or a value-network estimate) and the backup that updates visit counts and values.
- `compare`: AlphaZero next to MuZero: what each is given (the rules or nothing), what the network predicts, and where the search runs (real game states or learned hidden states).
- `diagram`: the expert-iteration loop: search improves on the network's policy, the network is trained toward the search's choices, and the stronger network guides the next search.

## Talk like an expert

Experts first ask where the model comes from (given rules, learned dynamics or a learned latent model) and whether planning happens in the background or at decision time. They talk about tree and rollout policies, priors, visit counts, bootstrapped values, and search as a policy improvement operator.

## Go deeper

- Sutton and Barto, [*Reinforcement Learning: An Introduction*, 2nd ed.](http://incompleteideas.net/book/RLbook2020.pdf) (2018), chapter 8 and section 16.6.
- Silver et al., [“Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm”](https://arxiv.org/abs/1712.01815) (2017).
- Schrittwieser et al., [“Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model”](https://arxiv.org/abs/1911.08265) (2019).
- Hafner et al., [“Mastering Diverse Domains through World Models”](https://arxiv.org/abs/2301.04104) (2023).

## Related

- [Reinforcement learning primer](#rl-primer)
- [MDPs, Bellman equations and value-based RL](#value-based-rl)
- [Test-time search, sampling and verification](#test-time-search)
- [Planning and reasoning strategies](#planning-reasoning)
- [Reasoning and test-time scaling](#test-time-scaling)
- [Video, 3D and world models](#video-world-models)
- [Playbook: Deep Inventory Management: reinforcement learning for inventory buying by Amazon researchers](#amazon-deep-inventory-management)
