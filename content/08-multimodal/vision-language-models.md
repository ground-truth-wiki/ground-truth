---
id: vision-language-models
book: 8
order: "8.1"
title: Vision-language models
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [vlm, vision, vit]
visuals:
  - patch-tokens:stepper
  - image-token-calc:calculator
---
> [!tldr]
> Vision-language models read images by cutting them into patches, encoding the patches with a vision encoder, projecting them into the language model’s token space, and attending to them alongside text. Images cost tokens in proportion to their resolution; resolution, cropping and prompt placement decide what the model can see.

## Why it matters
Screenshots, documents, charts, photos and video frames are everyday inputs. Knowing how images become tokens explains costs, why small text gets missed, and how to prepare images for best results.

## Intuition
The model looks at an image the way you read a comic: panel by panel. Each patch becomes a token-like vector that the language model can “read” next to the words.

```viz
{"id":"patch-tokens","component":"stepper","title":"From pixels to tokens the language model can attend to","caption":"A simplified pipeline used by many vision-language models.","alt":"Stepper of a vision-language pipeline: resize, split into patches, vision encoder, projection and joint attention with text.","data":"illustrative","diagram":{"w":600,"h":70,"nodes":[{"id":"img","label":"Image","role":"data","x":0,"y":7,"w":90,"h":56},{"id":"patch","label":"Patches","role":"context","x":115,"y":7,"w":100,"h":56},{"id":"enc","label":"Vision encoder","role":"model","x":240,"y":7,"w":120,"h":56},{"id":"proj","label":"Projector","role":"tool","x":385,"y":7,"w":95,"h":56},{"id":"llm","label":"Language model","role":"model","x":505,"y":7,"w":95,"h":56}],"edges":[{"from":"img","to":"patch"},{"from":"patch","to":"enc"},{"from":"enc","to":"proj"},{"from":"proj","to":"llm"}]},
"frames":[
{"label":"Resize","highlight":["img"],"caption":"The image is resized or tiled to the model’s supported resolution; very large images are scaled down."},
{"label":"Patch","highlight":["patch"],"caption":"It is cut into small square patches, for example 14 or 16 pixels on a side."},
{"label":"Encode","highlight":["enc"],"caption":"A vision transformer, often initialized from a contrastive model such as CLIP or SigLIP, turns patches into vectors."},
{"label":"Project","highlight":["proj"],"caption":"A projector maps those vectors into the language model’s embedding space, sometimes compressing several patches into one token."},
{"label":"Attend","highlight":["llm"],"caption":"Image tokens sit in the context with the text, and the model attends to both when answering."}]}
```

## How it works
**Architecture.** A vision encoder (a vision transformer), a projector and a language model, trained first to align images with text and then on instruction data. Natively multimodal models train on mixed image and text data from early on.

**Resolution and tokens.** More pixels mean more patches, more tokens, more cost and better detail. Providers publish formulas; Anthropic’s documentation, for example, counts one image token per 28 × 28 pixel patch, ⌈width ÷ 28⌉ × ⌈height ÷ 28⌉, after downscaling images beyond the model’s limits (as of November 2026):

```viz
{"id":"image-token-calc","component":"calculator","title":"A 1,000 × 1,000 pixel image costs about 1,300 tokens under one provider’s formula","caption":"Uses Anthropic’s published rule as of November 2026 (one token per 28 × 28 pixel patch, after downscaling to the model’s limits); other providers count differently. Check your provider’s documentation.","alt":"Calculator estimating image tokens from width and height, and the cost of a batch of images.","data":"formula","outputs":[{"id":"tokens","label":"Tokens per image","expr":"ceil(width / 28) * ceil(height / 28)","unit":"count","main":true},{"id":"batch_cost","label":"Input cost for the batch","expr":"tokens * images * price / 1000000","unit":"usd"}],"inputs":{"width":1000,"height":1000,"images":1000,"price":3},"input_meta":{"width":{"label":"Width","unit":"pixels, after any resizing"},"height":{"label":"Height","unit":"pixels"},"images":{"label":"Number of images"},"price":{"label":"Input price","unit":"$ per million, illustrative"}},"assumptions":["One provider’s rule; images beyond the model’s limits are downscaled first, which caps the count at 1,568 tokens (1,568 px long edge) or, on Claude 4.7 and later models, 4,784 tokens (2,576 px)."],"tests":[{"inputs":{},"expect":{"tokens":1296,"batch_cost":3.888},"tol":0.0001},{"inputs":{"width":750},"expect":{"tokens":972},"tol":0.0001}]}
```

**What they do well and badly.** Strong at describing scenes, reading clear text, understanding charts and screenshots; weaker at counting, precise spatial relations, tiny text and exact measurements. See [document understanding](#document-screen-understanding).

**Video.** Usually handled as sampled frames, sometimes with audio transcripts; see [video and world models](#video-world-models).

## In practice
- Crop to the region that matters instead of sending huge screenshots.
- Keep text in images large enough to read after resizing.
- Put the image before the question, and ask the model to quote what it reads for checking.
- Verify numbers read from images.

## Numbers to know
> [!number]
> Rules of thumb. An image typically costs hundreds to a few thousand tokens. Patch sizes of 14 to 16 pixels are common in vision transformers.

## Pitfalls and anti-patterns
> [!pitfall] Sending full-resolution screenshots when a crop would do
> Costs rise, and downscaling can make the important text unreadable.

- **Trusting counts and measurements.** Verify them.

## Talk like an expert
The vocabulary: **vision encoder**, **ViT**, **patch**, **projector**, **image tokens**, **native multimodality**, **CLIP**, **SigLIP**, **resolution tiling**. Experts budget image tokens and crop deliberately. The live debate is how far native multimodal training improves fine-grained visual reasoning.

> [!hottake] Most vision-model failures in production are image-preparation failures.
> **The counterargument:** models still genuinely struggle with counting, spatial reasoning and dense charts, which no preprocessing fully fixes.

## Check yourself
```quiz
vision-language-models
```

## Go deeper
- Dosovitskiy et al., “An Image is Worth 16x16 Words” (2020), the ViT paper.
- Liu et al., “Visual Instruction Tuning” (2023), the LLaVA paper.

## Related
- [Document and screen understanding](#document-screen-understanding)
- [Multimodal RAG](#multimodal-rag)
- [Representation learning](#representation-learning)
- [Computer-use and browser agents](#computer-use-agents)
- [Multimodal applications](#multimodal-apps)
- [Convolutional neural networks](#convolutional-networks)
- [Self-supervised learning methods](#self-supervised-methods)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
- [Visual grounding, detection and segmentation](#visual-grounding)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Vision-language-action models, robot data and sim-to-real](#vla-models)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Vision-language model architectures and training](#vlm-architectures)
- [Video understanding](#video-understanding)
