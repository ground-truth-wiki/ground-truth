---
id: video-world-models
book: 8
order: "8.4"
title: Video, 3D and world models
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [video, world-models, 3d]
visuals:
  - world-model-loop:diagram
  - video-3d-tree:tree
---
> [!tldr]
> Video models generate coherent clips from text or images, increasingly with sound; 3D methods reconstruct scenes from photos; world models predict how an environment evolves in response to actions, which makes them useful for simulation, games and training agents and robots.

## Why it matters
Generated video is entering marketing, film and education, and world models are becoming training grounds for embodied and game-playing agents. Engineers should know their capabilities, costs, controls and the provenance questions they raise.

## Intuition
A video model is a director imagining a scene; a world model is a simulator that also answers “what happens if I push this?”.

```viz
{"id":"world-model-loop","component":"diagram","title":"A world model predicts what happens next, so an agent can practice in imagination","caption":"Simplified loop: the agent proposes actions, the world model predicts the next observation, and the agent learns or plans from imagined outcomes. Click a box for related chapters.","alt":"Diagram of an agent acting in a learned world model that predicts next observations from actions, used for planning and training.","data":"illustrative","w":600,"h":170,"nodes":[
{"id":"obs","label":"Observation","sub":"frames, state","role":"data","x":0,"y":56,"w":140,"h":56},
{"id":"agent","label":"Agent or policy","role":"agent","x":200,"y":0,"w":160,"h":56,"link":"#embodied-agents"},
{"id":"wm","label":"World model","sub":"predicts next frames","role":"model","x":200,"y":112,"w":160,"h":56},
{"id":"plan","label":"Plan or train","role":"tool","x":440,"y":56,"w":160,"h":56,"link":"#rl-primer"}],
"edges":[{"from":"obs","to":"agent"},{"from":"agent","to":"wm","label":"action"},{"from":"wm","to":"obs","label":"predicted next","style":"dashed"},{"from":"agent","to":"plan"}]}
```

## How it works
**Video generation.** Diffusion-transformer models generate spacetime patches; OpenAI’s Sora (2024), Google’s Veo models (Veo 3 in 2025 added synchronized audio) and others produce clips of seconds to about a minute, with image-to-video, camera control and editing.

**World models.** Models that learn environment dynamics and can be steered by actions: Google DeepMind’s Genie line (Genie 3 in 2025 generated interactive, explorable worlds in real time), learned simulators for driving and robotics, and earlier model-based RL work.

**3D.** Neural radiance fields (NeRF, Mildenhall et al., 2020) and Gaussian splatting (Kerbl et al., 2023) reconstruct scenes from photos for viewing from new angles; text-to-3D models generate assets.

```viz
{"id":"video-3d-tree","component":"tree","title":"Three families of spatial and temporal generation","caption":"Expand a family for representative methods and uses.","alt":"Tree of video generation, world models and 3D reconstruction with examples and uses.","data":"illustrative","open":1,"root":{"label":"Beyond still images","children":[
{"label":"Video generation","children":[{"label":"Text- and image-to-video with audio: marketing, previsualization, education"}]},
{"label":"World models","children":[{"label":"Action-conditioned prediction: simulation, games, robot and agent training","link":"#embodied-agents"}]},
{"label":"3D reconstruction and generation","children":[{"label":"NeRF, Gaussian splatting, text-to-3D: digital twins, games, AR"}]}]}}
```

**Limits.** Physics and object permanence errors, short coherent durations, high compute cost per second of video, and difficulty with precise control.

## In practice
- Expect minutes of compute per clip and budget accordingly.
- Plan for review and labeling of generated video. See [responsible AI](#responsible-ai).
- For agent training, treat world-model results as simulation with a reality gap.

## Numbers to know
> [!number]
> Rules of thumb. Generated clips typically run from a few seconds to about a minute. Video generation costs far more compute per output than images.

## Pitfalls and anti-patterns
> [!pitfall] Treating generated video as evidence
> Realistic video can be fabricated; provenance metadata and verification matter.

## Talk like an expert
The vocabulary: **spacetime patches**, **image-to-video**, **temporal coherence**, **world model**, **action-conditioned**, **NeRF**, **Gaussian splatting**, **sim-to-real**. Experts separate visual quality from physical correctness. The live debate is whether world models learned from video become general simulators for training agents.

> [!hottake] World models will become the main training environment for embodied AI.
> **The counterargument:** learned simulators inherit errors from their training video, and real-world data plus physics simulators remain necessary to close the reality gap.

## Check yourself
```quiz
video-world-models
```

## Go deeper
- OpenAI, “Video generation models as world simulators” (2024).
- Mildenhall et al., “NeRF” (2020); Kerbl et al., “3D Gaussian Splatting” (2023).

## Related
- [Image generation](#image-generation)
- [Embodied and robotics agents](#embodied-agents)
- [Multimodal applications](#multimodal-apps)
- [Reinforcement learning primer](#rl-primer)
- [Responsible AI in practice](#responsible-ai)
- [Self-supervised learning methods](#self-supervised-methods)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [Vision-language-action models, robot data and sim-to-real](#vla-models)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Video generation models](#video-generation)
- [World models](#world-models)
- [3D reconstruction and generation](#three-d-generation)
