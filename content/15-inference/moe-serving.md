---
id: moe-serving
book: 15
order: "15.7.1"
title: Serving mixture-of-experts models
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [mixture-of-experts, expert-parallelism, all-to-all, load-balancing, serving]
visuals: []
prerequisites: [disaggregated-serving, mixture-of-experts]
---
> [!tldr]
> A mixture-of-experts model keeps every expert in memory but sends each token to only a few, so serving it well means spreading experts across many GPUs and moving tokens to them and back at every MoE layer. Large deployments pair data-parallel attention with expert-parallel MoE layers, fast all-to-all kernels, load balancing for hot experts and overlap of communication with compute. Remember that at scale an MoE layer is as much a communication and load-balancing problem as a matrix-multiplication problem.

## Key ideas

- **Why MoE changes serving.** All experts must stay resident (see [mixture of experts](#mixture-of-experts)), and DeepSeek's stated reason for large-scale expert parallelism (EP) is that it scales the batch size, which makes matrix computation more efficient, while leaving each GPU fewer experts to read, which cuts memory access, for higher throughput and lower latency ([DeepSeek, “Day 6: One More Thing, DeepSeek-V3/R1 Inference System Overview”](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md) (2025)). The SGLang team attributes its decode gains over a tensor-parallel (TP16) baseline largely to 4× larger batch sizes enabled by EP, and notes that EP brings irregular all-to-all communication and workload imbalance ([LMSYS, “Deploying DeepSeek with PD Disaggregation and Large-Scale Expert Parallelism on 96 H100 GPUs”](https://lmsys.org/blog/2025-05-05-large-scale-ep/) (2025)).
- **Data-parallel attention, expert-parallel experts.** In vLLM the EP size is TP × DP: with TP = 1, attention weights are replicated on every data-parallel rank while the experts are spread over all ranks ([vLLM, Expert Parallel Deployment](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment.html)). Data-parallel attention eliminates KV-cache duplication across devices, which SGLang uses for DeepSeek's MLA attention ([LMSYS](https://lmsys.org/blog/2025-05-05-large-scale-ep/)), and llm-d serves wide EP the same way, with rank-aware routing ([llm-d architecture](https://llm-d.ai/docs/architecture)).
- **All-to-all dispatch and combine.** Each MoE layer dispatches tokens to the GPUs that hold their experts and combines the results back; DeepSeek sends dispatch in FP8 and combine in BF16 ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)), and DeepEP provides high-throughput and low-latency all-to-all kernels with FP8 dispatch, over NVLink inside a node and RDMA across nodes ([DeepEP](https://github.com/deepseek-ai/DeepEP)). As of November 2026, vLLM offers `deepep_high_throughput` for multi-node prefill, `deepep_low_latency` with CUDA-graph support for decode, FlashInfer backends for multi-node NVLink systems and MoRI for AMD Instinct ([vLLM](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment.html)), and SGLang notes that DeepEP's normal mode cannot run under CUDA graphs, while low-latency mode can but preallocates a fixed amount of memory ([LMSYS](https://lmsys.org/blog/2025-05-05-large-scale-ep/)).
- **Hot experts and redundant copies.** Some experts are busier than others, so DeepSeek runs an expert-parallel load balancer that minimizes the largest dispatch load on any GPU, and deploys 32 redundant routed experts in both its prefill and decode units ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). As of November 2026, vLLM's expert-parallel load balancer (EPLB) tracks a window of engine steps (1,000 by default) and rebalances every 3,000 steps by default, with no redundant experts unless configured; redundant experts must fit in GPU memory, so EPLB may not suit deployments short on memory or KV-cache space ([vLLM](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment.html)).
- **Hide communication behind compute.** Two-batch (dual micro-batch) overlap splits a batch in two so one micro-batch's communication runs while the other computes; DeepSeek uses it in prefill and a five-stage pipeline in decode ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). The expert matmuls run as grouped GEMMs: SGLang pairs DeepGEMM's contiguous layout with the dynamic shapes of prefill, and its masked layout with low-latency dispatch in decode ([LMSYS](https://lmsys.org/blog/2025-05-05-large-scale-ep/)).
- **Dated case studies, split by phase.** DeepSeek's early-2025 write-up describes prefill units of 4 nodes (EP32, 9 routed and 1 shared expert per GPU) and decode units of 18 nodes (EP144, 2 routed and 1 shared expert per GPU), averaging about 73.7k input tokens per second (including cache hits) and 14.8k output tokens per second per H800 node over 24 hours ([DeepSeek](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md)). In May 2025 an open SGLang reproduction on 12 nodes of 8 H100 GPUs, with prefill-decode disaggregation, reached 52.3k input and 22.3k output tokens per second per node for 2,000-token inputs ([LMSYS](https://lmsys.org/blog/2025-05-05-large-scale-ep/)); vLLM's recipe likewise runs prefill on `deepep_high_throughput` and decode on `deepep_low_latency`, joined by NIXL KV transfer ([vLLM](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment.html)).

## Planned visuals

- **`diagram`** with variants: tensor-parallel, expert-parallel, and data-parallel-attention-plus-EP layouts across 8 GPUs, showing where attention weights, KV caches and experts live in each.
- **`stepper`:** one MoE layer in decode, step by step: routing, FP8 dispatch over all-to-all, grouped GEMM, BF16 combine, then the same layer with two micro-batches overlapping communication and compute.
- **`calculator`:** experts per GPU and expert memory per GPU from routed experts, redundant experts, EP degree and bytes per expert, with tests against DeepSeek's published units (9 routed experts per GPU at EP32 and 2 at EP144, with 32 redundant experts).

## Talk like an expert

Experts describe deployments as "DP attention with EP32 for prefill and EP144 for decode" and talk about dispatch and combine, all-to-all, normal and low-latency kernels, hot experts, EPLB and redundant experts, two-batch overlap and grouped GEMMs. They size an MoE deployment by communication and load balance, not only by memory.

## Go deeper

- DeepSeek, [“Day 6: One More Thing, DeepSeek-V3/R1 Inference System Overview”](https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md) (2025).
- LMSYS (SGLang team), [“Deploying DeepSeek with PD Disaggregation and Large-Scale Expert Parallelism on 96 H100 GPUs”](https://lmsys.org/blog/2025-05-05-large-scale-ep/) (2025).
- [vLLM, Expert Parallel Deployment](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment.html), with the all-to-all backends and EPLB settings.
- [DeepEP](https://github.com/deepseek-ai/DeepEP), DeepSeek's expert-parallel communication library.

## Related

- [Parallelism and disaggregated serving](#disaggregated-serving)
- [Mixture of Experts](#mixture-of-experts)
- [MoE routing and load balancing](#moe-routing)
- [Batching and scheduling](#batching-scheduling)
- [Parallelism strategies and collective communication](#parallelism-strategies)
- [Routing and autoscaling model servers](#inference-fleet-scaling)
