---
id: mech-interp
book: 2
order: "2.10"
title: Mechanistic interpretability
level: frontier
stability: moving
reviewed: "2026-11"
status: full
tags: [interpretability, sae, circuits]
visuals:
  - superposition-viz:diagram
  - neuron-vs-feature:compare
---
> [!tldr]
> Mechanistic interpretability reverse-engineers what happens inside a model. Networks represent many more concepts than they have neurons by superposition, so sparse autoencoders decompose activations into interpretable features; circuit tracing then shows how features combine to produce outputs. The tools are young but already support debugging and steering.

## Why it matters
Evaluations tell you what a model does; interpretability tries to explain how. That matters for safety (detecting deception or dangerous knowledge), for debugging (why the model confuses two concepts), and for control (steering behavior by adjusting internal features). It is also one of the most active research areas in AI.

## Intuition
A model’s neurons are like a crowded radio band: many stations broadcast on overlapping frequencies. A sparse autoencoder is a better receiver that separates the stations, so you can hear one concept at a time.

```viz
{"id":"superposition-viz","component":"diagram","title":"A sparse autoencoder turns dense, mixed activations into many sparse, nameable features","caption":"A simplified view of dictionary learning on a model’s residual stream. Click a box for related chapters.","alt":"Diagram of a sparse autoencoder: model activations encoded into many sparse features, each with an interpretable label, then decoded back to reconstruct the activations.","data":"illustrative","w":600,"h":200,"nodes":[
{"id":"act","label":"Activations","sub":"4,096 dense numbers","role":"context","x":0,"y":72,"w":140,"h":56,"link":"#transformer-block"},
{"id":"enc","label":"Encoder","role":"model","x":175,"y":72,"w":100,"h":56},
{"id":"f1","label":"Feature: Golden Gate Bridge","role":"data","x":310,"y":0,"w":170,"h":44},
{"id":"f2","label":"Feature: code in Python","role":"data","x":310,"y":78,"w":170,"h":44},
{"id":"f3","label":"Feature: sarcasm","role":"data","x":310,"y":156,"w":170,"h":44},
{"id":"dec","label":"Reconstruction","role":"model","x":500,"y":72,"w":100,"h":56}],
"edges":[{"from":"act","to":"enc"},{"from":"enc","to":"f1"},{"from":"enc","to":"f2"},{"from":"enc","to":"f3"},{"from":"f1","to":"dec","style":"dashed"},{"from":"f2","to":"dec","style":"dashed"},{"from":"f3","to":"dec","style":"dashed"}]}
```

## How it works
**Superposition.** Elhage et al. (2022) showed in toy models that networks store more features than dimensions by overlapping them, which makes individual neurons respond to several unrelated concepts (polysemanticity).

**Sparse autoencoders.** Train a wide autoencoder on a model’s activations with a sparsity penalty, so each activation is explained by a few active features. Anthropic’s “Towards Monosemanticity” (2023) showed on a one-layer transformer that sparse autoencoders recover interpretable features, and “Scaling Monosemanticity” (2024) scaled the method to a production model, Claude 3 Sonnet, with up to 34 million features; amplifying a Golden Gate Bridge feature produced a model that steered every conversation toward the bridge. Google DeepMind released Gemma Scope (2024), open SAEs for Gemma models.

```viz
{"id":"neuron-vs-feature","component":"compare","title":"One neuron responds to unrelated things; one feature responds to one idea","caption":"Illustrative examples of what activates a single neuron and a single SAE feature. Hover the marks.","alt":"Comparison of the top activating examples of a polysemantic neuron and of a monosemantic sparse-autoencoder feature.","data":"illustrative","mono":false,"a":{"title":"A neuron (polysemantic)","text":"Top activations: academic citations, Korean text, HTTP request headers, the word “however” in legal documents.","mono":false},"b":{"title":"An SAE feature (monosemantic)","text":"Top activations: mentions of the Golden Gate Bridge in many languages, photos described in captions, and travel itineraries crossing it.","mono":false},"links":[{"a":"academic citations, Korean text, HTTP request headers","note":"Unrelated concepts share one neuron because of superposition."},{"b":"mentions of the Golden Gate Bridge in many languages","note":"A single concept, recognized across languages and contexts."}]}
```

**Circuits and attribution graphs.** Earlier work found specific mechanisms, such as induction heads that copy patterns from context (Olsson et al., 2022). Anthropic’s circuit-tracing work (2025) built attribution graphs showing how features in a production model combine across layers, for example planning rhymes ahead or performing multi-step reasoning internally.

**Other tools.** The logit lens and tuned lens read predictions from intermediate layers; probing classifiers test what information is present; activation patching tests which components cause a behavior; steering vectors add directions to activations to change behavior.

**Limits.** Features explain part of the activations; reconstructions are imperfect; labels come from human or model interpretation and can mislead; and the methods are expensive at frontier scale.

## In practice
For engineers today:
- Use open SAE releases and libraries to explore open models’ features for debugging and research.
- Treat steering as an experimental control method, evaluated like any other change.
- Read interpretability results in system cards as evidence about model behavior, with their stated limits.

## Numbers to know
> [!number]
> Rules of thumb. SAEs for large models have from thousands to many millions of features. A good SAE explains most, not all, of the variance in the activations it models.

## Pitfalls and anti-patterns
> [!pitfall] Trusting a feature’s label
> A feature named from its top examples may also fire on other things. Check activations on held-out data.

- **Causal claims from correlations.** Use patching or ablation to show a component matters.

## Talk like an expert
The vocabulary: **superposition**, **polysemantic**, **monosemantic feature**, **sparse autoencoder** or **dictionary learning**, **circuit**, **attribution graph**, **induction head**, **activation patching**, **steering vector**, **logit lens**. Experts separate “this feature correlates with X” from “this mechanism causes Y”. The live debate is whether interpretability can scale fast enough to verify the safety of frontier models.

> [!hottake] Interpretability will become a standard part of model evaluation within a few years.
> **The counterargument:** current methods explain only parts of small behaviors at high cost, and behavioral evaluations remain far cheaper and more complete for most practical questions.

## Check yourself
```quiz
mech-interp
```

## Go deeper
- Elhage et al., “Toy Models of Superposition” (2022).
- Templeton et al., “Scaling Monosemanticity” (Anthropic, 2024).
- Anthropic, “On the Biology of a Large Language Model” (2025), on circuit tracing.
- Olsson et al., “In-context Learning and Induction Heads” (2022).

## Related
- [Alignment concepts](#alignment-concepts)
- [The transformer block](#transformer-block)
- [Attention step by step](#attention)
- [Representation learning](#representation-learning)
- [Safety evals](#safety-evals)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Autoencoders and latent spaces](#autoencoders-latent-spaces)
- [Explaining model predictions](#model-interpretability)
- [In-context learning and example design](#in-context-learning)
- [Data selection and attribution](#data-selection-attribution)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Sparse autoencoders, transcoders and circuit tracing](#sae-circuit-tracing)
- [Probes, lenses and steering](#probes-and-steering)
