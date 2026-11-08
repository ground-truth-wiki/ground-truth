---
id: image-editing-control
book: 8
order: "8.3.2"
title: Image editing, control and personalization
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [image-editing, inpainting, controlnet, personalization, lora]
visuals: []
prerequisites: [image-generation]
---
> [!tldr]
> Image editing reuses a generator's denoising machinery: partly noise an image and denoise it toward a new prompt, repaint only a masked region, condition on structure maps or reference images, or train small additions that teach the model a new subject or style. Editing methods trade faithfulness to the source against the size of the change. Remember to label edited images, and to treat personalization on real people as a consent question, not only a technical one.

## Key ideas

- **Image-to-image is partial noising.** SDEdit adds noise to a guide image, such as a rough stroke drawing, and denoises it with a diffusion prior, so the amount of noise sets the balance between realism and faithfulness, with no task-specific training (Meng et al., [“SDEdit: Guided Image Synthesis and Editing with Stochastic Differential Equations”](https://arxiv.org/abs/2108.01073) (2021)). In Diffusers the knob is `strength`: as of November 2026, with 50 steps and strength 0.8 the pipeline adds 40 steps of noise and then denoises for 40, and 1.0 more or less ignores the input image ([Diffusers: Image-to-image](https://huggingface.co/docs/diffusers/using-diffusers/img2img)).
- **Inpainting repaints the mask, mostly.** The mask marks the area to repaint in white and the area to keep in black; dedicated inpainting checkpoints blend the edit more naturally but are more likely to change unmasked pixels, so Diffusers offers `apply_overlay()` to force the unmasked area back to the original and `blur_factor` to soften the mask edge ([Diffusers: Inpainting](https://huggingface.co/docs/diffusers/using-diffusers/inpaint)). A regular checkpoint may give lower overall quality and leave the mask outline visible, but works well enough for simple jobs such as erasing an object ([Diffusers: Inpainting](https://huggingface.co/docs/diffusers/using-diffusers/inpaint)).
- **Edits from instructions and conversations.** InstructPix2Pix trains on edit examples generated with GPT-3 and Stable Diffusion, edits in one forward pass without per-example fine-tuning or inversion, and uses two guidance scales, one for the input image (typically best from 1 to 1.5) and one for the instruction (typically best from 5 to 10) (Brooks et al., [“InstructPix2Pix: Learning to Follow Image Editing Instructions”](https://arxiv.org/abs/2211.09800) (2022)). Editing a real photo by changing its prompt instead needs an inversion first, such as null-text inversion, which optimizes only the unconditional text embedding used for guidance (Mokady et al., [“Null-text Inversion for Editing Real Images using Guided Diffusion Models”](https://arxiv.org/abs/2211.09794) (2022)), and as of November 2026 multimodal models also edit conversationally: Google's Gemini documentation recommends multi-turn conversation to iterate on images and states that all generated images carry a SynthID watermark ([Nano Banana image generation](https://aistudio.google.com/docs/image-generation)).
- **Structure maps and reference images as extra conditions.** ControlNet freezes the base model and reuses its pretrained encoder layers as a trainable branch for a new condition such as edges, depth, segmentation or pose, joined through zero-initialized convolutions so the branch starts with no effect, and conditions can be used singly or combined (Zhang et al., [“Adding Conditional Control to Text-to-Image Diffusion Models”](https://arxiv.org/abs/2302.05543) (2023)); T2I-Adapter trains a lightweight, composable adapter per condition on a frozen model (Mou et al., [“T2I-Adapter: Learning Adapters to Dig out More Controllable Ability for Text-to-Image Diffusion Models”](https://arxiv.org/abs/2302.08453) (2023)). IP-Adapter adds image prompts through decoupled cross-attention, separate layers for text and image features, with about 22M parameters, and because the base stays frozen it works with fine-tunes of the same base and with existing controllable generation tools (Ye et al., [“IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models”](https://arxiv.org/abs/2308.06721) (2023)).
- **Personalization: a word, a fine-tune or an adapter, and a consent question.** Textual inversion learns one new word embedding from 3 to 5 images while the model stays frozen (Gal et al., [“An Image is Worth One Word: Personalizing Text-to-Image Generation using Textual Inversion”](https://arxiv.org/abs/2208.01618) (2022)), DreamBooth fine-tunes the model to bind a unique identifier to a subject from a few images and adds a class-specific prior preservation loss so it keeps its knowledge of the class (Ruiz et al., [“DreamBooth: Fine Tuning Text-to-Image Diffusion Models for Subject-Driven Generation”](https://arxiv.org/abs/2208.12242) (2022)), and LoRA variants train far fewer parameters, with weights the Diffusers DreamBooth guide puts at about 100 MB as of November 2026 ([Diffusers: DreamBooth](https://huggingface.co/docs/diffusers/training/dreambooth)). The same few-photo personalization of a real person can produce fake news or disturbing content targeting that person, which motivated protective perturbations such as Anti-DreamBooth (Van Le et al., [“Anti-DreamBooth: Protecting users from personalized text-to-image synthesis”](https://arxiv.org/abs/2303.15433) (2023)).
- **Judge the edit, then label it.** Faithfulness and change compete: InstructPix2Pix plots CLIP similarity to the input image against directional CLIP similarity between caption change and image change ([Brooks et al., 2022](https://arxiv.org/abs/2211.09800)), and image restoration faces a proven perception-distortion trade-off. For any distortion measure, lower average distortion means outputs become easier to tell apart from real images, so a restoration method such as an upscaler cannot maximize faithfulness and realism at once (Blau and Michaeli, [“The Perception-Distortion Tradeoff”](https://arxiv.org/abs/1711.06077) (2017)). C2PA manifests record actions such as `c2pa.edited` with a digital source type, and IPTC's `compositeWithTrainedAlgorithmicMedia` covers “augmentation, correction or enhancement using a Generative AI model, such as with inpainting or outpainting operations” ([C2PA Technical Specification 2.2](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html); [IPTC Digital Source Type vocabulary](https://cv.iptc.org/newscodes/digitalsourcetype/)).

## Planned visuals

- **`calculator`:** image-to-image strength, with denoising steps run = strength × steps and a test that reproduces the Diffusers example of 50 steps at strength 0.8 giving 40.
- **`tree`:** choose an editing method by what must stay fixed: the whole image loosely (image-to-image), everything outside a region (inpainting), the structure (ControlNet or T2I-Adapter), a style or identity (IP-Adapter, textual inversion, DreamBooth or LoRA), or nothing but an instruction (instruction-based editing).
- **`diagram`:** ControlNet and IP-Adapter attached to one frozen diffusion model: the trainable branch built from the model's encoder layers joined by zero-initialized convolutions, and the separate image cross-attention beside the text cross-attention, each part linked to its chapter.

## Talk like an expert

Practitioners say strength, mask, image guidance and prior preservation, fix the seed with a generator while iterating, because a pipeline otherwise starts from new random noise on every call ([Diffusers: Reproducibility](https://huggingface.co/docs/diffusers/using-diffusers/reusing_seeds)), and frame every method by what it holds fixed (pixels outside a mask, structure from a control map, identity from an adapter) and what it lets change. Labeling and provenance are covered in [synthetic media, provenance and deepfakes](#synthetic-media-provenance).

## Go deeper

- Zhang et al., [“Adding Conditional Control to Text-to-Image Diffusion Models”](https://arxiv.org/abs/2302.05543) (2023), the ControlNet paper.
- Brooks et al., [“InstructPix2Pix: Learning to Follow Image Editing Instructions”](https://arxiv.org/abs/2211.09800) (2022).
- Ruiz et al., [“DreamBooth: Fine Tuning Text-to-Image Diffusion Models for Subject-Driven Generation”](https://arxiv.org/abs/2208.12242) (2022).
- [Diffusers: Inpainting](https://huggingface.co/docs/diffusers/using-diffusers/inpaint), for mask conventions, checkpoints and preserving unmasked areas.

## Related

- [Image generation](#image-generation)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
