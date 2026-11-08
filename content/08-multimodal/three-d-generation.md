---
id: three-d-generation
book: 8
order: "8.4.3"
title: 3D reconstruction and generation
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [3d, nerf, gaussian-splatting, view-synthesis, text-to-3d]
visuals: []
prerequisites: [video-world-models, neural-networks]
---
> [!tldr]
> 3D methods either reconstruct a real scene from photos, so it can be viewed from angles nobody photographed, or generate new objects and scenes from text or a single image. Neural radiance fields and 3D Gaussian splatting are the two main ways to represent a captured scene, and generation borrows its knowledge from 2D image diffusion models because large labeled 3D datasets are rare. Remember that a reconstruction is judged on views held out of training, not on the photos it was fitted to.

## Key ideas

- **Camera poses come first.** Reconstruction needs to know where each photo was taken, which structure from motion recovers; COLMAP is a general-purpose structure-from-motion and multi-view stereo pipeline for ordered and unordered photo collections ([COLMAP documentation](https://colmap.github.io/)). The NeRF paper used COLMAP to estimate the camera poses of its real scenes (Mildenhall et al., [“NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis”](https://arxiv.org/abs/2003.08934) (2020)), and Gaussian splatting starts from the sparse point cloud that structure from motion produces during calibration ([Kerbl et al., 2023](https://arxiv.org/abs/2308.04079)).
- **NeRF: a scene stored as a function.** NeRF trains a fully connected network that maps a 3D position and a viewing direction to a density and a view-dependent color, renders each pixel by classic volume rendering along a camera ray, and, because that rendering is differentiable, fits the network to photos with known poses; each scene is optimized on its own, which took about 1 to 2 days on one NVIDIA V100 GPU in the paper ([Mildenhall et al., 2020](https://arxiv.org/abs/2003.08934)).
- **Gaussian splatting: explicit and real-time.** 3D Gaussian splatting starts from the sparse points that structure from motion produces, turns them into 3D Gaussians whose position, anisotropic shape, opacity and color (stored as spherical harmonics) are optimized while Gaussians are added and removed, and draws them with a fast visibility-aware rasterizer, reaching real-time (at least 30 fps) novel-view synthesis at 1080p (Kerbl et al., [“3D Gaussian Splatting for Real-Time Radiance Field Rendering”](https://arxiv.org/abs/2308.04079) (2023)). Where NeRF queries a network at many points along every ray, splatting skips empty space and rasterizes an explicit set of primitives, a different method for the same goal ([Kerbl et al., 2023](https://arxiv.org/abs/2308.04079)).
- **Text-to-3D borrows a 2D prior.** DreamFusion optimizes a randomly initialized NeRF until its renders from random viewpoints score well under a pretrained text-to-image diffusion model, a loss it calls score distillation sampling, with no 3D training data and no changes to the diffusion model (Poole et al., [“DreamFusion: Text-to-3D using 2D Diffusion”](https://arxiv.org/abs/2209.14988) (2022)). View-aware diffusion improves consistency: Zero-1-to-3 learns to change an object's camera viewpoint from a single image (Liu et al., [“Zero-1-to-3: Zero-shot One Image to 3D Object”](https://arxiv.org/abs/2303.11328) (2023)), and MVDream generates several consistent views at once, trained on 2D and 3D data, which makes score distillation more consistent and stable (Shi et al., [“MVDream: Multi-view Diffusion for 3D Generation”](https://arxiv.org/abs/2308.16512) (2023)).
- **Feed-forward models skip per-scene optimization.** LRM is a 500M-parameter transformer that predicts a NeRF from one image in about 5 seconds, trained on about 1 million objects from Objaverse renderings and MVImgNet captures (Hong et al., [“LRM: Large Reconstruction Model for Single Image to 3D”](https://arxiv.org/abs/2311.04400) (2023)); Objaverse itself offers more than 800,000 annotated 3D models (Deitke et al., [“Objaverse: A Universe of Annotated 3D Objects”](https://arxiv.org/abs/2212.08051) (2022)).
- **Evaluate on held-out views, then export.** Reconstructions are scored by rendering views left out of training and comparing them with the real photos using PSNR, SSIM and LPIPS; the Gaussian splatting paper holds out every 8th photo, following Mip-NeRF360 ([Kerbl et al., 2023](https://arxiv.org/abs/2308.04079)). Many pipelines still expect meshes, which make editing, sculpting, animating and relighting easier, so methods such as SuGaR align Gaussians with the surface and extract an editable mesh within minutes on a single GPU (Guédon and Lepetit, [“SuGaR: Surface-Aligned Gaussian Splatting for Efficient 3D Mesh Reconstruction and High-Quality Mesh Rendering”](https://arxiv.org/abs/2311.12775) (2023)).

## Planned visuals

- `stepper`: volume rendering along one camera ray: sample points, their densities and colors, the transmittance that remains, and the final pixel color.
- `compare`: NeRF next to 3D Gaussian splatting: representation, initialization, rendering, training and rendering speed, and how easily each becomes a mesh.
- `diagram`: the pipeline from photos to COLMAP poses and sparse points, to a NeRF or Gaussians, to held-out evaluation and mesh export, with a generation branch from text or one image through a diffusion prior or a feed-forward model.

## Talk like an expert

Experts talk about novel view synthesis, camera poses and structure from motion, radiance fields, volume rendering, splatting and density control, score distillation, multi-view consistency and feed-forward reconstruction. They first ask whether a method optimizes each scene or predicts it in one pass, and they report PSNR, SSIM and LPIPS on held-out views.

## Go deeper

- Mildenhall et al., [“NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis”](https://arxiv.org/abs/2003.08934) (2020).
- Kerbl et al., [“3D Gaussian Splatting for Real-Time Radiance Field Rendering”](https://arxiv.org/abs/2308.04079) (2023).
- Poole et al., [“DreamFusion: Text-to-3D using 2D Diffusion”](https://arxiv.org/abs/2209.14988) (2022).
- [COLMAP documentation](https://colmap.github.io/).

## Related

- [Video, 3D and world models](#video-world-models)
- [World models](#world-models)
- [Diffusion and flow matching](#diffusion-flow-matching)
- [Embodied and robotics agents](#embodied-agents)
- [Evaluating multimodal and generative models](#multimodal-evaluation)
