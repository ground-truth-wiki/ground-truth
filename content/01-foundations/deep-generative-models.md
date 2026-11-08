---
id: deep-generative-models
book: 1
order: "1.12"
title: "Deep generative models: VAEs, GANs, flows and their successors"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [generative-models, vae, gan, normalizing-flows, diffusion]
visuals: []
prerequisites: [neural-networks, probability-information]
---
> [!tldr]
> A generative model learns a data distribution, p(x) or a conditional p(x | c), so it can produce new samples that look like the training data. The classic families (autoregressive models, variational autoencoders, GANs and normalizing flows) differ in how they handle the likelihood, and that choice sets their trade-offs in sample quality, diversity, likelihood and sampling speed. Diffusion models have since taken a central role, but the older families live on inside them as latent spaces, losses and samplers.

## Key ideas

- **Explicit or implicit density.** Some models define a density you can evaluate, either exactly (autoregressive models and change-of-variables models) or only approximately (variational autoencoders, and Boltzmann machines, which rely on Markov chains and were already used only very rarely by 2016), while GANs define it only implicitly, through a sampler (Goodfellow, [“NIPS 2016 Tutorial: Generative Adversarial Networks”](https://arxiv.org/abs/1701.00160) (2016)). Autoregressive models factor p(x) by the chain rule into one-dimensional conditionals, as PixelRNN does pixel by pixel (van den Oord et al., [“Pixel Recurrent Neural Networks”](https://arxiv.org/abs/1601.06759) (2016)) and a [language model](#language-modeling) does token by token, and the price is that samples are generated one entry at a time, in steps that cannot be parallelized ([Goodfellow, tutorial](https://arxiv.org/abs/1701.00160)).
- **VAEs optimize a lower bound.** A variational autoencoder fits a recognition model (the encoder) to the intractable posterior over latent variables, and reparameterizing the variational lower bound, the ELBO, makes it trainable with standard stochastic gradients (Kingma and Welling, [“Auto-Encoding Variational Bayes”](https://arxiv.org/abs/1312.6114) (2013)). Variational methods often reach very good likelihoods but are regarded as producing lower-quality samples, which Goodfellow calls "a subjective opinion, not an empirical fact" ([Goodfellow, tutorial](https://arxiv.org/abs/1701.00160)).
- **GANs play a two-player game.** A generator learns to fool a discriminator that estimates whether a sample came from the data, and at the game's unique ideal solution the generator recovers the data distribution and the discriminator outputs 1/2 everywhere (Goodfellow et al., [“Generative Adversarial Networks”](https://arxiv.org/abs/1406.2661) (2014)). In practice training often oscillates instead of converging and partial mode collapse is common ([Goodfellow, tutorial](https://arxiv.org/abs/1701.00160)), which later work attacked from several sides: convolutional DCGANs (Radford et al., [“Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks”](https://arxiv.org/abs/1511.06434) (2015)), the more stable Wasserstein GAN (Arjovsky et al., [“Wasserstein GAN”](https://arxiv.org/abs/1701.07875) (2017)) and StyleGAN's generator built around an intermediate latent space (Karras et al., [“A Style-Based Generator Architecture for Generative Adversarial Networks”](https://arxiv.org/abs/1812.04948) (2018)).
- **Flows are invertible maps with an exact likelihood.** A normalizing flow pushes a simple base distribution through a series of bijective transformations, and coupling layers, as used in Real NVP and Glow, are equally fast to evaluate and to invert, so both density evaluation and sampling are fast (Papamakarios et al., [“Normalizing Flows for Probabilistic Modeling and Inference”](https://arxiv.org/abs/1912.02762) (2019)). Flow matching builds on continuous normalizing flows: it trains them without simulation, by regressing vector fields of fixed conditional probability paths, a family that includes diffusion paths as special cases (Lipman et al., [“Flow Matching for Generative Modeling”](https://arxiv.org/abs/2210.02747) (2022)).
- **Measuring sample quality and likelihood.** The Fréchet Inception Distance (FID) fits Gaussians to Inception-network features of real and generated images and measures the distance between them, and it was introduced as capturing similarity to real images better than the Inception Score (Heusel et al., [“GANs Trained by a Two Time-Scale Update Rule Converge to a Local Nash Equilibrium”](https://arxiv.org/abs/1706.08500) (2017)). Likelihood models report negative log-likelihood in bits per dimension, the total divided by the number of values (3,072 for a 32 × 32 color image), readable as the bits per value a compressor built on the model would need (van den Oord et al., [“Pixel Recurrent Neural Networks”](https://arxiv.org/abs/1601.06759) (2016)).
- **The older families live on inside today's models.** Latent diffusion, covered with its successors in [diffusion and flow matching](#diffusion-flow-matching), runs in the latent space of an autoencoder trained with a perceptual loss and a patch-based adversarial objective to avoid blurry reconstructions, in one variant with a slight VAE-like KL penalty (Rombach et al., [“High-Resolution Image Synthesis with Latent Diffusion Models”](https://arxiv.org/abs/2112.10752) (2021)). Diffusion models have taken a central role in generative modeling but need many sampling steps, and adversarial diffusion distillation adds a GAN-style loss to score distillation so a large diffusion model can sample in 1 to 4 steps (Sauer et al., [“Adversarial Diffusion Distillation”](https://arxiv.org/abs/2311.17042) (2023)).

## Planned visuals

- `tree`: the family tree of generative models by how they treat the likelihood: explicit and tractable (autoregressive models, flows), explicit and approximate (VAEs, Boltzmann machines) and implicit (GANs), with diffusion and flow matching as descendants, each leaf linked to its chapter.
- `stepper`: a GAN learning a two-dimensional mixture of Gaussians, frame by frame, once covering all the modes and once collapsing onto one mode at a time, after Figure 22 of Goodfellow's tutorial.
- `diagram`: a VAE end to end: encoder, mean and variance, the reparameterized sample, decoder, and the two terms of the ELBO (reconstruction and the KL term).

## Talk like an expert

Experts sort generative models by their likelihood: exact (autoregressive models, flows), bounded (the VAE's ELBO) or absent (GANs). They say "ELBO", "reparameterization trick", "mode collapse", "coupling layer" and "bits per dimension", and they ask which family's ideas a modern system reuses for its latent space, its losses and its sampler.

## Go deeper

- Goodfellow, [“NIPS 2016 Tutorial: Generative Adversarial Networks”](https://arxiv.org/abs/1701.00160) (2016).
- Kingma and Welling, [“Auto-Encoding Variational Bayes”](https://arxiv.org/abs/1312.6114) (2013).
- Papamakarios et al., [“Normalizing Flows for Probabilistic Modeling and Inference”](https://arxiv.org/abs/1912.02762) (2019).
- Lipman et al., [“Flow Matching for Generative Modeling”](https://arxiv.org/abs/2210.02747) (2022).

## Related

- [Image generation](#image-generation)
- [Autoencoders and latent spaces](#autoencoders-latent-spaces)
- [Representation learning and embeddings](#representation-learning)
- [Video, 3D and world models](#video-world-models)
- [Speech and audio](#speech-audio)
