---
id: apple-on-device-scene-analysis
book: 21
order: "21.5"
title: "Apple's on-device scene analysis: one shared vision backbone for many features"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [computer-vision, on-device, multi-task-learning, model-compression, public-record]
visuals: []
type: playbook
account: public-record
industry: "Consumer technology (device operating systems and apps)"
use_case: "One shared on-device vision backbone with task heads that produces scene-analysis signals for Photos search, Memories, Camera and other features"
outcome: "Backbone and all tasks in just under 9.7 milliseconds on iPhone 13; 40 percent reduction in peak inference memory against the iOS 15 model; 10.5 percent improvement in mean average precision against the classification-pretrained backbone"
measured_how: "Latency and peak memory on iPhone 13, peak memory against the iOS 15 model, mean average precision on the classification task, and ImageNet and COCO benchmarks against an internal ViT-B/16 encoder; no sample sizes or period stated (Apple Machine Learning Research, June 2022)"
prerequisites: [edge-on-device]
replications: []
---
> [!tldr]
> Apple built ANSA (Apple Neural Scene Analyzer), one image backbone that runs fully on the device and supports several downstream tasks, instead of a dedicated model per feature. Apple reports that on iPhone 13 it can run "the backbone and all its tasks in just under 9.7 milliseconds". The compact model scores lower than a larger encoder on public benchmarks, and Apple reports that it met its task-specific production KPIs.

> [!note] From the public record
> Built from Apple's own published account, "A Multi-Task Neural Architecture for On-Device Scene Analysis" (June 2022), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

Scene analysis feeds visual content search and Memories in Photos, and ANSA is also used by Camera, Spotlight search, Accessibility features, Notes, Final Cut Pro and apps that use Apple's Vision APIs. The post says a dedicated model for each feature "is inefficient as many of these models can benefit from sharing resources."

All compute had to run on the user's device, "with no involvement of cloud or remote resources". Inference had to be fast, use a limited amount of memory and minimal power, and have a small footprint on disk. It had to run on all supported iPhone, iPad, Mac and Apple TV models.

## Why this approach

The post names three factors:

- **Disk space.** Devices have limited disk space, so several tasks could be deployed only on one shared backbone.
- **Latency.** For interactive use, latency targets "had to be under tens of milliseconds".
- **Hardware.** Transformer-based vision backbones were "promising", but Apple wanted to support devices without a Neural Engine, so it chose [convolutional](#convolutional-networks) architectures.

The older ANSA used a frozen backbone trained with a multilabel classification objective. This classifier was initially trained on a few million images that included stock imagery. Citing recent work on large weakly supervised data sets, the team moved to a joint image-language backbone trained with a contrastive objective. Such models do not require high-quality task-specific annotations. See [Vision-language models](#vision-language-models).

## The approach

1. **Pretrain one image-language backbone** on "a few hundred million image-text pairs", typically on hundreds of GPUs with gradient checkpointing and mixed-precision training. Sharding the data and storing images pre-resized for training raised throughput to "~10x the speed of a base implementation".
2. **Branch task heads off the frozen backbone** at different depths, from a linear layer for the utility content filter to a convolutional network for object detection, which "adds only 1 MB" to the backbone's disk usage. Classification became one more small head.
3. **Pick and compress the backbone.** After "a thorough architecture search", the team chose a MobileNetv3 variant modified for the A11 Bionic, M1 and later chips, and used quantization and pruning.
4. **Shrink the text encoder.** At 44 million parameters it was "a fairly large model to deploy on the client". Pruning during fine-tuning removed about 40 percent of its weights "without impacting evaluation metrics", and 8-bit unsigned integer weights cut its size "by another factor of four". See [Quantization](#quantization) and [Pruning and structured compression](#llm-pruning).
5. **Measure quality per task and check fairness before shipping.** Task metrics, such as mean average precision, typically use held-out data and user-representative libraries, plus Apple internal testing programs. Before shipping, the models are benchmarked on several dimensions, "especially concerning bias and fairness". Soft spots are addressed with targeted data collections, for example covering poor lighting or images from older sensors. Annotators review this data before it is used. See [Fairness metrics and bias measurement](#fairness-bias).

## The stack

As of June 2022, as the post names it: a MobileNetv3-variant vision backbone ("ANSA contains 16 million parameters"); a text encoder with "only 26M parameters after pruning"; the Apple Neural Engine (ANE), with results also for "older GPU devices"; iOS 16 and Mac OS Ventura. Scene tags go into the Photos knowledge graph, and a word-embedding model suggests the closest searchable concept for queries that would find nothing. The post names no training framework, deployment toolchain or image-text data source.

## Results, and how they were measured

- **Latency and memory.** "On iPhone 13, we can run the backbone and all its tasks in just under 9.7 milliseconds", with peak memory under 24.6 MB. ANSA occupies around 16.4 MB of disk space.
- **Against the iOS 15 model.** It is "significantly faster on the ANE" with "significant gains on older GPU devices", and a "40 percent reduction in peak memory used during inference" while "requiring less storage on disk". The new model also adds a perceptual print head and operates on larger input resolutions.
- **Text encoder.** 3-4 ms on the ANE after pruning.
- **Classification.** Against the original classification-pretrained backbone, "we see a 10.5 percent improvement in mean average precision".
- **Public benchmarks.** Against an internal ViT-B/16 encoder (86M vision parameters): ImageNet top-5 accuracy 87.54 versus 80.44 for MobileNetV3 (9M), and COCO text-to-image top-5 retrieval 64.94 versus 57.32. "The compact model leads to a quality hit on public benchmarks", but the visual encoder "was meeting task-specific production KPIs".

**Not measured:** the post gives no sample or evaluation-set sizes, no period, no production KPI values, no power figures, no numbers for older GPU devices or devices without a Neural Engine (the text describes those gains only in words), no fairness results and no user-facing outcomes. It does not say how the 16 million parameters of ANSA relate to the 9M vision parameters in Table 1.

## What failed

The post reports limits rather than failures:

- **Lower benchmark quality** than the ViT-B/16 encoder on both public benchmarks.
- **Tight capacity.** A caption notes "the visual encoder model capacity we had was very limited", because the team "did not want any existing user experiences to be impacted by performance regressions".
- **A large text encoder,** reduced with pruning and quantization.
- **Soft spots,** addressed with targeted data collections; the post does not say which soft spots were found or how large the collections were.

## What the team would do differently

The post states no lessons. Its conclusion stresses "deploying neural networks on the user's device for local and privacy-preserving compute".

The wiki's reading: the central move is one shared backbone with a cheap head per feature, as the 1 MB detection head shows. The price is a smaller encoder that loses on public benchmarks but meets the product's own targets. That trade rests on task metrics that the post says Apple tracks but does not publish. See [Edge and on-device AI](#edge-on-device).

## Disclosure

None.

## Sources

- No author byline (the acknowledgments say many people contributed, including Brandon McKinzie, Rohan Chandra, Sachin Ravi, Alp Aygar, Anindya Sarkar, Atila Orhon, Côme Weber, Mandakinee Singh Patel, Sowmya Gopalan and Vignesh Jagadeesh), Apple, [“A Multi-Task Neural Architecture for On-Device Scene Analysis”](https://machinelearning.apple.com/research/on-device-scene-analysis), Apple Machine Learning Research (research highlight), 7 June 2022.

## Related

- [About playbooks](#about-playbooks)
- [Edge and on-device AI](#edge-on-device)
- [Vision-language models](#vision-language-models)
- [Quantization](#quantization)
- [Pruning and structured compression](#llm-pruning)
