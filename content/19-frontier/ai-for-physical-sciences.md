---
id: ai-for-physical-sciences
book: 19
order: "19.7.3"
title: AI for weather, climate and materials
level: frontier
stability: volatile
reviewed: "2026-11"
status: seed
tags: [weather, materials, learned-simulators, surrogate-models, science]
visuals: []
prerequisites: [ai-for-science, neural-networks]
---
> [!tldr]
> In weather, climate and materials science, AI mostly works as a learned simulator or emulator: a network trained on simulations, reanalysis data or quantum calculations that predicts the next state of a system, or a property, far faster than the physics code it learned from. Learned weather models now run operationally beside physics-based ones, and generative models propose new materials. The one thing to remember: speed is easy to show and validity is hard, so hindcasts, physical checks, lab synthesis and independent critique decide what counts.

## Key ideas

- **Learned simulators are a reusable pattern.** Graph Network-based Simulators represent a physical system as particles connected in a graph and predict its next state by message passing; trained on single steps with thousands of particles, they generalized to thousands of steps and at least ten times more particles, and long-run accuracy depended on adding noise to training inputs, which limits the error that builds up when predictions are fed back as inputs over a rollout (Sanchez-Gonzalez et al., [“Learning to Simulate Complex Physics with Graph Networks”](https://arxiv.org/abs/2002.09405) (2020)). Neural operators learn maps between whole functions instead of fixed grids: the Fourier neural operator solved Burgers', Darcy and Navier-Stokes problems up to three orders of magnitude faster than traditional solvers (Li et al., [“Fourier Neural Operator for Parametric Partial Differential Equations”](https://arxiv.org/abs/2010.08895) (2020)). See [graph neural networks](#graph-neural-networks).
- **Machine-learning weather prediction.** GraphCast, a graph neural network trained on four decades of ECMWF's ERA5 reanalysis, makes a 10-day global forecast at 0.25 degrees in under a minute on one TPU v4 and beat ECMWF's HRES on more than 90% of 1,380 test variables and lead times ([Google DeepMind, November 2023](https://deepmind.google/discover/blog/graphcast-ai-model-for-faster-and-more-accurate-global-weather-forecasting/)). GenCast, a diffusion model, produces ensembles of 50 or more forecasts out to 15 days and beat ECMWF's ENS ensemble on 97.2% of 1,320 targets in tests on 2019 data ([Google DeepMind, December 2024](https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/)).
- **Operational status, dated.** ECMWF's own learned model, AIFS, became operational at the end of February 2025, and its 51-member ensemble on 1 July 2025, running side by side with the physics-based IFS; ECMWF says the 31 km AIFS ensemble beats physics-based models on many measures, while the 9 km physics ensemble remains indispensable for high-resolution fields and coupled Earth-system processes ([ECMWF, 1 July 2025](https://www.ecmwf.int/en/about/media-centre/news/2025/ecmwfs-ensemble-ai-forecasts-become-operational)). As of November 2026, the latest upgrade, AIFS v2, has been live since 12 May 2026 alongside IFS Cycle 50r1 ([ECMWF, 12 May 2026](https://www.ecmwf.int/en/about/media-centre/news/2026/ifs-cycle-50r1-aifsv2-live)).
- **Materials discovery and generative design.** GNoME predicted 2.2 million new crystals, of which about 380,000 rank as most stable and were added to the Materials Project; external researchers made 736 of the predicted structures, and Berkeley Lab's autonomous A-Lab reported synthesizing more than 41 new materials ([Google DeepMind, November 2023](https://deepmind.google/discover/blog/millions-of-new-materials-discovered-with-deep-learning/)). MatterGen, a diffusion model over atom positions, elements and the periodic lattice trained on 608,000 stable materials, was conditioned on a bulk modulus of 200 GPa and produced TaCr2O6, which measured 169 GPa after synthesis; it pairs with the MatterSim emulator for property checks and is released under MIT ([Microsoft Research, January 2025](https://www.microsoft.com/en-us/research/blog/mattergen-a-new-paradigm-of-materials-design-with-generative-ai/)). Closing the loop with robots is covered in [AI scientist agents and autonomous labs](#ai-scientist-agents).
- **Machine-learned interatomic potentials stand in for quantum calculations.** MACE uses higher-body-order equivariant messages, so two message-passing steps suffice, which makes it fast and parallel while matching or beating the state of the art on standard molecular benchmarks (Batatia et al., [“MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields”](https://arxiv.org/abs/2206.07697) (2022)). MACE-MP-0, one general-purpose model trained on a public dataset of moderate size, was applied to solids, liquids, gases, reactions, interfaces and a small protein with "qualitative and at times quantitative accuracy", and can be fine-tuned toward ab initio accuracy with a handful of extra data points (Batatia et al., [“A foundation model for atomistic materials chemistry”](https://arxiv.org/abs/2401.00096) (2023)).
- **Independent critiques decide what a discovery claim is worth.** Reviewing a sample of GNoME's predictions, Cheetham and Seshadri found "scant evidence for compounds that fulfill the trifecta of novelty, credibility, and utility", partly because calculations at 0 K order similar metal ions that real high-temperature syntheses leave disordered (Cheetham and Seshadri, [“Artificial Intelligence Driving Materials Discovery?”](https://pmc.ncbi.nlm.nih.gov/articles/PMC11044265) (2024)). Leeman et al. re-examined all 43 A-Lab products and concluded that no new materials had been established, citing unreliable automated analysis of X-ray diffraction data and neglected compositional disorder (Leeman et al., [“Challenges in High-Throughput Inorganic Materials Prediction and Autonomous Synthesis”](https://journals.aps.org/prxenergy/abstract/10.1103/PRXEnergy.3.011002) (2024)).

## Planned visuals

- **`stepper`:** a learned simulator's rollout, step by step: each prediction is fed back as the next input, small errors grow, and training with noisy inputs keeps the rollout stable (illustrative, after Sanchez-Gonzalez et al.).
- **`compare`:** numerical against machine-learning weather prediction: physics equations against a model learned from ERA5, hours on a supercomputer against under a minute on one TPU, single forecasts against ensembles, and resolution, each cell sourced and dated.
- **`diagram`:** the materials discovery loop: a generator or screen (GNoME, MatterGen), an emulator or interatomic potential (MatterSim, MACE), a quantum-mechanical check, synthesis, diffraction analysis and independent review, with the autonomous lab linking to [AI scientist agents](#ai-scientist-agents).

## Talk like an expert

The vocabulary: **learned simulator**, **emulator** and **surrogate model**, **reanalysis**, **hindcast**, **ensemble**, **rollout**, **interatomic potential**, **universal potential** and **compositional disorder**. Experts ask what a model was trained on, which operational baseline it was scored against and on what period, and whether anything was synthesized and checked by someone else; the habit that transfers to general engineering is to use fast surrogates for search and ensembles for uncertainty, then verify the winners with the slow, trusted method.

## Go deeper

- Sanchez-Gonzalez et al., [“Learning to Simulate Complex Physics with Graph Networks”](https://arxiv.org/abs/2002.09405) (2020).
- Li et al., [“Fourier Neural Operator for Parametric Partial Differential Equations”](https://arxiv.org/abs/2010.08895) (2020).
- Batatia et al., [“A foundation model for atomistic materials chemistry”](https://arxiv.org/abs/2401.00096) (2023).
- Cheetham and Seshadri, [“Artificial Intelligence Driving Materials Discovery? Perspective on the Article: Scaling Deep Learning for Materials Discovery”](https://pmc.ncbi.nlm.nih.gov/articles/PMC11044265) (2024).

## Related

- [AI for science, math and code](#ai-for-science)
- [Specialist models](#specialist-models)
- [AI scientist agents and autonomous labs](#ai-scientist-agents)
- [Image generation](#image-generation)
- [Neural networks](#neural-networks)
- [Playbook: ECMWF's AIFS: running a machine-learning weather model in operations](#ecmwf-aifs-operational)
- [Playbook: Google's flood forecasting: from gauged rivers in India and Bangladesh to ungauged basins worldwide](#google-flood-forecasting)
- [Field note: ECMWF's AIFS 1.1.0: bounding the outputs to fix precipitation forecasts](#ecmwf-aifs-precipitation-fix)
