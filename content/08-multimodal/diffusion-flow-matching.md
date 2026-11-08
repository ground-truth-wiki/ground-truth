---
id: diffusion-flow-matching
book: 8
order: "8.3.1"
title: Diffusion and flow matching
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [diffusion, flow-matching, samplers, guidance, distillation]
visuals: []
prerequisites: [image-generation, probability-information, neural-networks]
---
> [!tldr]
> Diffusion models learn to undo a fixed noising process, and flow-matching models learn a velocity field that carries noise to data along a chosen path; both generate by integrating a learned field with a numerical solver. The practical knobs, which solver, how many steps, how much guidance and which latent space, all follow from that view. Remember that the sampler must match how the model was trained, and that few-step distilled models buy speed with some loss of diversity.

## Key ideas

- **Noise has a closed form; the network learns to remove it.** The forward process can jump straight to any step t, x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε, where ε is standard normal noise and ᾱ_t, the product of (1 − β_s) over the noise schedule up to step t, falls from near 1 toward 0, so DDPM trains a network to predict the added noise, with an objective its authors connect to denoising score matching (Ho et al., [“Denoising Diffusion Probabilistic Models”](https://arxiv.org/abs/2006.11239) (2020)). Song et al. generalize this to a forward SDE whose time reversal depends only on the score, the gradient of the log density, and derive a deterministic probability-flow ODE that samples from the same distribution and allows exact likelihoods (Song et al., [“Score-Based Generative Modeling through Stochastic Differential Equations”](https://arxiv.org/abs/2011.13456) (2020)).
- **Samplers are solvers, and they must match the model.** DDIM keeps DDPM's training objective but samples 10 to 50 times faster in wall-clock time (Song et al., [“Denoising Diffusion Implicit Models”](https://arxiv.org/abs/2010.02502) (2020)), and DPM-Solver++ stays stable under strong guidance, where earlier high-order solvers did not, and reaches good samples in about 15 to 20 steps (Lu et al., [“DPM-Solver++: Fast Solver for Guided Sampling of Diffusion Probabilistic Models”](https://arxiv.org/abs/2211.01095) (2022)). Whatever solver you pick needs the model's prediction type (noise, clean sample or velocity), noise schedule and timestep spacing ([Diffusers: DDPMScheduler](https://huggingface.co/docs/diffusers/api/schedulers/ddpm)), and names differ by tool: as of November 2026, the A1111 sampler “DPM++ 2M Karras” is Diffusers' `DPMSolverMultistepScheduler` with `use_karras_sigmas=True` ([Diffusers: Schedulers](https://huggingface.co/docs/diffusers/api/schedulers/overview)).
- **Guidance trades diversity for prompt fidelity, at twice the compute.** Classifier-free guidance trains one network with and without the condition and combines the two predictions as ε̃ = (1 + w) · ε(z, c) − w · ε(z), raising sample quality at the cost of diversity (Ho and Salimans, [“Classifier-Free Diffusion Guidance”](https://arxiv.org/abs/2207.12598) (2022)). Each step therefore runs the network twice, conditional and unconditional, and guidance distillation trains a single model to reproduce the combined output before distilling it to fewer steps (Meng et al., [“On Distillation of Guided Diffusion Models”](https://arxiv.org/abs/2210.03142) (2022)).
- **The latent space and the backbone set the cost.** Latent diffusion runs the process in a pretrained autoencoder's latent space with cross-attention for conditioning; downsampling factors of 4 to 16 balanced efficiency and fidelity, while a factor of 32 compressed too much and limited quality (Rombach et al., [“High-Resolution Image Synthesis with Latent Diffusion Models”](https://arxiv.org/abs/2112.10752) (2021)), and the channel count caps reconstruction too: SD3's move from 4 to 16 latent channels improved reconstruction FID from 2.41 to 1.06 (Esser et al., [“Scaling Rectified Flow Transformers for High-Resolution Image Synthesis”](https://arxiv.org/abs/2403.03206) (2024)). DiT replaced the U-Net with a transformer over latent patches whose FID improved consistently with forward-pass compute (Peebles and Xie, [“Scalable Diffusion Models with Transformers”](https://arxiv.org/abs/2212.09748) (2022)), and SD3's MMDiT gives image and text tokens separate weights with information flowing both ways, scaling predictably up to 8B parameters ([Esser et al., 2024](https://arxiv.org/abs/2403.03206)).
- **Flow matching and rectified flow regress a velocity.** Flow matching trains a continuous normalizing flow without simulation by regressing the vector field of a fixed conditional probability path, a family that includes diffusion paths, and its optimal-transport paths trained and sampled faster than diffusion paths (Lipman et al., [“Flow Matching for Generative Modeling”](https://arxiv.org/abs/2210.02747) (2022)). Rectified flow uses straight lines, X_t = t · X_1 + (1 − t) · X_0, regresses the velocity X_1 − X_0, and can retrain on its own generated pairs (“reflow”) so paths straighten and very few Euler steps suffice (Liu et al., [“Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow”](https://arxiv.org/abs/2209.03003) (2022)); SD3 trained it at scale with timesteps drawn from a logit-normal distribution that puts more weight on intermediate noise levels, which beat uniform timestep sampling ([Esser et al., 2024](https://arxiv.org/abs/2403.03206)).
- **Few-step generation trades diversity for speed.** Progressive distillation halves a deterministic sampler's steps each round, from as many as 8,192 down to 4, with the whole process costing no more than training the original model (Salimans and Ho, [“Progressive Distillation for Fast Sampling of Diffusion Models”](https://arxiv.org/abs/2202.00512) (2022)), and consistency models map noise to data in one step by design while still allowing multistep refinement (Song et al., [“Consistency Models”](https://arxiv.org/abs/2303.01469) (2023)). Adversarial diffusion distillation adds an adversarial loss to score distillation to sample in 1 to 4 steps, and its authors report that the gain in realism “comes at the cost of slightly decreased sample diversity” (Sauer et al., [“Adversarial Diffusion Distillation”](https://arxiv.org/abs/2311.17042) (2023)).

## Planned visuals

- **`stepper`:** forward noising in closed form beside reverse sampling, showing at each step how noise, clean-sample and velocity predictions convert into one another.
- **`compare`:** curved diffusion sampling trajectories beside straight rectified-flow paths after reflow, with the number of solver steps each needs, illustrative.
- **`calculator`:** a worked cost example: latent tokens = (height ÷ f) × (width ÷ f) ÷ p² for downsampling factor f and patch size p, and network evaluations = steps × 2 with classifier-free guidance or steps × 1 without it or after guidance distillation, with a test such as 1,024 × 1,024 pixels, f = 8 and p = 2 giving 4,096 tokens.

## Talk like an expert

Experts name a model by its prediction target and path (epsilon, v or flow), quote steps and guidance scale together because guidance doubles the work per step, and treat samplers as ODE or SDE solvers rather than presets. The same machinery generates audio and video as well as images ([Song et al., 2023](https://arxiv.org/abs/2303.01469)); see [video generation models](#video-generation) and [speech synthesis](#speech-synthesis).

## Go deeper

- Ho et al., [“Denoising Diffusion Probabilistic Models”](https://arxiv.org/abs/2006.11239) (2020).
- Song et al., [“Score-Based Generative Modeling through Stochastic Differential Equations”](https://arxiv.org/abs/2011.13456) (2020), for the SDE and ODE view that unifies samplers.
- Lipman et al., [“Flow Matching for Generative Modeling”](https://arxiv.org/abs/2210.02747) (2022).
- Esser et al., [“Scaling Rectified Flow Transformers for High-Resolution Image Synthesis”](https://arxiv.org/abs/2403.03206) (2024), for rectified flow and MMDiT at scale.

## Related

- [Image generation](#image-generation)
- [Image editing, control and personalization](#image-editing-control)
- [Video generation models](#video-generation)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
- [Probability, statistics and information theory](#probability-information)
- [Speech synthesis and voice cloning](#speech-synthesis)
