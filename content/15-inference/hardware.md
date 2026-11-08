---
id: hardware
book: 15
order: "15.9"
title: Hardware
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [gpu, tpu, hardware, bandwidth]
visuals:
  - hardware-chart:chart
  - hardware-hierarchy:diagram
---
> [!tldr]
> AI accelerators are judged by memory capacity, memory bandwidth, low-precision compute and interconnect. NVIDIA GPUs dominate, with AMD, Google TPUs, AWS Trainium and Inferentia, and specialized chips competing. For inference, bandwidth and capacity usually matter more than peak FLOPs; for training, interconnect at scale is decisive.

## Why it matters
Hardware sets the floor on latency and the ceiling on how many users and how large a model you can serve per dollar. Choosing accelerators, instance types or cloud regions without understanding these numbers leads to paying for compute you cannot use, or running out of memory long before compute.

## Intuition
An accelerator is a factory: compute units are the machines, memory capacity is the warehouse, memory bandwidth is the loading dock, and the interconnect is the road to the next factory. Language model decode keeps the loading dock busy and the machines waiting.

```viz
{"id":"hardware-chart","component":"chart","type":"scatter","title":"Newer accelerators raise memory capacity and bandwidth together","caption":"Approximate published specifications per chip, rounded; verify current figures for the exact variant you can rent. Higher and further right means more and faster memory, which is what decode and long contexts need.","alt":"Scatter of accelerators by memory capacity and memory bandwidth: A100, H100, H200, B200, MI300X, MI325X and TPU v5p.","data":"illustrative","depicts":"Approximate published specs as of 2025","x":{"label":"Memory capacity per chip (GB)","min":60,"max":280},"y":{"label":"Memory bandwidth (TB/s)","min":1.5,"max":8.5},"series":[{"name":"Accelerator","points":[[80,2.0,"A100 80GB"],[80,3.35,"H100 SXM"],[95,2.8,"TPU v5p"],[141,4.8,"H200"],[192,8.0,"B200"],[192,5.3,"MI300X"],[256,6.0,"MI325X"]]}]}
```

## How it works
**The numbers that matter.**
- **Memory capacity** decides whether the model and KV cache fit. See [memory math](#memory-math).
- **Memory bandwidth** caps decode speed. See [inference fundamentals](#inference-fundamentals).
- **Low-precision compute** (FP8, FP4) speeds prefill and training, if software uses it. See [quantization](#quantization).
- **Interconnect** (NVLink within a server or rack, InfiniBand or Ethernet across them) decides how well models and training jobs scale across chips.

**NVIDIA.** Hopper (H100, H200) and Blackwell (B200, GB200) generations dominate; the CUDA software ecosystem is their biggest advantage. Rack-scale systems such as GB200 NVL72 put 72 GPUs in one NVLink domain, which suits very large models and expert parallelism.

**AMD.** Instinct MI300X and MI325X offer large memory capacity; ROCm support in vLLM, SGLang and PyTorch has matured, though new models and kernels can arrive later than on CUDA.

**Google TPUs.** Designed for large-scale training and serving with JAX and XLA, connected in pods; available through Google Cloud.

**AWS Trainium and Inferentia.** Amazon’s chips for training and inference, used through the Neuron SDK; attractive pricing on AWS for supported models.

**Specialized inference chips.** Groq’s LPU, Cerebras’s wafer-scale engine and others trade generality for very high decode speeds, usually offered as hosted APIs.

**Consumer and edge hardware.** Apple Silicon’s unified memory lets laptops hold large quantized models; phones and PCs add neural processing units. See [edge and on-device AI](#edge-on-device).

```viz
{"id":"hardware-hierarchy","component":"diagram","title":"From chip to cluster, each level is joined by slower links than the one inside it","caption":"Keep the most communication-heavy work, such as tensor parallelism, inside the fastest level. Click a level for related chapters.","alt":"Layered diagram of AI hardware from a single accelerator to a server, a rack-scale NVLink domain and a cluster network.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"cluster","label":"Cluster","sub":"InfiniBand or Ethernet between racks: training at scale","role":"external","link":"#distributed-training"},
{"id":"rack","label":"Rack-scale domain","sub":"for example 72 GPUs on NVLink: very large models","role":"tool","link":"#disaggregated-serving"},
{"id":"server","label":"Server","sub":"typically 8 GPUs on NVLink: tensor parallelism","role":"tool"},
{"id":"chip","label":"Accelerator","sub":"HBM capacity and bandwidth, tensor cores","role":"model","link":"#inference-fundamentals"}]}
```

## In practice
Choosing hardware for inference:
1. Compute memory for weights plus KV cache at target concurrency.
2. Estimate decode speed from bandwidth: bytes read per step ÷ bandwidth.
3. Check that your engine supports the chip, model and precision with fast kernels.
4. Compare cost per million output tokens at your latency target, not price per hour. See [cost engineering](#cost-engineering).
5. Check availability: the best chip you cannot get is worse than a good one you can.

## Numbers to know
> [!number]
> Approximate published specs (verify): H100 SXM 80 GB at about 3.35 TB/s; H200 141 GB at about 4.8 TB/s; B200 about 192 GB at about 8 TB/s; MI300X 192 GB at about 5.3 TB/s. Rule of thumb: decode tokens per second for one sequence ≈ bandwidth ÷ bytes of weights read per token.

## Pitfalls and anti-patterns
> [!pitfall] Buying by peak FLOPs
> Decode-heavy serving rarely reaches peak compute. Bandwidth, capacity and software support decide real throughput.

- **Ignoring the interconnect.** Multi-GPU serving across slow links disappoints.
- **Assuming kernels exist.** New precisions and chips need engine support to deliver their speed.
- **Comparing list prices.** Compare cost per token at your SLO.

## Talk like an expert
The vocabulary: **HBM**, **memory bandwidth**, **tensor cores**, **FP8 and FP4**, **NVLink**, **NVL72**, **InfiniBand**, **ROCm**, **TPU pod**, **unified memory**. Experts quote hardware as capacity and bandwidth first, and translate everything into tokens per second per dollar. The live debate is how much the CUDA ecosystem’s lead will narrow as other vendors’ software matures.

> [!hottake] For inference, the best accelerator is the one with the most memory bandwidth per dollar that your engine supports well.
> **The counterargument:** prefill-heavy, batch and training workloads are compute- and interconnect-bound, and for them peak low-precision FLOPs and network topology matter more than bandwidth.

## Check yourself
```quiz
hardware
```

## Go deeper
- Vendor datasheets for the accelerators you consider, read for the exact variant.
- SemiAnalysis-style hardware analyses and MLPerf Inference results, read with dates.

## Related
- [Inference fundamentals](#inference-fundamentals)
- [Memory math](#memory-math)
- [Distributed training](#distributed-training)
- [Cost engineering](#cost-engineering)
- [Serving engines](#serving-engines)
