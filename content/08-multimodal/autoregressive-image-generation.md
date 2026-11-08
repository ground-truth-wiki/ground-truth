---
id: autoregressive-image-generation
book: 8
order: "8.3.3"
title: Visual tokenizers and autoregressive image generation
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [visual-tokenizers, vq-vae, autoregressive-generation, unified-models, image-generation]
visuals: []
prerequisites: [image-generation, tokenization]
---
> [!tldr]
> A visual tokenizer compresses an image into a short grid of discrete codes, so a transformer can generate pictures the way a language model writes text: one token, one batch of tokens or one resolution at a time. The same idea lets one model read and generate both text and images, and OpenAI describes the native image generation in GPT-4o as autoregressive. Remember that the tokenizer sets the ceiling: a generator can never produce detail that its decoder cannot reconstruct.

## Key ideas

- **Tokenizers make images short enough to model.** VQ-VAE encodes an image into a grid of vectors, replaces each vector with its nearest entry in a learned codebook, and trains a decoder to rebuild the image; in the paper a 128×128 image becomes a 32×32 grid of codes from a codebook of 512, and a PixelCNN trained over those codes generates new images (van den Oord et al., [“Neural Discrete Representation Learning”](https://arxiv.org/abs/1711.00937) (2017)).
- **Compression trades against reconstruction.** VQGAN replaces the pixel-wise L2 loss with a perceptual loss and a patch-based adversarial discriminator, so codes stay perceptually faithful at higher compression; its authors show that a larger downsampling factor makes the sequence easier for the transformer, but beyond a critical factor (16 in their face experiments) reconstructions break down and cap sample quality (Esser et al., [“Taming Transformers for High-Resolution Image Synthesis”](https://arxiv.org/abs/2012.09841) (2020)). Unused codes are wasted capacity, so tokenizer papers report codebook usage, such as 97% for LlamaGen's tokenizer at a downsampling ratio of 16 (Sun et al., [“Autoregressive Model Beats Diffusion: Llama for Scalable Image Generation”](https://arxiv.org/abs/2406.06525) (2024)).
- **Three orders for generating the tokens.** Raster order predicts one token at a time, row by row; Parti treats text-to-image as sequence-to-sequence translation into ViT-VQGAN tokens and scales it to 20B parameters (Yu et al., [“Scaling Autoregressive Models for Content-Rich Text-to-Image Generation”](https://arxiv.org/abs/2206.10789) (2022)). MaskGIT predicts all masked tokens in parallel and keeps the most confident ones, finishing an image in 8 steps instead of 256 (Chang et al., [“MaskGIT: Masked Generative Image Transformer”](https://arxiv.org/abs/2202.04200) (2022)), Muse applies this to text-to-image (Chang et al., [“Muse: Text-To-Image Generation via Masked Generative Transformers”](https://arxiv.org/abs/2301.00704) (2023)), and VAR predicts whole token maps from coarse to fine scale, which its authors report beats a diffusion transformer on ImageNet 256×256 in quality and speed (Tian et al., [“Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction”](https://arxiv.org/abs/2404.02905) (2024)).
- **Unified models read and write images in one sequence.** Chameleon is early fusion: it turns a 512×512 image into 1,024 tokens from a codebook of 8,192 that share one vocabulary with text, and its authors name reconstructing text-heavy images as the tokenizer's core weakness (Chameleon Team, [“Chameleon: Mixed-Modal Early-Fusion Foundation Models”](https://arxiv.org/abs/2405.09818) (2024)). Transfusion keeps images continuous and trains one transformer with next-token loss on text and diffusion loss on image patches, which it reports scales significantly better than quantizing images (Zhou et al., [“Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model”](https://arxiv.org/abs/2408.11039) (2024)), while Janus uses separate visual encoders for understanding and generation because the two tasks need different granularity (Wu et al., [“Janus: Decoupling Visual Encoding for Unified Multimodal Understanding and Generation”](https://arxiv.org/abs/2410.13848) (2024)).
- **Native image generation in chat models, as dated examples.** OpenAI's March 2025 system card addendum describes 4o image generation as “an autoregressive model natively embedded within ChatGPT,” unlike the diffusion-based DALL·E, and says this difference brings new capabilities: transforming input images, photorealism, and following detailed instructions, including rendering text (OpenAI, [“Addendum to GPT-4o System Card: Native image generation”](https://cdn.openai.com/11998be9-5319-4302-bfbf-1167e093f1fb/Native_Image_Generation_System_Card.pdf) (2025)). The same month, Google presented native image generation in Gemini 2.0 Flash with multi-turn conversational editing, world knowledge and stronger rendering of long text ([Google Developers Blog, March 2025](https://developers.googleblog.com/en/experiment-with-gemini-20-flash-native-image-generation/)).
- **Trade-offs against diffusion, and the step to video.** Token models can reuse language-model serving: LlamaGen reports 326% to 414% inference speedups from LLM serving frameworks ([Sun et al., 2024](https://arxiv.org/abs/2406.06525)), but raster decoding still needs one step per token, which is what parallel and next-scale decoding try to cut. MAGVIT-v2 extends tokenizers to time with one vocabulary for images and videos, and its authors report language models beating diffusion models on ImageNet and Kinetics (Yu et al., [“Language Model Beats Diffusion -- Tokenizer is Key to Visual Generation”](https://arxiv.org/abs/2310.05737) (2023)).

## Planned visuals

- `calculator`: tokens per image from resolution and downsampling factor, (H/f) × (W/f), next to the decoding steps that raster order, masked parallel decoding and next-scale prediction need for that grid.
- `compare`: raster order, MaskGIT-style masked decoding and VAR-style next-scale prediction filling the same 16×16 token grid, step by step, with the number of forward passes for each.
- `diagram`: three designs for unified models: early fusion over discrete tokens (Chameleon), next-token plus diffusion losses (Transfusion) and decoupled visual encoders (Janus), each linked to its paper.

## Talk like an expert

Experts talk about codebooks and codebook usage, the downsampling factor, reconstruction FID (rFID), raster order, masked token modeling, next-scale prediction and early fusion. They judge a tokenizer by its reconstructions before its generator, and frame the field as discrete tokens against continuous latents.

## Go deeper

- van den Oord et al., [“Neural Discrete Representation Learning”](https://arxiv.org/abs/1711.00937) (2017).
- Esser et al., [“Taming Transformers for High-Resolution Image Synthesis”](https://arxiv.org/abs/2012.09841) (2020).
- Tian et al., [“Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction”](https://arxiv.org/abs/2404.02905) (2024).
- Zhou et al., [“Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model”](https://arxiv.org/abs/2408.11039) (2024).

## Related

- [Image generation](#image-generation)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [Vision-language model architectures and training](#vlm-architectures)
- [Tokenization](#tokenization)
- [Neural audio codecs and audio tokens](#audio-codecs-tokens)
- [Video generation models](#video-generation)
