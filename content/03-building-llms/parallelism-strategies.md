---
id: parallelism-strategies
book: 3
order: "3.3.1"
title: Parallelism strategies and collective communication
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [parallelism, fsdp, tensor-parallelism, collectives, nccl]
visuals: []
prerequisites: [distributed-training]
---
> [!tldr]
> Training a large model on thousands of GPUs splits the work along several axes at once: the batch (data parallelism and sharding), each layer's matrices (tensor), the sequence (context), the layer stack (pipeline) and the experts (expert parallelism). Each axis has its own communication pattern, and a good layout puts the chattiest axes on the fastest links. Remember the order of decisions: fit one step in memory, reach the target batch, then maximize throughput.

## Key ideas

- **Every strategy is a communication pattern.** NCCL provides all-reduce, broadcast, reduce, all-gather, reduce-scatter, all-to-all, gather and scatter, and notes that a reduce-scatter followed by an all-gather is equivalent to an all-reduce ([NCCL documentation, “Collective Operations”](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html)). Data parallelism all-reduces gradients, ZeRO and FSDP reduce-scatter gradients and all-gather parameters, tensor parallelism with sequence parallelism all-gathers and reduce-scatters activations, ring attention passes key-value blocks between neighbors, and expert parallelism routes tokens with all-to-all (Tazi et al., [“The Ultra-Scale Playbook: Training LLMs on GPU Clusters”](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md) (2025)).
- **Estimate communication from bytes and bandwidth.** In a ring all-reduce over N GPUs, each GPU sends and receives 2(N − 1)/N times the message size, close to twice the data when N is large ([Tazi et al., 2025](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md)), and an H100 has about 450 GB/s of NVLink bandwidth inside its 8-GPU node versus about 50 GB/s per GPU over InfiniBand, while a GB200 NVL72 rack forms one 72-GPU NVLink domain (Austin et al., [“How to Think About GPUs”](https://jax-ml.github.io/scaling-book/gpus/) (2025)). The same authors keep tensor and expert parallelism within a few nodes to limit latency overhead, call pipelining "basically free" in communication because it passes only small activations between stages, and note that NCCL uses different implementations depending on latency needs and topology ([Austin et al., 2025](https://jax-ml.github.io/scaling-book/gpus/)).
- **Data parallelism and sharding.** Data parallelism groups gradients into buckets and starts each bucket's all-reduce while earlier layers are still in the backward pass; ZeRO stage 1 shards optimizer states, stage 2 also gradients and stage 3 also parameters, at about 1.5 times stage 2's communication ([Tazi et al., 2025](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md); Rajbhandari et al., [“ZeRO: Memory Optimizations Toward Training Trillion Parameter Models”](https://arxiv.org/abs/1910.02054) (2019)). PyTorch's FSDP2 shards each parameter along dimension 0 as a DTensor, and on a 2D device mesh it replicates across one dimension and shards across the other, which is hybrid sharding (HSDP) ([PyTorch 2.15 documentation, `fully_shard`](https://docs.pytorch.org/docs/2.15/distributed.fsdp.fully_shard.html)).
- **Tensor, sequence and context parallelism.** Megatron-style tensor parallelism splits each layer's matrices, and adding sequence parallelism with selective activation recomputation cut activation memory 5x and reached 54.2% MFU on a 530B model on 2,240 A100 GPUs, against 42.1% with activation recomputation (Korthikanti et al., [“Reducing Activation Recomputation in Large Transformer Models”](https://arxiv.org/abs/2205.05198) (2022)). For long sequences, ring attention passes key-value blocks around a ring of devices while attention is computed (Liu et al., [“Ring Attention with Blockwise Transformers for Near-Infinite Context”](https://arxiv.org/abs/2310.01889) (2023)), a zig-zag token order balances causal-attention work across GPUs ([Tazi et al., 2025](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md)), and DeepSpeed-Ulysses instead uses all-to-all over the sequence dimension (Jacobs et al., [“DeepSpeed Ulysses: System Optimizations for Enabling Training of Extreme Long Sequence Transformer Models”](https://arxiv.org/abs/2309.14509) (2023)).
- **Pipeline schedules fight the bubble.** With p stages and m micro-batches, all-forward-all-backward and 1F1B both leave idle time of about (p − 1)/m relative to useful compute, 1F1B holds fewer activations, and interleaving v chunks per GPU cuts the bubble to (p − 1)/(v·m) at v times the communication ([Tazi et al., 2025](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md)); composing tensor, pipeline and data parallelism, Megatron-LM ran training iterations of a 1T-parameter model at 502 petaFLOP/s on 3,072 GPUs, 52% of theoretical peak per GPU (Narayanan et al., [“Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM”](https://arxiv.org/abs/2104.04473) (2021)). Zero Bubble splits the backward pass into input-gradient and weight-gradient parts to fill idle slots, up to 23% faster than 1F1B at similar memory (Qi et al., [“Zero Bubble Pipeline Parallelism”](https://arxiv.org/abs/2401.10241) (2023)), and DeepSeek-V3's DualPipe overlaps forward and backward computation with communication (DeepSeek-AI, [“DeepSeek-V3 Technical Report”](https://arxiv.org/abs/2412.19437) (2024)).
- **Combine the axes in order, and choose step by step.** Llama 3 405B ordered its 4D mesh as [TP, CP, PP, DP] from innermost to outermost, because the innermost dimension needs the most bandwidth and lowest latency while FSDP-style data parallelism tolerates latency by prefetching (Grattafiori et al., [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024)); DeepSeek-V3 instead used 16-way pipeline, 64-way expert and ZeRO-1 data parallelism with no tensor parallelism ([DeepSeek-AI, 2024](https://arxiv.org/abs/2412.19437)). The Ultra-Scale Playbook's method is to fit one training step in memory, reach the target global batch with data or context parallelism and gradient accumulation, then optimize throughput, for example by scaling tensor parallelism up to about the node size and moving to pipeline parallelism when data-parallel communication becomes the bottleneck ([Tazi et al., 2025](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md)), and PyTorch-native TorchTitan composes such layouts for Llama 3.1 models from 8B to 405B (Liang et al., [“TorchTitan: One-stop PyTorch native solution for production ready LLM pre-training”](https://arxiv.org/abs/2410.06511) (2024)).

## Planned visuals

- **`stepper`:** a ring all-reduce over four GPUs, first the reduce-scatter phase and then the all-gather phase, with the bytes each GPU sends at every step.
- **`diagram`:** a 4D device mesh with tensor parallelism inside the NVLink domain and context, pipeline and data parallelism across nodes, each axis labeled with its collective; variants switch between the Llama 3 and DeepSeek-V3 layouts.
- **`calculator`:** pipeline bubble from stages, micro-batches and interleaved chunks, plus ring all-reduce time from message size, GPU count and link bandwidth.

## Talk like an expert

Experts describe a run as a mesh, such as "TP8 inside the node, PP across nodes, FSDP over the rest", name the collective on each axis, and talk about bubbles, overlap and NVLink domains. When a layout underperforms, the first question is which collective sits on the slow link; serving has its own version of this problem ([Parallelism and disaggregated serving](#disaggregated-serving)), and hangs and stragglers belong to [Fault tolerance and checkpointing at scale](#training-reliability).

## Go deeper

- Tazi et al., [“The Ultra-Scale Playbook: Training LLMs on GPU Clusters”](https://huggingface.co/spaces/nanotron/ultrascale-playbook/blob/main/ultra_blog.md) (2025).
- Austin et al., [“How to Think About GPUs”](https://jax-ml.github.io/scaling-book/gpus/), in *How to Scale Your Model* (2025).
- Narayanan et al., [“Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM”](https://arxiv.org/abs/2104.04473) (2021).
- Korthikanti et al., [“Reducing Activation Recomputation in Large Transformer Models”](https://arxiv.org/abs/2205.05198) (2022).

## Related

- [Distributed training](#distributed-training)
- [Parallelism and disaggregated serving](#disaggregated-serving)
- [Hardware](#hardware)
- [Fault tolerance and checkpointing at scale](#training-reliability)
- [Mixed and low-precision training](#low-precision-training)
- [MoE routing and load balancing](#moe-routing)
