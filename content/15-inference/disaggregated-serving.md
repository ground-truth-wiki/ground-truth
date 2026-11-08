---
id: disaggregated-serving
book: 15
order: "15.7"
title: Parallelism and disaggregated serving
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [parallelism, disaggregation, serving]
visuals:
  - parallelism-variants:diagram
  - disagg-diagram:diagram
---
> [!tldr]
> Large models are split across GPUs with tensor, pipeline and expert parallelism, and scaled out with replicas. Disaggregated serving goes further: it runs prefill and decode on separate GPU pools and moves the KV cache between them, so each phase can be sized and tuned for its own bottleneck.

## Why it matters
A single GPU cannot hold the largest models, and a single configuration cannot serve both compute-bound prefill and memory-bound decode well. Long prompts arriving on a server busy with decoding cause latency spikes for everyone. Parallelism lets big models run at all; disaggregation lets them run with predictable latency at scale.

## Intuition
A busy restaurant splits its kitchen: one station preps orders in bulk, another plates and serves each dish as it is ready. Each station is staffed for its own rhythm, and a big catering order in prep does not stall the dinner service.

```viz
{"id":"parallelism-variants","component":"diagram","title":"Four ways to spread a model across GPUs, each with its own communication cost","caption":"Switch tabs. Tensor parallelism splits each layer, pipeline parallelism splits the stack of layers, expert parallelism places different experts on different GPUs, and replicas copy the whole model.","alt":"Diagram variants of tensor, pipeline, expert and data parallelism across GPUs.","data":"illustrative","w":560,"h":150,"variants":[
{"name":"Tensor","note":"Each layer’s matrices are split across GPUs, which exchange partial results at every layer. Needs very fast links, so it usually stays within one server.","nodes":[{"id":"l","label":"One layer","role":"model","x":0,"y":45,"w":120,"h":60},{"id":"g1","label":"GPU 1: half","role":"tool","x":200,"y":0,"w":140,"h":56},{"id":"g2","label":"GPU 2: half","role":"tool","x":200,"y":94,"w":140,"h":56},{"id":"out","label":"All-reduce","x":420,"y":45,"w":140,"h":60}],"edges":[{"from":"l","to":"g1"},{"from":"l","to":"g2"},{"from":"g1","to":"out"},{"from":"g2","to":"out"}]},
{"name":"Pipeline","note":"Groups of layers live on different GPUs and activations flow from one to the next. Less communication, but GPUs wait unless many micro-batches keep the pipeline full.","nodes":[{"id":"g1","label":"GPU 1","sub":"layers 1 to 20","role":"tool","x":0,"y":45,"w":160,"h":60},{"id":"g2","label":"GPU 2","sub":"layers 21 to 40","role":"tool","x":200,"y":45,"w":160,"h":60},{"id":"g3","label":"GPU 3","sub":"layers 41 to 60","role":"tool","x":400,"y":45,"w":160,"h":60}],"edges":[{"from":"g1","to":"g2","label":"activations"},{"from":"g2","to":"g3","label":"activations"}]},
{"name":"Expert","note":"In mixture-of-experts models, different experts sit on different GPUs and tokens are routed to them. Communication is all-to-all and load can be uneven.","nodes":[{"id":"r","label":"Router","role":"agent","x":0,"y":45,"w":120,"h":60,"link":"#mixture-of-experts"},{"id":"e1","label":"GPU 1: experts 1 to 32","role":"tool","x":200,"y":0,"w":200,"h":44},{"id":"e2","label":"GPU 2: experts 33 to 64","role":"tool","x":200,"y":53,"w":200,"h":44},{"id":"e3","label":"GPU 3: experts 65 to 96","role":"tool","x":200,"y":106,"w":200,"h":44}],"edges":[{"from":"r","to":"e1"},{"from":"r","to":"e2"},{"from":"r","to":"e3"}]},
{"name":"Replicas","note":"Copies of the whole model serve different requests behind a load balancer. No communication between copies; scale is linear in GPUs.","nodes":[{"id":"lb","label":"Load balancer","role":"agent","x":0,"y":45,"w":140,"h":60,"link":"#gateways-routers"},{"id":"m1","label":"Replica 1","role":"model","x":240,"y":0,"w":160,"h":44},{"id":"m2","label":"Replica 2","role":"model","x":240,"y":53,"w":160,"h":44},{"id":"m3","label":"Replica 3","role":"model","x":240,"y":106,"w":160,"h":44}],"edges":[{"from":"lb","to":"m1"},{"from":"lb","to":"m2"},{"from":"lb","to":"m3"}]}]}
```

## How it works
**Tensor parallelism** (Megatron-LM, Shoeybi et al., 2019) splits weight matrices within each layer and exchanges partial results with fast collective operations. It cuts per-GPU memory and per-token latency, and needs high-bandwidth links such as NVLink.

**Pipeline parallelism** places consecutive layers on different devices. It tolerates slower links but leaves bubbles of idle time unless many requests are in flight.

**Expert parallelism** spreads a mixture-of-experts model’s experts across GPUs; each token visits only the experts its router picks, so the cost is all-to-all communication and load balancing. See [mixture of experts](#mixture-of-experts).

**Replicas** (data parallelism for serving) copy the model and spread requests across copies; most fleets combine replicas with one of the above inside each copy.

**Disaggregated prefill and decode.** DistServe (Zhong et al., 2024), Splitwise (Patel et al., 2024) and Mooncake (Moonshot AI, 2024) showed that running prefill and decode on separate pools improves goodput: prefill GPUs batch long prompts for compute efficiency, decode GPUs keep many sequences streaming, and each pool scales with its own demand.

```viz
{"id":"disagg-diagram","component":"diagram","title":"Prefill and decode run on separate pools, joined by a fast KV cache transfer","caption":"A simplified disaggregated deployment. The router sends new requests to prefill, the finished KV cache moves to a decode worker, and tokens stream back from there. Click a component for its chapter.","alt":"Diagram of disaggregated serving: a router, a prefill pool, a KV cache transfer over a fast interconnect, a decode pool and streaming responses.","data":"illustrative","w":600,"h":200,"nodes":[
{"id":"router","label":"Router","sub":"prefix-aware","role":"agent","x":0,"y":72,"w":130,"h":56,"link":"#gateways-routers"},
{"id":"prefill","label":"Prefill pool","sub":"compute-bound, big batches","role":"model","x":170,"y":0,"w":160,"h":60},
{"id":"xfer","label":"KV transfer","sub":"NVLink, RDMA","role":"data","x":170,"y":140,"w":160,"h":56,"link":"#kv-cache"},
{"id":"decode","label":"Decode pool","sub":"memory-bound, many streams","role":"model","x":370,"y":72,"w":160,"h":60},
{"id":"user","label":"Stream","role":"human","x":550,"y":80,"w":50,"h":44}],
"edges":[{"from":"router","to":"prefill"},{"from":"prefill","to":"xfer","label":"KV cache"},{"from":"xfer","to":"decode"},{"from":"decode","to":"user"}]}
```

**The trade-offs.** Disaggregation adds the cost of moving KV caches, which can be gigabytes per request at long contexts, so it needs fast interconnects. It pays off at large scale with long prompts and strict latency targets; small deployments are usually better served by one pool with chunked prefill.

**Software.** vLLM and SGLang support disaggregated prefill and decode; NVIDIA Dynamo and the llm-d project (both 2025) orchestrate disaggregated, cache-aware serving across clusters.

## In practice
Choosing a layout:
1. **Fit the model**: the smallest tensor-parallel group that holds weights plus enough KV cache.
2. **Scale with replicas** until load balancing or memory limits bite.
3. **Use expert parallelism** for large MoE models across servers.
4. **Consider disaggregation** when long prompts cause TPOT spikes, traffic is large, and you have fast interconnects.
5. **Route by prefix** so KV caches are reused wherever they live.

## Numbers to know
> [!number]
> Rules of thumb. Keep tensor parallelism within one server’s fast interconnect, typically up to eight GPUs. KV transfer size equals the prefilled tokens times KV bytes per token: about 1 GB for an 8K-token prompt on an 8B-class model with GQA in BF16.

## Pitfalls and anti-patterns
> [!pitfall] Disaggregating a small deployment
> Two pools, KV transfer and extra orchestration add cost and failure modes that only pay off at scale.

- **Tensor parallelism across slow links.** Communication dominates and latency rises.
- **Unbalanced experts.** Hot experts become bottlenecks; monitor expert load.
- **Ignoring transfer cost at long contexts.** Gigabytes per request add up.

## Talk like an expert
The vocabulary: **tensor parallelism**, **pipeline parallelism**, **expert parallelism**, **replica**, **all-reduce**, **all-to-all**, **prefill-decode disaggregation**, **KV transfer**, **goodput**. Experts describe deployments as “TP8 with N replicas” or “disaggregated with P prefill and D decode workers”. The live debate is where disaggregation stops paying off, and how serving stacks should handle agent sessions whose KV caches persist across many requests.

> [!hottake] At frontier scale, disaggregated serving is becoming the default architecture.
> **The counterargument:** most organizations serve smaller models at moderate scale, where a single well-tuned pool with chunked prefill and prefix caching is simpler, cheaper and fast enough.

## Check yourself
```quiz
disaggregated-serving
```

## Go deeper
- Shoeybi et al., “Megatron-LM” (2019).
- Zhong et al., “DistServe” (2024); Patel et al., “Splitwise” (2024); Qin et al., “Mooncake” (2024).
- NVIDIA Dynamo and llm-d documentation.

## Related
- [Inference fundamentals](#inference-fundamentals)
- [Batching and scheduling](#batching-scheduling)
- [Mixture of experts](#mixture-of-experts)
- [Distributed training](#distributed-training)
- [Serving engines](#serving-engines)
- [MoE routing and load balancing](#moe-routing)
- [Parallelism strategies and collective communication](#parallelism-strategies)
- [Routing and autoscaling model servers](#inference-fleet-scaling)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Serving mixture-of-experts models](#moe-serving)
