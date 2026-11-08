---
id: distributed-training
book: 3
order: "3.3"
title: Distributed training
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [training, fsdp, parallelism]
visuals:
  - parallelism-switch:diagram
  - training-memory:calculator
---
> [!tldr]
> Training large models spreads work across thousands of accelerators: data parallelism with sharded optimizer states (ZeRO, FSDP), tensor and pipeline parallelism for models too big for one device, mixed precision, activation checkpointing, and relentless failure handling. Mixed-precision Adam needs about 16 bytes per parameter before activations.

## Why it matters
Even teams that never pretrain run distributed fine-tuning, and everyone who reads model announcements meets terms such as FSDP, MFU and FP8 training. Understanding the memory and communication arithmetic explains why training runs cost what they do and why they fail.

## Intuition
Training is building a cathedral with a huge crew. You can give each crew a full copy of the plans (data parallelism), split each wall between crews (tensor parallelism), or assign floors to crews in sequence (pipeline parallelism). Most big projects use all three, and spend much of their effort coordinating.

```viz
{"id":"parallelism-switch","component":"diagram","title":"Four ways to split training across GPUs, combined in practice as 3D parallelism","caption":"Switch tabs. Data parallelism splits batches; sharding splits optimizer state; tensor and pipeline parallelism split the model itself.","alt":"Diagram variants of data parallelism, sharded data parallelism, tensor parallelism and pipeline parallelism for training.","data":"illustrative","w":560,"h":140,"variants":[
{"name":"Data parallel","note":"Every GPU holds the full model and a different slice of the batch; gradients are averaged with all-reduce after each step.","nodes":[{"id":"g1","label":"GPU 1: full model","role":"tool","x":0,"y":40,"w":160,"h":56},{"id":"g2","label":"GPU 2: full model","role":"tool","x":200,"y":40,"w":160,"h":56},{"id":"ar","label":"All-reduce gradients","x":400,"y":40,"w":160,"h":56}],"edges":[{"from":"g1","to":"ar"},{"from":"g2","to":"ar"}]},
{"name":"Sharded (ZeRO, FSDP)","note":"Optimizer states, gradients and even parameters are split across GPUs and gathered when needed, cutting memory per GPU roughly by the number of GPUs.","nodes":[{"id":"s1","label":"GPU 1: shard 1","role":"data","x":0,"y":40,"w":160,"h":56},{"id":"s2","label":"GPU 2: shard 2","role":"data","x":200,"y":40,"w":160,"h":56},{"id":"ag","label":"Gather, compute, scatter","x":400,"y":40,"w":160,"h":56}],"edges":[{"from":"s1","to":"ag","both":true},{"from":"s2","to":"ag","both":true}]},
{"name":"Tensor","note":"Each layer’s matrices are split across GPUs on a fast interconnect; partial results are exchanged within every layer.","nodes":[{"id":"t1","label":"GPU 1: half of each matrix","role":"model","x":0,"y":40,"w":220,"h":56},{"id":"t2","label":"GPU 2: other half","role":"model","x":300,"y":40,"w":220,"h":56}],"edges":[{"from":"t1","to":"t2","both":true,"label":"every layer"}]},
{"name":"Pipeline","note":"Consecutive layers live on different GPUs; micro-batches flow through like an assembly line to keep every stage busy.","nodes":[{"id":"p1","label":"Layers 1 to 20","role":"tool","x":0,"y":40,"w":160,"h":56},{"id":"p2","label":"Layers 21 to 40","role":"tool","x":200,"y":40,"w":160,"h":56},{"id":"p3","label":"Layers 41 to 60","role":"tool","x":400,"y":40,"w":160,"h":56}],"edges":[{"from":"p1","to":"p2","label":"activations"},{"from":"p2","to":"p3","label":"activations"}]}]}
```

## How it works
**Memory per parameter.** Mixed-precision training with Adam keeps 16-bit weights and gradients plus 32-bit master weights and two optimizer moments: about 16 bytes per parameter, before activations (Rajbhandari et al., 2019, the ZeRO paper).

```viz
{"id":"training-memory","component":"calculator","title":"A 7B model needs about 112 GB for weights, gradients and optimizer states, or 14 GB per GPU sharded over eight","caption":"Formula view: parameters × 16 bytes for mixed-precision Adam, divided across GPUs with full sharding. Activations come on top and depend on batch size and sequence length.","alt":"Calculator for training memory from parameters, bytes per parameter and the number of GPUs sharding the state.","data":"formula","outputs":[{"id":"total_gb","label":"Model state, total","expr":"params_b * bytes_per_param","unit":"GB"},{"id":"per_gpu_gb","label":"Per GPU, fully sharded","expr":"total_gb / gpus","unit":"GB","main":true}],"inputs":{"params_b":7,"bytes_per_param":16,"gpus":8},"input_meta":{"params_b":{"label":"Parameters","unit":"billions"},"bytes_per_param":{"label":"Bytes per parameter","unit":"16 for mixed-precision Adam"},"gpus":{"label":"GPUs sharing the state"}},"assumptions":["Full sharding of parameters, gradients and optimizer states (ZeRO stage 3 or FSDP full shard).","Activations, buffers and fragmentation are extra."],"tests":[{"inputs":{},"expect":{"total_gb":112,"per_gpu_gb":14}},{"inputs":{"params_b":70,"gpus":64},"expect":{"total_gb":1120,"per_gpu_gb":17.5}}]}
```

**Sharding.** ZeRO and PyTorch FSDP split optimizer states, gradients and parameters across data-parallel workers and gather them just in time, so large models fit without tensor parallelism.

**Model parallelism.** Tensor parallelism (Megatron-LM) splits layers within a fast-interconnect domain; pipeline parallelism (GPipe, PipeDream) splits the stack; expert parallelism spreads MoE experts. Large runs combine them (“3D parallelism”). See [disaggregated serving](#disaggregated-serving) for the inference side.

**Saving memory and time.** Activation checkpointing recomputes activations in the backward pass instead of storing them; mixed precision uses BF16, and frontier runs increasingly FP8 (DeepSeek-V3 reported FP8 training at scale), and 4-bit NVFP4 pretraining has been demonstrated (NVIDIA, 2025: a 12B model on 10T tokens, comparable to an FP8 baseline); fused kernels and FlashAttention cut memory traffic. See [long context](#long-context).

**Efficiency and failures.** Model FLOPs utilization (MFU), the share of peak compute doing useful work, is a common efficiency metric. At thousands of GPUs, hardware failures happen daily; large runs report hundreds of interruptions over weeks, so checkpointing, fast restarts and health checks are core engineering.

## In practice
- For fine-tuning up to tens of billions of parameters, FSDP or DeepSpeed ZeRO on one node is often enough; add LoRA to cut memory further. See [fine-tuning in practice](#fine-tuning-practice).
- Use activation checkpointing and BF16 by default; profile before adding parallelism dimensions.
- Checkpoint often and test resuming.

## Numbers to know
> [!number]
> Formulas. Mixed-precision Adam ≈ 16 bytes per parameter of model state. Training compute ≈ 6 × parameters × tokens. MFU of 40% to 50% is considered good for large dense training.

## Pitfalls and anti-patterns
> [!pitfall] Forgetting activations
> Model state may fit while activations at your sequence length and batch size do not. Measure peak memory with a real batch.

- **Tensor parallelism across nodes.** Communication dominates; keep it within fast links.
- **Rare checkpoints.** A failure can cost hours of compute.

## Talk like an expert
The vocabulary: **data parallelism**, **ZeRO stages**, **FSDP**, **tensor parallelism**, **pipeline bubbles**, **3D parallelism**, **activation checkpointing**, **BF16 and FP8 training**, **MFU**, **all-reduce**. Experts describe runs as parallelism layouts and quote MFU. The live debate is how far low-precision training and new interconnects push the scale of single runs.

> [!hottake] At frontier scale, distributed training is mostly a reliability problem.
> **The counterargument:** algorithmic and kernel efficiency still decide how much model you get per dollar; reliability keeps runs alive, efficiency decides their value.

## Check yourself
```quiz
distributed-training
```

## Go deeper
- Rajbhandari et al., “ZeRO: Memory Optimizations Toward Training Trillion Parameter Models” (2019).
- Shoeybi et al., “Megatron-LM” (2019); Huang et al., “GPipe” (2018).
- The PyTorch FSDP and DeepSpeed documentation.

## Related
- [Scaling laws and compute](#scaling-laws)
- [Hardware](#hardware)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Memory math](#memory-math)
- [Calculus and optimization](#calculus-optimization)
