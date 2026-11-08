---
id: sae-circuit-tracing
book: 2
order: "2.10.1"
title: Sparse autoencoders, transcoders and circuit tracing
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [interpretability, sparse-autoencoders, transcoders, circuits, attribution-graphs]
visuals: []
prerequisites: [mech-interp]
---
> [!tldr]
> A sparse autoencoder (SAE) rewrites a model's dense activations as a sparse sum of many learned feature directions, which are often interpretable. Transcoders do the same for what an MLP layer computes, and circuit tracing chains their features into attribution graphs that show how a model reached one output on one prompt. Remember that features and graphs describe a replacement model that explains only part of the real one, so every claim needs an intervention on the real model to back it.

## Key ideas

- **Dictionary learning on activations.** If a model represents concepts as directions and packs more of them than it has neurons (superposition), an SAE can learn an overcomplete dictionary in which each activation is a sparse weighted sum of feature directions. Bricken et al. trained SAEs with an L2 reconstruction loss plus an L1 penalty on feature activations on the 512-neuron MLP layer of a one-layer transformer, with dictionaries from 512 to 131,072 features, and argued that the typical feature is interpretable (Bricken et al., [“Towards Monosemanticity: Decomposing Language Models With Dictionary Learning”](https://transformer-circuits.pub/2023/monosemantic-features/index.html) (2023)).
- **How SAEs are trained and scored.** The L1 penalty is a proxy for sparsity; TopK SAEs keep only the k largest latents to set sparsity directly and kept dead latents rare up to a 16-million-latent SAE on GPT-4 activations (Gao et al., [“Scaling and evaluating sparse autoencoders”](https://arxiv.org/abs/2406.04093) (2024)), and JumpReLU SAEs use a thresholded activation trained on the L0 count with straight-through estimators (Rajamanoharan et al., [“Jumping Ahead: Improving Reconstruction Fidelity with JumpReLU Sparse Autoencoders”](https://arxiv.org/abs/2407.14435) (2024)). An SAE is judged on reconstruction error, sparsity (L0, the average number of active latents) and the next-token loss when its reconstruction replaces the real activations, which Bricken et al. report as the fraction of loss recovered ([Bricken et al., 2023](https://transformer-circuits.pub/2023/monosemantic-features/index.html)).
- **Known pathologies.** Some latents die and never fire (168 of 4,096 in one run of Bricken et al., who resampled dead neurons during training), and features split as dictionaries grow, so one base64 feature in a small SAE became three subtler ones in a larger SAE ([Bricken et al., 2023](https://transformer-circuits.pub/2023/monosemantic-features/index.html)). The error an SAE leaves, its “dark matter”, is partly predictable: about half of the error vector and over 90% of its norm can be predicted linearly from the input activation, and larger SAEs mostly fail on the same contexts as smaller ones (Engels et al., [“Decomposing The Dark Matter of Sparse Autoencoders”](https://arxiv.org/abs/2410.14670) (2024)).
- **Transcoders and crosscoders read one place and write another.** A transcoder reads an MLP's input and predicts its output through a wide sparse layer, so its features stand in for the MLP and circuits can be traced through it (Dunefsky et al., [“Transcoders Find Interpretable LLM Feature Circuits”](https://arxiv.org/abs/2406.11944) (2024)); a cross-layer transcoder (CLT) reads the residual stream at one layer and writes to every later MLP output ([Ameisen et al., 2025](https://transformer-circuits.pub/2025/attribution-graphs/methods.html)). Crosscoders read and write several layers, or even several models, so one shared dictionary can compare a base model with its fine-tuned version, which is called model diffing (Lindsey et al., [“Sparse Crosscoders for Cross-Layer Features and Model Diffing”](https://transformer-circuits.pub/2024/crosscoders/index.html) (2024), a preliminary research update).
- **Attribution graphs trace a replacement model.** Ameisen et al. swap the MLPs for a CLT, which matched the underlying model's next-token completion in about 50% of cases (their largest CLT for an 18-layer model, on pretraining-style prompts), and for each prompt freeze attention patterns and normalization and add error nodes for the part of each MLP output the CLT misses, so that every edge between features is linear; the graph is pruned and its hypotheses are checked by intervening on features in the real model (Ameisen et al., [“Circuit Tracing: Revealing Computational Graphs in Language Models”](https://transformer-circuits.pub/2025/attribution-graphs/methods.html) (2025)). The authors list what it still misses, including the role of attention patterns, reconstruction errors, suppression motifs and global circuits, and Sharkey et al. survey the open problems of the whole field (Sharkey et al., [“Open Problems in Mechanistic Interpretability”](https://arxiv.org/abs/2501.16496) (2025)).
- **Open tooling, and how to read a feature dashboard.** As of November 2026: Gemma Scope released JumpReLU SAEs for all layers and sublayers of Gemma 2 2B and 9B (Lieberum et al., [“Gemma Scope: Open Sparse Autoencoders Everywhere All At Once on Gemma 2”](https://arxiv.org/abs/2408.05147) (2024)), [SAELens](https://github.com/decoderesearch/SAELens) trains and loads SAEs, and [circuit-tracer](https://github.com/decoderesearch/circuit-tracer) computes attribution graphs from transcoders for open models such as Gemma-2 2B, Llama 3.2 1B and Qwen3. [Neuronpedia](https://www.neuronpedia.org/) shows each feature's top activations, top logits and activation density, with steering and a browser graph tool; a label drawn from top activations is a hypothesis to test on held-out text, not a fact.

## Planned visuals

- **`stepper`:** one activation vector through a TopK SAE: encode into many latents, keep the k largest, decode, then compare the reconstruction with the original and show the error left over.
- **`diagram`:** SAE, transcoder, cross-layer transcoder and crosscoder as variants of one picture, showing which layers each reads from and writes to, with links to the source papers' chapters.
- **`graph`:** a simplified attribution graph for one prompt, redrawn from a published example in Ameisen et al. (2025) and credited, with embedding, feature, error and output nodes, edge weights, and the intervention that tests one path.

## Talk like an expert

Experts talk about **latents** or **features**, **dictionary size**, **L0**, **dead latents**, **feature splitting**, **dark matter**, **transcoders**, **CLTs**, **error nodes** and **attribution graphs**. They separate what the replacement model does from what the model does, and treat a graph as a hypothesis until a steering or ablation experiment on the real model confirms it.

## Go deeper

- Bricken et al., [“Towards Monosemanticity: Decomposing Language Models With Dictionary Learning”](https://transformer-circuits.pub/2023/monosemantic-features/index.html) (2023).
- Gao et al., [“Scaling and evaluating sparse autoencoders”](https://arxiv.org/abs/2406.04093) (2024).
- Ameisen et al., [“Circuit Tracing: Revealing Computational Graphs in Language Models”](https://transformer-circuits.pub/2025/attribution-graphs/methods.html) (2025).
- Sharkey et al., [“Open Problems in Mechanistic Interpretability”](https://arxiv.org/abs/2501.16496) (2025).

## Related

- [Mechanistic interpretability](#mech-interp)
- [Probes, lenses and steering](#probes-and-steering)
- [Autoencoders and latent spaces](#autoencoders-latent-spaces)
- [Alignment concepts](#alignment-concepts)
- [High-dimensional geometry](#high-dimensional-geometry)
