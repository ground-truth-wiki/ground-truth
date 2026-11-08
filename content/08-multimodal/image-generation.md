---
id: image-generation
book: 8
order: "8.3"
title: Image generation
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [diffusion, image-generation, flow-matching]
visuals:
  - diffusion-stepper:stepper
  - image-model-tree:tree
---
> [!tldr]
> Image generators turn text (and images) into pictures, mostly with diffusion or flow-matching models that start from noise and refine it step by step, guided by the prompt. Autoregressive image generation inside multimodal models has become competitive. Editing, consistency, text rendering and provenance labeling are the practical frontiers.

## Why it matters
Image generation is a mainstream product feature: marketing assets, design mockups, illustrations, product photos and editing. Engineers integrating it need to understand quality knobs, cost, safety filters, rights questions and labeling requirements.

## Intuition
Diffusion is sculpting from a block of static. The model has learned how to remove a little noise at a time so that what remains looks more like the description, until a clear picture emerges.

```viz
{"id":"diffusion-stepper","component":"stepper","title":"From pure noise to an image in a few dozen denoising steps","caption":"A conceptual walk through text-to-image diffusion. Each step predicts and removes some noise, guided by the text embedding.","alt":"Stepper of a diffusion process from random noise through progressively clearer images to a final picture.","data":"illustrative","frames":[
{"label":"Encode prompt","caption":"The prompt “a lighthouse at dusk, watercolor” is encoded by a text encoder into conditioning vectors."},
{"label":"Noise","caption":"Generation starts from random noise in a compressed latent space."},
{"label":"Early steps","caption":"Large-scale structure appears first: a tall shape against a darker sky."},
{"label":"Middle steps","caption":"Shapes and colors firm up; guidance pushes the result toward the prompt and away from an unconditioned image."},
{"label":"Late steps","caption":"Fine detail and texture, such as brush strokes, are added."},
{"label":"Decode","caption":"A decoder turns the final latent into pixels. Provenance metadata or a watermark can be attached here."}]}
```

## How it works
**Diffusion and flow matching.** Models learn to reverse a noising process (Ho et al., 2020, DDPM); latent diffusion works in a compressed space for efficiency (Rombach et al., 2022, the basis of Stable Diffusion). Flow-matching and rectified-flow models learn straighter paths from noise to image and need fewer steps.

**Guidance.** Classifier-free guidance strengthens the influence of the prompt at the cost of diversity; the guidance scale is a key knob.

**Architectures.** Diffusion transformers (DiT) replaced U-Nets in many recent models. Natively multimodal models can also generate images token by token, which helps with following complex instructions and editing within a conversation.

```viz
{"id":"image-model-tree","component":"tree","title":"Three ways models make images, and what each is good at","caption":"Expand a family. Products often combine them.","alt":"Tree of image generation approaches: latent diffusion, flow matching and diffusion transformers, and autoregressive multimodal generation.","data":"illustrative","open":1,"root":{"label":"Image generation approaches","children":[
{"label":"Latent diffusion","children":[{"label":"Stable Diffusion family and many others: fast, controllable, rich open ecosystem"}]},
{"label":"Flow matching and diffusion transformers","children":[{"label":"Fewer steps, strong prompt following; used in many recent models"}]},
{"label":"Autoregressive multimodal","children":[{"label":"Images generated inside a multimodal model: strong instruction following and conversational editing","link":"#vision-language-models"}]}]}}
```

**Control and editing.** Image-to-image, inpainting, outpainting, reference images for style or identity, and structural controls (pose, edges, depth) such as ControlNet.

**Safety, rights and provenance.** Filters block disallowed content; training-data rights are contested in courts; C2PA content credentials and watermarks such as SynthID label generated images. See [responsible AI](#responsible-ai).

## In practice
- Write prompts that specify subject, composition, style, lighting and text to render; iterate with seeds fixed.
- Use editing rather than regenerating for small changes.
- Label generated images and keep provenance metadata where your platform supports it.
- Review outputs for brand, rights and safety before publishing.

## Numbers to know
> [!number]
> Rules of thumb. Diffusion models typically use tens of denoising steps; distilled and flow-matching models can use a handful. Generation takes seconds per image on modern GPUs.

## Pitfalls and anti-patterns
> [!pitfall] Publishing generated images without review
> Artifacts, wrong text, likeness or trademark issues and policy violations are easy to miss at a glance.

## Talk like an expert
The vocabulary: **diffusion**, **latent diffusion**, **denoising steps**, **classifier-free guidance**, **flow matching**, **diffusion transformer**, **inpainting**, **ControlNet**, **content credentials**. Experts tune guidance and steps per use case and keep provenance. The live debate is about rights to training data and how to compensate creators.

> [!hottake] Image generation is becoming a feature of general multimodal models rather than a separate product category.
> **The counterargument:** specialized image models still lead on control, speed, cost and quality for professional workflows.

## Check yourself
```quiz
image-generation
```

## Go deeper
- Ho, Jain and Abbeel, “Denoising Diffusion Probabilistic Models” (2020).
- Rombach et al., “High-Resolution Image Synthesis with Latent Diffusion Models” (2022).
- Peebles and Xie, “Scalable Diffusion Models with Transformers” (2022).

## Related
- [Video, 3D and world models](#video-world-models)
- [Vision-language models](#vision-language-models)
- [Multimodal applications](#multimodal-apps)
- [Responsible AI in practice](#responsible-ai)
- [Beyond the transformer](#beyond-transformers)
- [Convolutional neural networks](#convolutional-networks)
- [Autoencoders and latent spaces](#autoencoders-latent-spaces)
- [Deep generative models: VAEs, GANs, flows and their successors](#deep-generative-models)
- [Video generation models](#video-generation)
- [Music and sound generation](#music-generation)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Diffusion and flow matching](#diffusion-flow-matching)
- [Image editing, control and personalization](#image-editing-control)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
