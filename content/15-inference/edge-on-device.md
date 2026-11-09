---
id: edge-on-device
book: 15
order: "15.11"
title: Edge and on-device AI
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [edge, on-device, webgpu]
visuals:
  - edge-stack:diagram
  - edge-router:tree
---
> [!tldr]
> Small, quantized models now run on phones, laptops and browsers, offering privacy, offline use, zero marginal cost and low latency. Their limits are memory, bandwidth, battery and quality. Most products combine them with cloud models in a hybrid design.

## Why it matters
On-device AI changes the economics and the privacy story: no per-token bill, no data leaving the device, and responses even without a network. Operating systems now ship models and APIs for developers, so on-device features are becoming a default part of app design rather than a research project.

## Intuition
On-device models are a pocket calculator; cloud models are a supercomputer you rent. The calculator is always with you, free and private, and fine for most sums. For the hard problems, you call the supercomputer.

```viz
{"id":"edge-stack","component":"diagram","title":"An on-device AI stack, from app to silicon","caption":"Each layer has several options; your target platforms decide which. Click a layer for related chapters.","alt":"Layered diagram of an on-device AI stack: application, OS model APIs or a runtime, a quantized small model, and the device hardware.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"app","label":"Application","sub":"features, fallbacks to cloud","role":"human"},
{"id":"api","label":"OS model APIs or a runtime","sub":"platform models; llama.cpp, MLX, ONNX Runtime, ExecuTorch, LiteRT, WebGPU","role":"agent","link":"#serving-engines"},
{"id":"model","label":"Small quantized model","sub":"roughly 1 to 8B parameters at about 4 bits","role":"model","link":"#small-local-models"},
{"id":"hw","label":"Device hardware","sub":"CPU, GPU, NPU, unified memory and its bandwidth","role":"tool","link":"#hardware"}]}
```

## How it works
**Models.** Small open models (Gemma, Llama, Qwen, Phi, SmolLM and others) and platform models built into operating systems. Quantized to about 4 bits, a 3B model needs roughly 1.5 to 2 GB. See [small and local models](#small-local-models).

**Runtimes.** llama.cpp and tools built on it for cross-platform CPU and GPU inference; Apple’s MLX and Core ML on Apple devices; ONNX Runtime through Windows ML on Windows (DirectML is in sustained engineering as of November 2026); ExecuTorch and Google’s LiteRT for mobile; WebGPU-based libraries such as WebLLM in browsers.

**Platform models.** Operating systems now expose built-in models: Apple’s Foundation Models framework gives apps access to its on-device model, and Android’s AICore provides Gemini Nano on supported devices. They save download size and are tuned for the hardware, with limits on customization.

**The constraints.** Memory (the model competes with apps), bandwidth (decode speed is bandwidth-bound, as on servers), thermals and battery (sustained generation heats devices and drains power), and quality (small models make more mistakes on hard tasks).

**Hybrid designs.** Route by task difficulty, privacy and connectivity: run classification, extraction, autocomplete and short summaries on device; escalate hard reasoning and long-context tasks to the cloud, with user consent where data leaves the device.

## In practice
```viz
{"id":"edge-router","component":"tree","title":"Four questions decide whether a request runs on the device or in the cloud","caption":"Expand each question. Many apps run the same feature both ways and choose per request.","alt":"Decision tree for routing AI requests between on-device and cloud models.","data":"illustrative","open":1,"root":{"label":"Where should this request run?","children":[
{"label":"Must the data stay on the device?","children":[{"label":"Yes: on device, or ask for consent before sending","link":"#privacy"}]},
{"label":"Is the device offline or the network slow?","children":[{"label":"Yes: on device, with a graceful quality fallback"}]},
{"label":"Is the task simple: classify, extract, autocomplete, short summary?","children":[{"label":"Yes: on device; it is free and fast"}]},
{"label":"Does it need long context, tools or strong reasoning?","children":[{"label":"Yes: cloud model, possibly with on-device pre-processing","link":"#choosing-a-model"}]}]}}
```

Shipping checklist:
- Evaluate the on-device model on your tasks against the cloud baseline. See [evaluating](#why-evals).
- Measure memory, latency, battery and thermals on the oldest device you support.
- Download models lazily and let users manage storage.
- Design the fallback: what happens when the device cannot run the model or the answer is not good enough.

## Numbers to know
> [!number]
> Rules of thumb. A 3B model at 4 bits is about 1.5 to 2 GB. With phone memory bandwidth of tens of GB/s, decode runs at roughly tens of tokens per second. Laptops with unified memory can run quantized models in the tens of billions of parameters.

## Pitfalls and anti-patterns
> [!pitfall] Testing only on the newest flagship device
> Older and mid-range devices have less memory and bandwidth; the feature may be unusable for most of your users.

- **Ignoring thermals.** Long generations throttle performance and drain batteries.
- **No cloud fallback.** Small models fail on hard inputs; plan for it.
- **Huge model downloads on install.** Download on demand and explain the size.

## Talk like an expert
The vocabulary: **on-device inference**, **small language model**, **NPU**, **unified memory**, **platform model**, **hybrid routing**, **GGUF**, **WebGPU**. Experts talk about on-device features in terms of memory budget, tokens per second, battery cost and fallback rate. The live debate is how much of everyday AI will move on device as small models improve, and how platforms will share their built-in models with developers.

> [!hottake] Most everyday AI features will run on device within a few years.
> **The counterargument:** the most valuable AI tasks keep growing in difficulty and context, and cloud models improve as fast as small ones; on-device will win the simple tasks while the frontier stays in the data center.

## Check yourself
```quiz
edge-on-device
```

## Go deeper
- llama.cpp, MLX, ExecuTorch and WebLLM documentation.
- Apple’s Foundation Models framework and Android’s AICore developer documentation.

## Related
- [Personal and ambient assistants](#personal-assistants)
- [Small and local models](#small-local-models)
- [Quantization](#quantization)
- [Hardware](#hardware)
- [Serving engines](#serving-engines)
- [Privacy](#privacy)
- [Quantization methods in depth](#quantization-methods)
- [GPU kernels and ML compilers](#gpu-kernels-compilers)
- [Energy, power and AI data centers](#ai-energy)
- [Privacy-preserving machine learning](#privacy-preserving-ml)
- [Playbook: Apple's on-device scene analysis: one shared vision backbone for many features](#apple-on-device-scene-analysis)
- [Playbook: Apple Photos: recognizing people on the device](#apple-photos-people-recognition)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Running models locally](#local-inference)
