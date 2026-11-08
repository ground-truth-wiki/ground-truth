---
id: vlm-architectures
book: 8
order: "8.1.1"
title: Vision-language model architectures and training
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [vision-language-models, vision-encoders, connectors, dynamic-resolution, multimodal-training]
visuals: []
prerequisites: [vision-language-models, transformer-block]
---
> [!tldr]
> A typical open vision-language model joins a pretrained vision encoder to a pretrained language model through a small connector, then trains in stages: alignment, image-text pretraining, visual instruction tuning and sometimes preference tuning against hallucination. Three choices shape what it can see: the encoder and how it was pretrained, how many visual tokens the connector passes on, and how image resolution turns into tokens. Remember that many VLM failures, from unread small print to invented objects, trace back to these choices and to the training data, not only to the language model.

## Key ideas

- **An encoder inherits its pretraining.** CLIP learned from 400 million image-text pairs by predicting which caption goes with which image (Radford et al., [“Learning Transferable Visual Models From Natural Language Supervision”](https://arxiv.org/abs/2103.00020) (2021)), and SigLIP replaced its batch-wide softmax with a pairwise sigmoid loss that needs no global normalization (Zhai et al., [“Sigmoid Loss for Language Image Pre-Training”](https://arxiv.org/abs/2303.15343) (2023)). Self-supervised signals add spatial detail: SigLIP 2 added captioning, self-distillation and masked prediction and reports significant gains on localization and dense prediction (Tschannen et al., [“SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features”](https://arxiv.org/abs/2502.14786) (2025)), and DINOv2, trained without any text, beat OpenCLIP on most image-level and pixel-level benchmarks (Oquab et al., [“DINOv2: Learning Robust Visual Features without Supervision”](https://arxiv.org/abs/2304.07193) (2023)).
- **The connector decides what the language model receives.** LLaVA-1.5 showed that a plain MLP projecting CLIP ViT-L features at 336 pixels is a strong, data-efficient connector (Liu et al., [“Improved Baselines with Visual Instruction Tuning”](https://arxiv.org/abs/2310.03744) (2023)); BLIP-2's Q-Former, a lightweight querying transformer, bridges a frozen image encoder and a frozen LLM (Li et al., [“BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models”](https://arxiv.org/abs/2301.12597) (2023)); and Flamingo's Perceiver Resampler turns any number of image features into 64 visual tokens, read by new cross-attention layers whose output is scaled by tanh(α), with α starting at 0 so the frozen language model is unchanged at initialization (Alayrac et al., [“Flamingo: a Visual Language Model for Few-Shot Learning”](https://arxiv.org/abs/2204.14198) (2022)). In Idefics2's ablations, learned pooling cut visual tokens per image from 729 to 64 while raising average scores, more than 64 tokens brought no gains, and cross-attention beat the fully autoregressive design only while both backbones stayed frozen (Laurençon et al., [“What matters when building vision-language models?”](https://arxiv.org/abs/2405.02246) (2024)).
- **Late fusion, early fusion and shared positions.** The designs above join separately pretrained parts (often called late fusion), while Chameleon is an early-fusion, token-based model trained on images and text in any order from the start (Chameleon Team, [“Chameleon: Mixed-Modal Early-Fusion Foundation Models”](https://arxiv.org/abs/2405.09818) (2024)). Positions must span both modalities: Qwen2-VL replaced its ViT's absolute position embeddings with 2D-RoPE and splits the language model's rotary embedding into temporal, height and width components (M-RoPE), with text using the same ID in all three (Wang et al., [“Qwen2-VL: Enhancing Vision-Language Model's Perception of the World at Any Resolution”](https://arxiv.org/abs/2409.12191) (2024)).
- **Resolution handling sets the cost and what small text survives.** Tiling cuts a large image into fixed squares plus a thumbnail of the whole: InternVL 1.5 uses tiles of 448 × 448 pixels at 256 tokens each, 1 to 12 tiles in training and up to 40 at test time, so with the thumbnail its largest inputs cost 41 × 256 = 10,496 visual tokens (Chen et al., [“How Far Are We to GPT-4V? Closing the Gap to Commercial Multimodal Models with Open-Source Suites”](https://arxiv.org/abs/2404.16821) (2024)), and Idefics2 found that splitting (320 tokens per image instead of 64) helps most on text-reading tasks such as TextVQA and DocVQA ([Laurençon et al., 2024](https://arxiv.org/abs/2405.02246)). Native dynamic resolution lets the token count follow the image: Qwen2-VL encodes 14-pixel patches and merges each 2 × 2 group into one token, so a 224 × 224 image enters the language model as 66 tokens and larger images get more ([Wang et al., 2024](https://arxiv.org/abs/2409.12191)).
- **Training runs in stages, and the data is the contested part.** BLIP-2 pretrains in two stages, representation learning and then generation through a frozen LLM ([Li et al., 2023](https://arxiv.org/abs/2301.12597)); Flamingo trains on web data with interleaved images and text, which gives it in-context few-shot learning ([Alayrac et al., 2022](https://arxiv.org/abs/2204.14198)); and LLaVA's visual instruction tuning used language-only GPT-4 to write its multimodal instruction data (Liu et al., [“Visual Instruction Tuning”](https://arxiv.org/abs/2304.08485) (2023)). Molmo's authors note that the strongest open-weight VLMs rely heavily on synthetic data from proprietary VLMs, which in effect distills closed models into open ones, and they collected their PixMo datasets without any external VLM (Deitke et al., [“Molmo and PixMo: Open Weights and Open Data for State-of-the-Art Vision-Language Models”](https://arxiv.org/abs/2409.17146) (2024)).
- **Hallucination has known triggers, and preference tuning targets it.** VLMs tend to hallucinate objects that appear often in visual instruction data or that co-occur with objects in the image, which the POPE benchmark probes with polling questions (Li et al., [“Evaluating Object Hallucination in Large Vision-Language Models”](https://arxiv.org/abs/2305.10355) (2023)). RLHF-V applied dense direct preference optimization to 1.4k human corrections of hallucinated segments and cut its base model's hallucination rate by 34.8% (Yu et al., [“RLHF-V: Towards Trustworthy MLLMs via Behavior Alignment from Fine-grained Correctional Human Feedback”](https://arxiv.org/abs/2312.00849) (2023)).

## Planned visuals

- **`diagram` (with variants):** four ways to connect a vision encoder to a language model: an MLP projector (LLaVA-1.5), a Q-Former (BLIP-2), a Perceiver Resampler with gated cross-attention (Flamingo) and early fusion (Chameleon), showing what is frozen, where visual tokens enter and how many there are.
- **`calculator`:** visual tokens and input cost per image under fixed resizing, tiling with a thumbnail and native dynamic resolution, with tests that reproduce InternVL 1.5's 256 tokens per tile and Qwen2-VL's published 66 tokens for a 224 × 224 image.
- **`stepper`:** the training stages from connector alignment through interleaved pretraining, visual instruction tuning and preference tuning, showing at each step which parts are frozen and which data is used.

## Talk like an expert

Experts describe a VLM as encoder, connector and LLM, quote visual tokens per image or per tile, and check whether the encoder uses register tokens, the extra tokens that absorb the high-norm artifacts ViTs otherwise leave in background patches (Darcet et al., [“Vision Transformers Need Registers”](https://arxiv.org/abs/2309.16588) (2023)). They also know where capacity pays: for a fixed parameter count, Idefics2's ablations found the language backbone's quality mattered more than the vision backbone's ([Laurençon et al., 2024](https://arxiv.org/abs/2405.02246)).

## Go deeper

- Laurençon et al., [“What matters when building vision-language models?”](https://arxiv.org/abs/2405.02246) (2024), the most systematic set of VLM design ablations.
- Li et al., [“BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models”](https://arxiv.org/abs/2301.12597) (2023).
- Wang et al., [“Qwen2-VL: Enhancing Vision-Language Model's Perception of the World at Any Resolution”](https://arxiv.org/abs/2409.12191) (2024), for native dynamic resolution and M-RoPE.
- Deitke et al., [“Molmo and PixMo: Open Weights and Open Data for State-of-the-Art Vision-Language Models”](https://arxiv.org/abs/2409.17146) (2024), for an open-data recipe.

## Related

- [Vision-language models](#vision-language-models)
- [Representation learning and embeddings](#representation-learning)
- [Embeddings and position](#positional-encoding)
- [Video understanding](#video-understanding)
- [Visual grounding, detection and segmentation](#visual-grounding)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
