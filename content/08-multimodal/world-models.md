---
id: world-models
book: 8
order: "8.4.2"
title: World models
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [world-models, model-based-rl, action-conditioned-video, jepa, simulation]
visuals: []
prerequisites: [video-world-models, rl-primer]
---
> [!tldr]
> A world model predicts what happens next in an environment, given what has happened so far and what an agent does. Two traditions meet here: model-based reinforcement learning, where agents learn compact dynamics and practice in imagination, and large action-conditioned video models that generate worlds you can explore. Remember that every rollout drifts: memory, consistency and physics errors limit how far you can trust a learned simulator.

## Key ideas

- **Learn the dynamics, then practice in imagination.** Ha and Schmidhuber trained a generative model of reinforcement learning environments without supervision, fed its compressed features to a very small policy, and showed that an agent trained entirely inside the model's “hallucinated dream” could transfer back to the real environment (Ha and Schmidhuber, [“World Models”](https://arxiv.org/abs/1803.10122) (2018)). DreamerV3 learns a world model and improves its behavior by imagining future scenarios; with one fixed configuration it beat specialized methods on more than 150 tasks and was the first algorithm to collect diamonds in Minecraft from scratch, without human data or curricula (Hafner et al., [“Mastering Diverse Domains through World Models”](https://arxiv.org/abs/2301.04104) (2023)).
- **Actions can be learned from unlabeled video.** Genie combines a spatiotemporal video tokenizer, an autoregressive dynamics model and a latent action model; trained on unlabeled Internet videos with no action labels, its 11B-parameter model still lets users act frame by frame in the worlds it generates (Bruce et al., [“Genie: Generative Interactive Environments”](https://arxiv.org/abs/2402.15391) (2024)).
- **Real-time explorable worlds, as dated examples.** GameNGen runs the game DOOM at 20 frames per second on a single TPU as a diffusion model conditioned on past frames and actions, but sees only a little over 3 seconds of history (Valevski et al., [“Diffusion Models Are Real-Time Game Engines”](https://arxiv.org/abs/2408.14837) (2024)). Genie 3 (August 2025) generates worlds at 720p and 24 fps that stay largely consistent for several minutes, with visual memory of about a minute, and Google DeepMind lists its limits: a restricted action space, interactions between several agents, geographic accuracy for real places, text rendering, and sessions of minutes rather than hours (Google DeepMind, [“Genie 3: A new frontier for world models”](https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/) (2025)); Project Genie, an experimental research prototype built on Genie 3 that began rolling out to Google AI Ultra subscribers in the US in January 2026, listed generations limited to 60 seconds among its known limitations (Google, [“Project Genie: Experimenting with infinite, interactive worlds”](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/) (2026)).
- **Predict representations, not pixels.** A joint-embedding predictive architecture (JEPA) predicts in a learned representation space, which ignores unpredictable detail such as the position of every leaf; V-JEPA 2 pretrains on over 1 million hours of internet video, and its action-conditioned variant, post-trained on less than 62 hours of unlabeled robot video, plans pick-and-place toward image goals on Franka arms in two labs without data from those robots or task-specific reward (Assran et al., [“V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning”](https://arxiv.org/abs/2506.09985) (2025)).
- **World foundation models for physical AI.** NVIDIA's Cosmos starts from the view that physical AI needs to be trained digitally first, with a digital twin of the policy and a digital twin of the world, the world model; it releases open-weight pretrained world models, video tokenizers, a video curation pipeline and post-training examples (camera control, robotic manipulation and autonomous driving) so that developers can fine-tune customized world models for their own setups (NVIDIA, [“Cosmos World Foundation Model Platform for Physical AI”](https://arxiv.org/abs/2501.03575) (2025)). Generated worlds also serve as test grounds for agents: Google DeepMind ran a SIMA agent toward goals inside Genie 3 worlds ([Google DeepMind, 2025](https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/)).
- **Errors compound, so evaluate downstream.** Training on real past frames but generating from the model's own output makes rollouts drift; without noise added to its context frames during training, GameNGen's quality degraded after 10 to 20 frames ([Valevski et al., 2024](https://arxiv.org/abs/2408.14837)). Visual realism does not imply physical understanding (Motamed et al., [“Do generative video models understand physical principles?”](https://arxiv.org/abs/2501.09038) (2025)), so the telling test is whether a policy planned or trained in the model works in the real world, as V-JEPA 2 shows on real robot arms ([Assran et al., 2025](https://arxiv.org/abs/2506.09985)).

## Planned visuals

- `diagram`: the world-model loop: observation, encoder, latent state, a dynamics model that takes the action, predicted next state and reward, and a policy that acts in imagination, with variants for Dreamer, Genie and V-JEPA 2.
- `stepper`: compounding rollout error: frames generated one after another as the error grows, then the same rollout with noise-augmented context, labeled illustrative.
- `compare`: a model-based RL world model next to an interactive video world model: inputs, action space, consistency horizon, compute and how each is evaluated.

## Talk like an expert

Experts talk about latent dynamics, imagination rollouts, action-conditioned generation, latent actions, the consistency horizon, compounding error, representation-space prediction and the sim-to-real gap. They ask what the action space is, how long the world stays consistent, and whether a policy that succeeds inside the model also succeeds outside it (see [Vision-language-action models, robot data and sim-to-real](#vla-models)).

## Go deeper

- Ha and Schmidhuber, [“World Models”](https://arxiv.org/abs/1803.10122) (2018).
- Hafner et al., [“Mastering Diverse Domains through World Models”](https://arxiv.org/abs/2301.04104) (2023).
- Bruce et al., [“Genie: Generative Interactive Environments”](https://arxiv.org/abs/2402.15391) (2024).
- Assran et al., [“V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning”](https://arxiv.org/abs/2506.09985) (2025).

## Related

- [Video, 3D and world models](#video-world-models)
- [Video generation models](#video-generation)
- [Embodied and robotics agents](#embodied-agents)
- [Reinforcement learning primer](#rl-primer)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [3D reconstruction and generation](#three-d-generation)
