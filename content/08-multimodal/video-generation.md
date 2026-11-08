---
id: video-generation
book: 8
order: "8.4.1"
title: Video generation models
level: expert
stability: volatile
reviewed: "2026-11"
status: seed
tags: [video-generation, video-diffusion, video-vae, spacetime-patches, video-evaluation]
visuals: []
prerequisites: [video-world-models, image-generation]
---
> [!tldr]
> Video generation models turn text, images or other clips into moving pictures, mostly by running diffusion in the compressed latent space of a video autoencoder, with a transformer that attends across space and time. They power text-to-video, image-to-video and video editing, and some now generate sound with the picture. Remember that a clip that looks real is not evidence that the model understands physics.

## Key ideas

- **From image diffusion to video.** Video Diffusion Models extended the standard image diffusion architecture to video and trained jointly on images and videos (Ho et al., [“Video Diffusion Models”](https://arxiv.org/abs/2204.03458) (2022)), and Make-A-Video learned appearance from text-image pairs and motion from unlabeled video, with no paired text-video data (Singer et al., [“Make-A-Video: Text-to-Video Generation without Text-Video Data”](https://arxiv.org/abs/2209.14792) (2022)). Stable Video Diffusion splits training into text-to-image pretraining, video pretraining and high-quality video fine-tuning, and finds that a well-curated, captioned and filtered pretraining set matters (Blattmann et al., [“Stable Video Diffusion: Scaling Latent Video Diffusion Models to Large Datasets”](https://arxiv.org/abs/2311.15127) (2023)).
- **Compress time as well as space, then attend over everything.** CogVideoX's 3D causal VAE compresses a clip 8×8 in space and 4× in time, and a diffusion transformer runs full 3D attention over the latent patches; in the authors' ablations, separate spatial and temporal attention trained worse and was prone to collapse (Yang et al., [“CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer”](https://arxiv.org/abs/2408.06072) (2024)). Because most videos lack good descriptions, CogVideoX also built a dense video-captioning pipeline, which the authors report significantly improved semantic understanding ([Yang et al., 2024](https://arxiv.org/abs/2408.06072)).
- **Open models and their memory, as dated examples.** Wan (March 2025) released 1.3B and 14B parameter diffusion-transformer video models with code; the authors state that the 1.3B model needs only 8.19 GB of VRAM and list uses such as image-to-video, instruction-guided video editing and personalized video generation (Team Wan, [“Wan: Open and Advanced Large-Scale Video Generative Models”](https://arxiv.org/abs/2503.20314) (2025)).
- **Controls and sound, as of November 2026.** Google DeepMind's page for Veo 3.1 lists natively generated sound effects, ambient noise and dialogue, reference images, first and last frame, scene extension and camera controls, and says Veo videos are marked with SynthID watermarks ([Google DeepMind, Veo](https://deepmind.google/models/veo/)).
- **Long and interactive clips need causal generation.** Diffusion forcing trains a model to denoise tokens that each carry their own noise level, so a causal model can generate the next frames without re-diffusing the past and can roll out video beyond its training horizon, where the baselines diverge (Chen et al., [“Diffusion Forcing: Next-token Prediction Meets Full-Sequence Diffusion”](https://arxiv.org/abs/2407.01392) (2024)).
- **Visual quality is not physical correctness.** FVD scores quality, temporal coherence and diversity in one number (Unterthiner et al., [“Towards Accurate Generative Models of Video: A New Metric & Challenges”](https://arxiv.org/abs/1812.01717) (2018)), while VBench splits evaluation into 16 dimensions, such as subject consistency, motion smoothness, temporal flickering and spatial relationships, each checked against human preferences (Huang et al., [“VBench: Comprehensive Benchmark Suite for Video Generative Models”](https://arxiv.org/abs/2311.17982) (2023)). On the Physics-IQ benchmark, physical understanding was severely limited and unrelated to visual realism across the models tested, including Sora, Runway, Pika, Lumiere, Stable Video Diffusion and VideoPoet (Motamed et al., [“Do generative video models understand physical principles?”](https://arxiv.org/abs/2501.09038) (2025)).

## Planned visuals

- `calculator`: latent tokens for one clip from resolution, frame count, the VAE's spatial and temporal compression and the patch size, showing how fast the cost of full 3D attention grows with clip length.
- `compare`: full 3D attention against factorized spatial-then-temporal attention on the same latent grid, highlighting which patches each query can see.
- `tree`: the control modes: text-to-video, image-to-video, first and last frame, reference images, extension, editing and joint audio, each with a dated example and its source.

## Talk like an expert

Experts talk about latent video diffusion, 3D causal VAEs and their compression ratios, spacetime patches, full versus factorized attention, image-to-video conditioning, FVD and VBench dimensions. They score visual quality, prompt following and physical plausibility separately, and treat generated video as synthetic media that needs provenance (see [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)).

## Go deeper

- Ho et al., [“Video Diffusion Models”](https://arxiv.org/abs/2204.03458) (2022).
- Yang et al., [“CogVideoX: Text-to-Video Diffusion Models with An Expert Transformer”](https://arxiv.org/abs/2408.06072) (2024).
- Huang et al., [“VBench: Comprehensive Benchmark Suite for Video Generative Models”](https://arxiv.org/abs/2311.17982) (2023).
- Motamed et al., [“Do generative video models understand physical principles?”](https://arxiv.org/abs/2501.09038) (2025).

## Related

- [Video, 3D and world models](#video-world-models)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [World models](#world-models)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
- [Synthetic media, provenance and deepfakes](#synthetic-media-provenance)
- [Visual tokenizers and autoregressive image generation](#autoregressive-image-generation)
