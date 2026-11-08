---
id: inference-fleet-scaling
book: 15
order: "15.8.1"
title: Routing and autoscaling model servers
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [load-balancing, prefix-caching, autoscaling, cold-starts, kubernetes]
visuals: []
prerequisites: [batching-scheduling, serving-engines]
---
> [!tldr]
> A fleet of model servers needs a router that knows what each replica holds and how busy it is, and an autoscaler that adds and removes GPUs against latency targets. Generic load balancers and request-count autoscalers fit poorly, because latency depends on what each request contains, prefix caches live on single replicas, and decode is limited by KV-cache memory. Remember that the best replica is usually the one that already holds the request's prefix, as long as it is not overloaded, and that a new replica is useful only after a slow cold start.

## Key ideas

- **Why web-style tools misfit.** Horizontal pod autoscaling and KEDA suit web services because load and latency are roughly linear there, but LLM latency depends on request content, not just request count: prefill cost grows with input length, while decode cost depends on concurrent sequences and KV-cache usage ([NVIDIA Dynamo Planner overview](https://docs.nvidia.com/dynamo/latest/knowledge-base/modular-components/planner/overview)). Prefix caches also live on individual replicas, so llm-d tracks cache state across all model servers and uses prefix-cache-aware routing to maximize cache hits ([llm-d architecture](https://llm-d.ai/docs/architecture)).
- **Routing signals.** The Kubernetes Gateway API Inference Extension turns a gateway into an inference gateway: an InferencePool groups model-server endpoints, and an endpoint picker chooses one from metrics the servers report, such as prefix-cache status and loaded LoRA adapters, with routing by model name and serving priorities ([Gateway API Inference Extension](https://gateway-api-inference-extension.sigs.k8s.io/)). As of November 2026, llm-d's router scores pods on real-time metrics and KV-cache affinity, tracks cache state across servers as events arrive, and predicts TTFT and TPOT to enforce latency SLOs, while NVIDIA Dynamo's router weighs worker load against KV-cache overlap ([llm-d architecture](https://llm-d.ai/docs/architecture); [NVIDIA Dynamo](https://github.com/ai-dynamo/dynamo)).
- **Sharing KV caches across replicas.** Mooncake, Moonshot AI's serving system for Kimi, pools KV caches in the cluster's underused CPU, DRAM, SSD and NIC resources, and in experiments on real traces it raised effective request capacity by 59% to 498% over baseline methods while meeting SLOs (Qin et al., [“Mooncake: Trading More Storage for Less Computation: A KVCache-centric Architecture for Serving LLM Chatbot”](https://www.usenix.org/conference/fast25/presentation/qin) (2025)). As of November 2026, llm-d offloads KV blocks to CPU and SSD tiers and lets a server pull cached prefix blocks from a peer's CPU tier instead of recomputing them, and Dynamo's KV block manager offloads from GPU to CPU, SSD and remote storage ([llm-d architecture](https://llm-d.ai/docs/architecture); [NVIDIA Dynamo](https://github.com/ai-dynamo/dynamo)).
- **Scale on LLM signals.** As of November 2026, KServe can scale model servers with KEDA on vLLM metrics such as waiting requests or KV-cache usage, and its examples target running requests per pod ([KServe, Autoscaling](https://kserve.github.io/website/docs/model-serving/generative-inference/autoscaling)); llm-d scales with KEDA on real-time queuing signals such as queue depth, pool saturation and token backlog, or on estimated latency headroom against SLO targets ([llm-d architecture](https://llm-d.ai/docs/architecture)). NVIDIA Dynamo's Planner instead scales prefill and decode replicas separately; with its SLA target it aims at TTFT and ITL goals and can combine throughput-based scaling on traffic forecasts (every 180 seconds by default), which sets a capacity floor, with load-based scaling on engine metrics (every 5 seconds by default) above that floor ([NVIDIA Dynamo Planner overview](https://docs.nvidia.com/dynamo/latest/knowledge-base/modular-components/planner/overview)).
- **Shortening cold starts.** vLLM finishes all compilation before it serves any request, larger CUDA-graph capture settings lengthen startup, and copying its compile cache to new instances skips Inductor compilation ([vLLM, torch.compile integration](https://docs.vllm.ai/en/latest/design/torch_compile.html)). For loading, ServerlessLLM uses a loading-optimized checkpoint format, a multi-tier loader and locality-aware placement, and reports 10 to 200 times lower latency than serverless baselines (Fu et al., [“ServerlessLLM: Low-Latency Serverless Inference for Large Language Models”](https://www.usenix.org/conference/osdi24/presentation/fu) (2024)), while the Run:ai Model Streamer reads safetensors concurrently from S3, GCS or Azure storage into GPU memory, with a sharded variant in which each tensor- or pipeline-parallel worker reads only its own shard ([vLLM, Run:ai Model Streamer](https://docs.vllm.ai/en/stable/models/extensions/runai_model_streamer/)).

## Planned visuals

- **`sequence`:** one request through a gateway, an endpoint picker and three replicas: the picker reads queue depth, KV-cache use and prefix-cache hits, picks a replica, and the replica's KV events update the picker's index.
- **`compare`:** autoscaling on request count next to a planner that sizes prefill and decode pools separately, under the same burst of long prompts, highlighting which pool runs out first.
- **`stepper`:** the anatomy of a cold start, phase by phase (GPU, image, weights, compilation and CUDA graphs, cache warmup), each with the technique that shortens it: weight streaming, sharded checkpoints, compile caches, warm replicas.

## Talk like an expert

Experts separate routing between replicas of one model from the API-level model gateways in [gateways and routers](#gateways-routers), and talk about prefix-aware and KV-aware routing, endpoint pickers, KV events, cache hit rate, scaling on queue depth or KV-cache use, SLA planners, cold starts and scale to zero. They judge a routing or scaling change by what it does to cache hit rate, TTFT, goodput and cost per task (see [cost and capacity](#cost-capacity)).

## Go deeper

- [Gateway API Inference Extension](https://gateway-api-inference-extension.sigs.k8s.io/), the official Kubernetes project for inference-aware routing.
- [llm-d architecture](https://llm-d.ai/docs/architecture), for cache-aware routing, tiered KV caches and autoscaling in one stack.
- [NVIDIA Dynamo Planner overview](https://docs.nvidia.com/dynamo/latest/knowledge-base/modular-components/planner/overview), for SLA-driven sizing of prefill and decode pools.
- Qin et al., [“Mooncake: Trading More Storage for Less Computation: A KVCache-centric Architecture for Serving LLM Chatbot”](https://www.usenix.org/conference/fast25/presentation/qin) (2025), FAST '25 best paper.

## Related

- [Serving engines](#serving-engines)
- [Batching and scheduling](#batching-scheduling)
- [Parallelism and disaggregated serving](#disaggregated-serving)
- [Gateways and routers](#gateways-routers)
- [Cost and capacity](#cost-capacity)
- [Serving mixture-of-experts models](#moe-serving)
