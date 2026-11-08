---
id: probes-and-steering
book: 2
order: "2.10.2"
title: Probes, lenses and steering
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [probing, steering-vectors, logit-lens, activation-patching, interpretability]
visuals: []
prerequisites: [mech-interp]
---
> [!tldr]
> Probes, lenses and steering work directly on a model's activations: a linear probe tests whether a property can be read from a layer, the logit and tuned lenses read the model's running prediction at each layer, activation patching tests which parts cause a behavior, and a steering vector adds a direction to change it. They are cheap and work on any model whose activations you can access. Remember that decodable is not the same as used: pair every reading with a causal test, and evaluate every steering change like any other change to the model.

## Key ideas

- **A linear probe shows what is decodable, not what is used.** A probe is a linear classifier trained on frozen activations from one layer; Alain and Bengio found that linear separability rises monotonically with depth in Inception v3 and ResNet-50 (Alain and Bengio, [“Understanding intermediate layers using linear classifier probes”](https://arxiv.org/abs/1610.01644) (2016)). High probe accuracy shows a correlation, not that the model relies on the property: control tasks with random labels measure how much a probe memorizes, and removing a property from the representations does not always hurt the task (Belinkov, [“Probing Classifiers: Promises, Shortcomings, and Advances”](https://arxiv.org/abs/2102.12452) (2021)).
- **Difference-of-means directions make cheap monitors.** The mean activation difference between the two sides of a contrast pair gives a direction without any training; Anthropic built defection probes this way from one generic question (“Are you a helpful AI?” answered yes or no) on middle-layer residual stream activations, and reached an AUROC of 99.3% at detecting defection in one of its deliberately backdoored sleeper-agent models (MacDiarmid et al., [“Simple probes can catch sleeper agents”](https://www.anthropic.com/research/probes-catch-sleeper-agents) (2024)). The authors call these models intentionally created proxies and leave open whether the method works on naturally arising deception, so treat such probes as monitors to calibrate, not detectors to trust.
- **Lenses read the prediction layer by layer.** The logit lens applies the model's final output mapping to an intermediate layer's activations to see which tokens it already favors (nostalgebraist, [“interpreting GPT: the logit lens”](https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens) (2020)). The tuned lens trains a small affine translator for each layer and was more predictive, reliable and unbiased than the logit lens on models up to 20B parameters (Belrose et al., [“Eliciting Latent Predictions from Transformers with the Tuned Lens”](https://arxiv.org/abs/2303.08112) (2023)).
- **Activation patching is the causal test.** Run a clean prompt and a corrupted one that differs in one key property, copy activations from one run into the other and measure the change: denoising (clean into corrupted) finds components sufficient to restore the behavior, noising (corrupted into clean) finds necessary ones, the authors trust logit difference most among the metrics they compare, and path patching then tests whether components act on each other directly (Heimersheim and Nanda, [“How to use and interpret activation patching”](https://arxiv.org/abs/2404.15255) (2024)). [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) caches and hooks activations of many open models, and [nnsight](https://nnsight.net/) does the same for any PyTorch model and can run large models remotely on NDIF; [Neuronpedia](https://www.neuronpedia.org/) lets you steer models in the browser with SAE latents or custom vectors (all as of November 2026).
- **Steering vectors add a direction at inference time.** Activation addition (ActAdd) builds a vector from a single prompt pair such as “Love” and “Hate” (Turner et al., [“Steering Language Models With Activation Engineering”](https://arxiv.org/abs/2308.10248) (2023)), and contrastive activation addition (CAA) averages residual-stream differences over many contrast pairs and adds the result after the prompt with a signed coefficient (Panickssery et al., [“Steering Llama 2 via Contrastive Activation Addition”](https://arxiv.org/abs/2312.06681) (2023)). Representation engineering builds monitoring and control around population-level representations of concepts such as honesty and power-seeking (Zou et al., [“Representation Engineering: A Top-Down Approach to AI Transparency”](https://arxiv.org/abs/2310.01405) (2023)), and persona vectors extract trait directions such as sycophancy from a plain-language description to monitor deployments and flag training data (Chen et al., [“Persona Vectors: Monitoring and Controlling Character Traits in Language Models”](https://arxiv.org/abs/2507.21509) (2025)).
- **Steering cuts both ways, so evaluate it.** In 13 open chat models up to 72B parameters, one direction mediates refusal: ablating it stops refusals of harmful requests and adding it makes models refuse harmless ones. The authors turn this into a white-box jailbreak that disables refusal with minimal effect on other capabilities, and say their findings underscore “the brittleness of current safety fine-tuning methods” (Arditi et al., [“Refusal in Language Models Is Mediated by a Single Direction”](https://arxiv.org/abs/2406.11717) (2024)). Steerability is also highly variable across inputs, and for several concepts steering vectors are brittle to reasonable changes in the prompt (Tan et al., [“Analyzing the Generalization and Reliability of Steering Vectors”](https://arxiv.org/abs/2407.12404) (2024)), so measure a steering vector on held-out behavior, capability and safety evals before relying on it.

## Planned visuals

- **`stepper`:** activation patching on a clean and a corrupted prompt: run both, patch one layer's residual stream from clean into corrupted, measure how much logit difference returns, then narrow from layers to heads and finish with path patching.
- **`chart`:** logit lens against tuned lens, per layer, as the perplexity of each lens's predictions, built from the figures Belrose et al. report, with source and date.
- **`compare`:** the same prompt with steering coefficient 0 and with a positive coefficient, linked to an eval table taken from a published steering paper (with source) that shows the targeted behavior moving and the side effects on held-out tasks.

## Talk like an expert

Experts say **decodable versus used**, **selectivity**, **contrast pairs**, **difference of means**, **clean and corrupted runs**, **denoising and noising**, **logit difference** and **steering coefficient**. They treat a probe as a hypothesis, patching as the causal test, and a steering vector as a model change that needs its own evals.

## Go deeper

- Belinkov, [“Probing Classifiers: Promises, Shortcomings, and Advances”](https://arxiv.org/abs/2102.12452) (2021).
- Heimersheim and Nanda, [“How to use and interpret activation patching”](https://arxiv.org/abs/2404.15255) (2024).
- Panickssery et al., [“Steering Llama 2 via Contrastive Activation Addition”](https://arxiv.org/abs/2312.06681) (2023).
- Arditi et al., [“Refusal in Language Models Is Mediated by a Single Direction”](https://arxiv.org/abs/2406.11717) (2024).

## Related

- [Mechanistic interpretability](#mech-interp)
- [Sparse autoencoders, transcoders and circuit tracing](#sae-circuit-tracing)
- [How fine-tuning changes safety](#fine-tuning-and-safety)
- [Guardrails and control](#guardrails-control)
- [Jailbreaks and misuse](#jailbreaks-misuse)
- [Alignment concepts](#alignment-concepts)
