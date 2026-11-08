---
id: autoencoders-latent-spaces
book: 1
order: "1.6.3"
title: Autoencoders and latent spaces
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [autoencoders, latent-space, vq-vae, vector-quantization, compression]
visuals: []
prerequisites: [representation-learning, neural-networks]
---
> [!tldr]
> An autoencoder squeezes its input through a bottleneck, the latent code, and learns to reconstruct the input from it, so the code has to keep what matters. Today autoencoders often work as learned compressors inside larger systems: the latent space of image diffusion models, the discrete tokens of audio codecs and the feature dictionaries of interpretability. The one thing to remember is that compression and reconstruction fidelity trade off, and the right bottleneck depends on the model that has to work with the latents.

## Key ideas

- **Encoder, bottleneck, decoder.** An encoder f maps the input x to a code h and a decoder g maps h back to a reconstruction; a code smaller than the input (an undercomplete autoencoder) forces the network to keep the most salient features, and with a linear decoder and mean squared error it learns the same subspace as PCA, while a nonlinear encoder and decoder can learn a more powerful nonlinear generalization of PCA (Goodfellow, Bengio and Courville, [*Deep Learning*, chapter 14 “Autoencoders”](https://www.deeplearningbook.org/contents/autoencoders.html) (2016)).
- **Regularize the code instead of only shrinking it.** A denoising autoencoder reconstructs the clean input from a corrupted copy, and a sparse autoencoder adds a sparsity penalty on the code ([Goodfellow et al., 2016](https://www.deeplearningbook.org/contents/autoencoders.html)); in [mechanistic interpretability](#mech-interp), a sparse autoencoder trained on a model's activations can pull out interpretable features, as Bricken et al. did for a one-layer transformer (Bricken et al., [“Towards Monosemanticity: Decomposing Language Models With Dictionary Learning”](https://transformer-circuits.pub/2023/monosemantic-features/index.html) (2023)). MAE turns masking into pretraining at scale: it hides a high proportion of image patches, for example 75%, and learns to reconstruct the missing pixels (He et al., [“Masked Autoencoders Are Scalable Vision Learners”](https://arxiv.org/abs/2111.06377) (2021)).
- **VAEs make the latent a distribution.** A variational autoencoder trains an encoder that outputs an approximate posterior over continuous latents and uses a reparameterization of the variational lower bound so that it can be optimized with ordinary stochastic gradients (Kingma and Welling, [“Auto-Encoding Variational Bayes”](https://arxiv.org/abs/1312.6114) (2013)); [deep generative models](#deep-generative-models) covers VAEs in depth.
- **Vector quantization turns latents into tokens.** VQ-VAE replaces each encoder output with its nearest vector in a learned codebook, copies gradients past this non-differentiable lookup with a straight-through estimator, and adds a commitment loss so encoder outputs stay close to their codes (van den Oord et al., [“Neural Discrete Representation Learning”](https://arxiv.org/abs/1711.00937) (2017)). Residual vector quantization chains several quantizers, each coding what the previous ones left over; SoundStream uses it in a neural audio codec trained with reconstruction and adversarial losses, and dropout on quantizer layers lets one model run at bitrates from 3 to 18 kbps (Zeghidour et al., [“SoundStream: An End-to-End Neural Audio Codec”](https://arxiv.org/abs/2107.03312) (2021)). Codec design is covered in [neural audio codecs and audio tokens](#audio-codecs-tokens).
- **An autoencoder sits inside latent diffusion.** Latent diffusion first trains an autoencoder that downsamples images by a factor f, using a perceptual loss and a patch-based adversarial loss to avoid the blur of pure L1 or L2 pixel losses, plus either a slight KL penalty toward a standard normal or a vector-quantization layer in the decoder to avoid latent spaces with arbitrarily high variance; the diffusion model then runs in that smaller space (Rombach et al., [“High-Resolution Image Synthesis with Latent Diffusion Models”](https://arxiv.org/abs/2112.10752) (2021)).
- **Judge a latent space by what is built on it.** Rombach et al. report reconstruction FID and PSNR for their autoencoders, but they compare downsampling factors by the diffusion models trained on top: small factors (1 and 2) leave most of the perceptual compression to the diffusion model and train slowly, overly large ones lose information in the autoencoder and fidelity stagnates early, and factors of 4 to 16 struck a good balance between efficiency and faithful results in their experiments ([Rombach et al., 2021](https://arxiv.org/abs/2112.10752)).

## Planned visuals

- `diagram`: encoder, bottleneck and decoder as one picture, with variants to switch between: undercomplete, denoising, sparse, variational and vector-quantized, each showing what it adds to the bottleneck.
- `stepper`: residual vector quantization of one vector: the first codebook gives a coarse approximation, each further codebook codes the remaining residual, and the reconstruction error shrinks stage by stage.
- `chart`: the compression-fidelity trade-off in latent diffusion, sample quality against training progress for several downsampling factors, built from the figures Rombach et al. report, with source and date.

## Talk like an expert

Experts talk about the **bottleneck**, the **latent**, **reconstruction loss**, the **codebook**, **commitment loss**, the **straight-through estimator**, **RVQ** and the **downsampling factor**, and they treat an autoencoder as a learned compressor whose latents must stay faithful enough for the decoder and simple enough for whatever model works on them next.

## Go deeper

- Goodfellow, Bengio and Courville, [*Deep Learning*, chapter 14 “Autoencoders”](https://www.deeplearningbook.org/contents/autoencoders.html) (2016).
- van den Oord et al., [“Neural Discrete Representation Learning”](https://arxiv.org/abs/1711.00937) (2017).
- Zeghidour et al., [“SoundStream: An End-to-End Neural Audio Codec”](https://arxiv.org/abs/2107.03312) (2021).
- Rombach et al., [“High-Resolution Image Synthesis with Latent Diffusion Models”](https://arxiv.org/abs/2112.10752) (2021).

## Related

- [Representation learning and embeddings](#representation-learning)
- [Deep generative models: VAEs, GANs, flows and their successors](#deep-generative-models)
- [Image generation](#image-generation)
- [Speech and audio](#speech-audio)
- [Sparse autoencoders, transcoders and circuit tracing](#sae-circuit-tracing)
